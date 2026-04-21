'use client'
import { useEffect, useRef } from 'react'
import { handleErrorApi } from '@/lib/utils'
import { useGetProductQuery, useUpdateProductMutation } from '@/queries/useProduct'
import { toast } from '@/components/ui/use-toast'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { useProductForm, SUPPORTED_LANGUAGES } from './use-product-form'
import { ProductDialog } from './product-dialog'
import { CreateProductBodyType } from '@/schemaValidations/product.schema'

export default function EditProduct({
  id,
  setId,
  onSubmitSuccess,
  categoryList,
  brandList
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
  categoryList: CategoryListResType['data']
  brandList: BrandListResType['data']
}) {
  const updateProductMutation = useUpdateProductMutation()
  const { data } = useGetProductQuery({ enabled: Boolean(id), id: id as number })

  const productForm = useProductForm({ categoryList, brandList })
  const { form, resetFormState, setExpandedGroups, isLoadingFromServer } = productForm

  // Track id đã load vào form, tránh reset lại sau khi mutation refetch
  const loadedIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!data) return
    const p = data.payload

    // Không load lại nếu cùng id (tránh overwrite khi React Query refetch sau mutation)
    if (loadedIdRef.current === p.id) return

    // Bật flag để effect variants không overwrite SKUs trong lúc reset
    isLoadingFromServer.current = true
    loadedIdRef.current = p.id

    // ── categories: API trả về flat array (đã là child category) ──
    const categories = (p.categories ?? []).map((c: any) => c.id)

    // ── variants ──
    const variants = (p.variants ?? []).map((v: any) => ({
      value: v.value ?? '',
      options: Array.isArray(v.options) ? v.options : []
    }))

    // ── skus: giữ nguyên price/stock/image từ server ──
    const skus = (p.skus ?? []).map((sku: any) => ({
      value: sku.value ?? '',
      price: Number(sku.price ?? 0),
      stock: Number(sku.stock ?? 0),
      image: sku.image ?? ''
    }))

    // ── specGroups ──
    const specGroups = (p.specGroups ?? []).map((group: any) => ({
      key: group.key ?? '',
      sortOrder: group.sortOrder ?? 0,
      translations: SUPPORTED_LANGUAGES.map((lang) => {
        const existing = (group.translations ?? []).find((t: any) => t.languageId === lang.id)
        return { languageId: lang.id, label: existing?.label ?? '' }
      }),
      specs: (group.specs ?? []).map((spec: any) => ({
        key: spec.key ?? '',
        translations: SUPPORTED_LANGUAGES.map((lang) => {
          const existing = (spec.translations ?? []).find((t: any) => t.languageId === lang.id)
          return {
            languageId: lang.id,
            label: existing?.label ?? '',
            value: existing?.value ?? ''
          }
        })
      }))
    }))

    // ── highlights: index cố định theo SUPPORTED_LANGUAGES (vi=0, en=1) ──
    const highlights = SUPPORTED_LANGUAGES.map((lang) => {
      const pt = (p.productTranslations ?? []).find((t: any) => t.languageId === lang.id)
      const h = pt?.highlights
      return {
        languageId: lang.id,
        summary: h?.summary ?? '',
        sections: (h?.sections ?? []).map((s: any) => ({
          heading: s.heading ?? '',
          content: s.content ?? '',
          sortOrder: s.sortOrder ?? 0
        }))
      }
    })

    form.reset({
      publishedAt: p.publishedAt ?? null,
      name: p.name ?? '',
      basePrice: Number(p.basePrice ?? 0),
      virtualPrice: Number(p.virtualPrice ?? 0),
      brandId: Number(p.brandId ?? 0),
      images: p.images ?? [],
      categories,
      variants,
      skus,
      specGroups,
      highlights
    })

    // Mở tất cả spec groups
    if (specGroups.length) {
      const expanded: Record<number, boolean> = {}
      specGroups.forEach((_: any, i: number) => (expanded[i] = true))
      setExpandedGroups(expanded)
    }

    // Tắt flag sau một tick để effect variants không fire trong lúc reset
    setTimeout(() => {
      isLoadingFromServer.current = false
    }, 0)
  }, [data])

  // Reset loadedIdRef khi đóng dialog
  useEffect(() => {
    if (!id) {
      loadedIdRef.current = null
    }
  }, [id])

  const reset = () => {
    loadedIdRef.current = null
    setId(undefined)
    resetFormState()
  }

  const onSubmit = async (values: CreateProductBodyType) => {
    if (updateProductMutation.isPending) return
    try {
      // Lấy trực tiếp từ form.getValues() để chắc chắn có đủ tất cả fields
      // (values từ handleSubmit có thể bị Zod strip nếu schema không khớp hoàn toàn)
      const raw = form.getValues()

      const payload: CreateProductBodyType = {
        publishedAt: '2026-04-10T21:12:04.546Z',
        name: raw.name,
        basePrice: Number(raw.basePrice),
        virtualPrice: Number(raw.virtualPrice),
        brandId: Number(raw.brandId),
        images: raw.images ?? [],
        categories: raw.categories ?? [],
        variants: raw.variants ?? [],
        skus: (raw.skus ?? []).map((sku) => ({
          value: sku.value,
          price: Number(sku.price),
          stock: Number(sku.stock),
          image: sku.image ?? ''
        })),
        specGroups: raw.specGroups ?? [],
        highlights: raw.highlights ?? []
      }

      await updateProductMutation.mutateAsync({ id: id as number, ...payload })
      await revalidateApiRequest('products')
      toast({ description: 'Cập nhật sản phẩm thành công!' })
      reset()
      onSubmitSuccess?.()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <ProductDialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) reset()
      }}
      title='Cập nhật sản phẩm'
      formId='edit-product-form'
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.warn('Validation errors:', errors)
      })}
      onReset={reset}
      submitLabel='Lưu'
      categoryList={categoryList}
      brandList={brandList}
      productMutation={updateProductMutation}
      {...productForm}
    />
  )
}
