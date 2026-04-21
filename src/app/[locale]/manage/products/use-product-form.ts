import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generateSKUs } from '@/lib/utils'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { CreateProductBody, CreateProductBodyType } from '@/schemaValidations/product.schema'

// ─── Language config ──────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
    { id: 'vi', label: 'Tiếng Việt' },
    { id: 'en', label: 'English' },
]

export const DEFAULT_LANGUAGES = SUPPORTED_LANGUAGES.map((l) => l.id)

// ─── Default values ───────────────────────────────────────────────────────────

export const makeDefaultValues = (): CreateProductBodyType => ({
    publishedAt: null,
    name: '',
    basePrice: 0,
    virtualPrice: 0,
    brandId: 0,
    images: [],
    categories: [],
    variants: [],
    skus: [],
    specGroups: [],
    highlights: DEFAULT_LANGUAGES.map((languageId) => ({
        languageId,
        summary: '',
        sections: [],
    })),
})

// ─── Tab config ───────────────────────────────────────────────────────────────

export type TabKey = 'basic' | 'images' | 'variants' | 'specs' | 'highlights'

export const TABS: { key: TabKey; label: string }[] = [
    { key: 'basic', label: 'Thông tin cơ bản' },
    { key: 'images', label: 'Hình ảnh' },
    { key: 'variants', label: 'Phân loại & SKU' },
    { key: 'specs', label: 'Thông số kỹ thuật' },
    { key: 'highlights', label: 'Đặc điểm nổi bật' },
]

// ─── SKU merge helper ─────────────────────────────────────────────────────────
// Merge SKUs mới generate từ variants với SKUs cũ (giữ lại price/stock/image)
// Key: value string (vd: "đen", "bạc", "đen-128GB")

function mergeSKUs(
    newSkus: { value: string }[],
    oldSkus: CreateProductBodyType['skus']
): CreateProductBodyType['skus'] {
    return newSkus.map((ns) => {
        const old = oldSkus.find((o) => o.value === ns.value)
        return {
            value: ns.value,
            price: old?.price ?? 0,
            stock: old?.stock ?? 0,
            image: old?.image ?? '',
        }
    })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProductForm({
    categoryList,
    brandList,
}: {
    categoryList: CategoryListResType['data']
    brandList: BrandListResType['data']
}) {
    const [activeTab, setActiveTab] = useState<TabKey>('basic')
    const [imageUrl, setImageUrl] = useState('')
    const [optionInputs, setOptionInputs] = useState<Record<number, string>>({})
    const [openParents, setOpenParents] = useState<Record<number, boolean>>({})
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({})
    const [categorySearch, setCategorySearch] = useState('')
    const [brandSearch, setBrandSearch] = useState('')

    // Flag để skip SKU auto-generate khi đang load data từ API
    // Tránh effect variants overwrite SKUs vừa được reset từ server
    const isLoadingFromServer = useRef(false)

    const dragVariantIndex = useRef<number | null>(null)
    const dragOverVariantIndex = useRef<number | null>(null)

    const form = useForm<CreateProductBodyType>({
        resolver: zodResolver(CreateProductBody) as any,
        defaultValues: makeDefaultValues(),
    })

    // ── Variants field array ──
    const {
        fields: variantFields,
        append: appendVariant,
        remove: removeVariant,
        move: moveVariant,
    } = useFieldArray({ control: form.control, name: 'variants' })

    // ── Auto-generate SKUs khi variants thay đổi ──
    // Dùng ref để bỏ qua lần đầu tiên sau form.reset() (khi load từ server)
    const prevVariantsRef = useRef<string>('')

    const watchedVariants = form.watch('variants')

    useEffect(() => {
        const serialized = JSON.stringify(watchedVariants)

        // Skip nếu đang trong quá trình load từ server
        if (isLoadingFromServer.current) {
            prevVariantsRef.current = serialized
            return
        }

        // Skip nếu variants không thực sự thay đổi
        if (serialized === prevVariantsRef.current) return
        prevVariantsRef.current = serialized

        const newSkus = generateSKUs(watchedVariants)
        const oldSkus = form.getValues('skus') ?? []
        form.setValue('skus', mergeSKUs(newSkus, oldSkus), { shouldDirty: false })
    }, [JSON.stringify(watchedVariants)])

    // ── Spec groups field array ──
    const {
        fields: specGroupFields,
        append: appendSpecGroup,
        remove: removeSpecGroup,
    } = useFieldArray({ control: form.control, name: 'specGroups' })

    // ── Filtered lists ──
    const filteredCategoryList = categorySearch.trim()
        ? categoryList
            .map((parent) => ({
                ...parent,
                childrenCategories: (parent.childrenCategories || []).filter((c) =>
                    c.name.toLowerCase().includes(categorySearch.toLowerCase())
                ),
            }))
            .filter(
                (parent) =>
                    (parent.childrenCategories || []).length > 0 ||
                    parent.name.toLowerCase().includes(categorySearch.toLowerCase())
            )
        : categoryList

    const filteredBrandList = brandSearch.trim()
        ? brandList.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
        : brandList

    // ── Image handlers ──
    const handleAddImage = () => {
        const url = imageUrl.trim()
        if (!url) return
        const current = form.getValues('images') ?? []
        if (!current.includes(url)) form.setValue('images', [...current, url])
        setImageUrl('')
    }

    const handleRemoveImage = (url: string) => {
        form.setValue('images', (form.getValues('images') ?? []).filter((img) => img !== url))
    }

    // ── Category handlers ──
    const handleToggleCategory = (childId: number, checked: boolean) => {
        const current = form.getValues('categories') ?? []

        // Tìm parent chứa child này
        const parent = categoryList.find((p) =>
            (p.childrenCategories || []).some((c) => c.id === childId)
        )

        if (checked) {
            const toAdd = [childId]
            // Thêm parentId nếu chưa có
            if (parent && !current.includes(parent.id)) {
                toAdd.push(parent.id)
            }
            form.setValue('categories', [...current, ...toAdd])
        } else {
            const afterRemoveChild = current.filter((id) => id !== childId)

            // Nếu không còn child nào của parent được chọn → bỏ luôn parentId
            if (parent) {
                const siblingIds = (parent.childrenCategories || []).map((c) => c.id)
                const hasOtherSelectedSibling = siblingIds.some(
                    (sibId) => sibId !== childId && afterRemoveChild.includes(sibId)
                )
                if (!hasOtherSelectedSibling) {
                    form.setValue('categories', afterRemoveChild.filter((id) => id !== parent.id))
                    return
                }
            }

            form.setValue('categories', afterRemoveChild)
        }
    }

    const toggleParent = (parentId: number) =>
        setOpenParents((prev) => ({ ...prev, [parentId]: !prev[parentId] }))

    // ── Variant handlers ──
    const handleAddOption = (variantIndex: number) => {
        const input = (optionInputs[variantIndex] ?? '').trim()
        if (!input) return
        const current = form.getValues(`variants.${variantIndex}.options`) ?? []
        if (!current.includes(input)) {
            form.setValue(`variants.${variantIndex}.options`, [...current, input])
        }
        setOptionInputs((prev) => ({ ...prev, [variantIndex]: '' }))
    }

    const handleRemoveOption = (variantIndex: number, option: string) => {
        form.setValue(
            `variants.${variantIndex}.options`,
            (form.getValues(`variants.${variantIndex}.options`) ?? []).filter((o) => o !== option)
        )
    }

    const onDragStart = (index: number) => {
        dragVariantIndex.current = index
    }
    const onDragEnter = (index: number) => {
        dragOverVariantIndex.current = index
    }
    const onDragEnd = () => {
        const from = dragVariantIndex.current
        const to = dragOverVariantIndex.current
        if (from !== null && to !== null && from !== to) moveVariant(from, to)
        dragVariantIndex.current = null
        dragOverVariantIndex.current = null
    }

    // ── Spec group handlers ──
    const addSpecGroup = () => {
        const nextIdx = specGroupFields.length
        appendSpecGroup({
            key: '',
            sortOrder: nextIdx,
            translations: DEFAULT_LANGUAGES.map((languageId) => ({ languageId, label: '' })),
            specs: [
                {
                    key: '',
                    translations: DEFAULT_LANGUAGES.map((languageId) => ({
                        languageId,
                        label: '',
                        value: '',
                    })),
                },
            ],
        })
        setExpandedGroups((prev) => ({ ...prev, [nextIdx]: true }))
    }

    const handleRemoveSpecGroup = (gIdx: number) => {
        removeSpecGroup(gIdx)
        setExpandedGroups((prev) => {
            const next: Record<number, boolean> = {}
            Object.entries(prev).forEach(([k, v]) => {
                const ki = Number(k)
                if (ki < gIdx) next[ki] = v
                else if (ki > gIdx) next[ki - 1] = v
            })
            return next
        })
    }

    const addSpecItem = (gIdx: number) => {
        const current = form.getValues(`specGroups.${gIdx}.specs`) ?? []
        form.setValue(`specGroups.${gIdx}.specs`, [
            ...current,
            {
                key: '',
                translations: DEFAULT_LANGUAGES.map((languageId) => ({
                    languageId,
                    label: '',
                    value: '',
                })),
            },
        ])
    }

    const removeSpecItem = (gIdx: number, sIdx: number) => {
        const current = form.getValues(`specGroups.${gIdx}.specs`) ?? []
        form.setValue(
            `specGroups.${gIdx}.specs`,
            current.filter((_, i) => i !== sIdx)
        )
    }

    // ── Highlight section handlers ──
    const addHighlightSection = (langId: string) => {
        const langIdx = DEFAULT_LANGUAGES.indexOf(langId)
        if (langIdx === -1) return
        const current = form.getValues(`highlights.${langIdx}.sections`) ?? []
        form.setValue(`highlights.${langIdx}.sections`, [
            ...current,
            { heading: '', content: '', sortOrder: current.length },
        ])
    }

    const removeHighlightSection = (langId: string, sIdx: number) => {
        const langIdx = DEFAULT_LANGUAGES.indexOf(langId)
        if (langIdx === -1) return
        const current = form.getValues(`highlights.${langIdx}.sections`) ?? []
        form.setValue(
            `highlights.${langIdx}.sections`,
            current.filter((_, i) => i !== sIdx)
        )
    }

    // ── Tab navigation ──
    const goNextTab = () => {
        const idx = TABS.findIndex((t) => t.key === activeTab)
        if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key)
    }

    const goPrevTab = () => {
        const idx = TABS.findIndex((t) => t.key === activeTab)
        if (idx > 0) setActiveTab(TABS[idx - 1].key)
    }

    // ── Reset ──
    const resetFormState = () => {
        form.reset(makeDefaultValues())
        prevVariantsRef.current = ''
        isLoadingFromServer.current = false
        setImageUrl('')
        setOptionInputs({})
        setOpenParents({})
        setCategorySearch('')
        setBrandSearch('')
        setExpandedGroups({})
        setActiveTab('basic')
    }

    // ── Watched values ──
    const skus = form.watch('skus') ?? []
    const watchedSpecGroups = form.watch('specGroups') ?? []
    const watchedHighlights = form.watch('highlights') ?? []

    return {
        form,
        isLoadingFromServer,
        activeTab, setActiveTab, goNextTab, goPrevTab,
        imageUrl, setImageUrl, handleAddImage, handleRemoveImage,
        categorySearch, setCategorySearch,
        openParents, setOpenParents,
        toggleParent, handleToggleCategory,
        filteredCategoryList,
        brandSearch, setBrandSearch,
        filteredBrandList,
        variantFields, appendVariant, removeVariant,
        optionInputs, setOptionInputs,
        handleAddOption, handleRemoveOption,
        onDragStart, onDragEnter, onDragEnd,
        specGroupFields,
        expandedGroups, setExpandedGroups,
        addSpecGroup, handleRemoveSpecGroup,
        addSpecItem, removeSpecItem,
        watchedSpecGroups,
        addHighlightSection, removeHighlightSection,
        watchedHighlights,
        skus,
        resetFormState,
    }
}