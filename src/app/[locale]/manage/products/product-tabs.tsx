'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, ChevronUp, ImagePlus, GripVertical, PlusCircle, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { HighlightText } from '../highlight-text'
import Image from 'next/image'
import { SUPPORTED_LANGUAGES } from './use-product-form'
import { cn } from '@/lib/utils'

// ─── BasicTab ─────────────────────────────────────────────────────────────────

interface BasicTabProps {
  form: UseFormReturn<any>
  filteredCategoryList: CategoryListResType['data']
  filteredBrandList: BrandListResType['data']
  categoryList: CategoryListResType['data']
  categorySearch: string
  setCategorySearch: (v: string) => void
  brandSearch: string
  setBrandSearch: (v: string) => void
  openParents: Record<number, boolean>
  setOpenParents: (v: Record<number, boolean>) => void
  toggleParent: (id: number) => void
  handleToggleCategory: (childId: number, checked: boolean) => void
}

export function BasicTab({
  form,
  filteredCategoryList,
  filteredBrandList,
  categoryList,
  categorySearch,
  setCategorySearch,
  brandSearch,
  setBrandSearch,
  openParents,
  setOpenParents,
  toggleParent,
  handleToggleCategory
}: BasicTabProps) {
  return (
    <div className='grid gap-4'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label>Tên sản phẩm</Label>
              <div className='col-span-3 space-y-1'>
                <Input {...field} />
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='basePrice'
        render={({ field }) => (
          <FormItem>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label>Giá cơ bản</Label>
              <div className='col-span-3 space-y-1'>
                <Input type='number' {...field} />
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='virtualPrice'
        render={({ field }) => (
          <FormItem>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label>Giá ảo</Label>
              <div className='col-span-3 space-y-1'>
                <Input type='number' {...field} />
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='brandId'
        render={({ field }) => (
          <FormItem>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label>Thương hiệu</Label>
              <div className='col-span-3 space-y-1'>
                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn thương hiệu' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <div className='px-2 py-1.5 border-b'>
                      <Input
                        placeholder='Tìm thương hiệu...'
                        className='h-7 text-sm'
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredBrandList.length === 0 ? (
                      <div className='px-3 py-4 text-sm text-center text-muted-foreground'>Không tìm thấy</div>
                    ) : (
                      filteredBrandList.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='categories'
        render={({ field }) => (
          <FormItem>
            <div className='grid grid-cols-4 items-start gap-4'>
              <Label className='pt-2'>Danh mục</Label>
              <div className='col-span-3 space-y-1.5'>
                <div className='relative'>
                  <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
                  <Input
                    placeholder='Tìm danh mục...'
                    className='pl-8 h-8 text-sm'
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value)
                      if (e.target.value.trim()) {
                        const expanded: Record<number, boolean> = {}
                        categoryList.forEach((p) => (expanded[p.id] = true))
                        setOpenParents(expanded)
                      }
                    }}
                  />
                  {categorySearch && (
                    <button
                      type='button'
                      onClick={() => {
                        setCategorySearch('')
                        setOpenParents({})
                      }}
                      className='absolute right-2.5 top-1/2 -translate-y-1/2'
                    >
                      <X className='h-3.5 w-3.5 text-muted-foreground hover:text-foreground' />
                    </button>
                  )}
                </div>
                <div className='overflow-auto h-48 scrollbar-thin'>
                  {filteredCategoryList.map((parent) =>
                    (parent.childrenCategories || []).length > 0 ? (
                      <div key={parent.id} className='border rounded-lg overflow-hidden mb-2'>
                        <button
                          type='button'
                          onClick={() => toggleParent(parent.id)}
                          className='w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors'
                        >
                          <div className='flex items-center gap-2'>
                            <span>{parent.name}</span>
                            {(() => {
                              const n = (parent.childrenCategories || []).filter((c) =>
                                (field.value ?? []).includes(c.id)
                              ).length
                              return n > 0 ? (
                                <Badge variant='secondary' className='text-xs h-4 px-1.5'>
                                  {n}
                                </Badge>
                              ) : null
                            })()}
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openParents[parent.id] ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openParents[parent.id] && (
                          <div className='border-t px-3 py-2.5 flex flex-wrap gap-2 bg-muted/20'>
                            {(parent.childrenCategories || []).map((child) => {
                              const checked = (field.value ?? []).includes(child.id)
                              return (
                                <label
                                  key={child.id}
                                  className={cn(
                                    'flex items-center gap-1.5 cursor-pointer rounded-md border px-2.5 py-1 text-sm transition-colors select-none',
                                    checked
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border hover:border-primary/50'
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(val) => handleToggleCategory(child.id, !!val)}
                                    className='hidden'
                                  />
                                  {categorySearch.trim() ? (
                                    <HighlightText text={child.name} query={categorySearch} />
                                  ) : (
                                    child.name
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
                {filteredCategoryList.every((p) => (p.childrenCategories || []).length === 0) && (
                  <p className='text-sm text-center text-muted-foreground py-3'>Không tìm thấy danh mục</p>
                )}
                {(field.value ?? []).length > 0 && (
                  <div className='flex flex-wrap gap-1 pt-1'>
                    {(field.value ?? []).map((id: number) => {
                      const child = categoryList.flatMap((p) => p.childrenCategories || []).find((c) => c.id === id)
                      return child ? (
                        <Badge key={id} variant='secondary' className='gap-1'>
                          {child.name}
                          <X className='h-3 w-3 cursor-pointer' onClick={() => handleToggleCategory(id, false)} />
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}

// ─── ImagesTab ────────────────────────────────────────────────────────────────

interface ImagesTabProps {
  form: UseFormReturn<any>
  imageUrl: string
  setImageUrl: (v: string) => void
  handleAddImage: () => void
  handleRemoveImage: (url: string) => void
}

export function ImagesTab({ form, imageUrl, setImageUrl, handleAddImage, handleRemoveImage }: ImagesTabProps) {
  return (
    <FormField
      control={form.control}
      name='images'
      render={({ field }) => (
        <FormItem>
          <div className='space-y-3'>
            <div className='flex gap-2'>
              <Input
                placeholder='Nhập URL hình ảnh...'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddImage()
                  }
                }}
              />
              <Button type='button' variant='outline' size='icon' onClick={handleAddImage}>
                <ImagePlus className='h-4 w-4' />
              </Button>
            </div>
            {(field.value ?? []).length > 0 ? (
              <div className='grid grid-cols-4 gap-2'>
                {(field.value ?? []).map((url: string, idx: number) => (
                  <div key={idx} className='relative group rounded-md overflow-hidden border aspect-square bg-muted'>
                    <Image
                      src={url}
                      width={150}
                      height={150}
                      quality={80}
                      loading='lazy'
                      alt={`preview-${idx}`}
                      className='object-cover w-[150px] h-[150px] rounded-md transition-transform duration-300 group-hover:scale-105'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(url)}
                      className='absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground text-sm gap-2'>
                <ImagePlus className='h-8 w-8 opacity-30' />
                <span>Chưa có hình ảnh. Nhập URL và nhấn Enter.</span>
              </div>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

// ─── VariantsTab ──────────────────────────────────────────────────────────────

interface VariantsTabProps {
  form: UseFormReturn<any>
  variantFields: FieldArrayWithId<any, 'variants', 'id'>[]
  appendVariant: (v: any) => void
  removeVariant: (index: number) => void
  optionInputs: Record<number, string>
  setOptionInputs: React.Dispatch<React.SetStateAction<Record<number, string>>>
  handleAddOption: (variantIndex: number) => void
  handleRemoveOption: (variantIndex: number, option: string) => void
  onDragStart: (index: number) => void
  onDragEnter: (index: number) => void
  onDragEnd: () => void
  skus: any[]
}

export function VariantsTab({
  form,
  variantFields,
  appendVariant,
  removeVariant,
  optionInputs,
  setOptionInputs,
  handleAddOption,
  handleRemoveOption,
  onDragStart,
  onDragEnter,
  onDragEnd,
  skus
}: VariantsTabProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Phân loại hàng</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-7 gap-1 text-xs'
            onClick={() => appendVariant({ value: '', options: [] })}
            disabled={variantFields.length >= 3}
          >
            <PlusCircle className='h-3 w-3' /> Thêm phân loại
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>
          Kéo để thay đổi thứ tự. Phân loại đầu tiên là nhóm ngoài cùng trong SKU.
        </p>
        {variantFields.map((vf, vIndex) => (
          <div
            key={vf.id}
            draggable
            onDragStart={() => onDragStart(vIndex)}
            onDragEnter={() => onDragEnter(vIndex)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className='border rounded-lg p-3 space-y-3 bg-muted/30 cursor-grab active:cursor-grabbing'
          >
            <div className='flex items-center gap-2'>
              <GripVertical className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <FormField
                control={form.control}
                name={`variants.${vIndex}.value`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input placeholder='Tên phân loại (VD: Màu sắc)' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Badge variant='outline' className='text-xs flex-shrink-0'>
                {vIndex === 0 ? 'Nhóm ngoài' : `Cấp ${vIndex + 1}`}
              </Badge>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive flex-shrink-0'
                onClick={() => removeVariant(vIndex)}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>
            <FormField
              control={form.control}
              name={`variants.${vIndex}.options`}
              render={({ field }) => (
                <FormItem>
                  <div className='space-y-2 pl-6'>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Nhập giá trị (VD: Đen) rồi nhấn Enter'
                        className='text-sm h-8'
                        value={optionInputs[vIndex] ?? ''}
                        onChange={(e) => setOptionInputs((prev) => ({ ...prev, [vIndex]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddOption(vIndex)
                          }
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='h-8 px-3 text-xs'
                        onClick={() => handleAddOption(vIndex)}
                      >
                        Thêm
                      </Button>
                    </div>
                    {(field.value ?? []).length > 0 && (
                      <div className='flex flex-wrap gap-1.5'>
                        {(field.value ?? []).map((opt: string) => (
                          <Badge key={opt} variant='secondary' className='gap-1 text-xs'>
                            {opt}
                            <X className='h-3 w-3 cursor-pointer' onClick={() => handleRemoveOption(vIndex, opt)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      {skus.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label>Danh sách SKU</Label>
            <span className='text-xs text-muted-foreground'>{skus.length} SKUs</span>
          </div>
          <div className='border rounded-lg overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  {['Phân loại', 'Giá', 'Tồn kho', 'Hình ảnh'].map((h) => (
                    <th key={h} className='text-left font-medium px-3 py-2 text-xs text-muted-foreground'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skus.map((sku: any, sIndex: number) => (
                  <tr key={sku.value} className='border-t border-border/50'>
                    <td className='px-3 py-2'>
                      <span className='font-medium text-xs bg-muted rounded px-2 py-0.5'>{sku.value}</span>
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        className='h-7 text-xs w-24'
                        value={sku.price}
                        onChange={(e) => {
                          const n = [...skus]
                          n[sIndex] = { ...n[sIndex], price: Number(e.target.value) }
                          form.setValue('skus', n)
                        }}
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        className='h-7 text-xs w-24'
                        value={sku.stock}
                        onChange={(e) => {
                          const n = [...skus]
                          n[sIndex] = { ...n[sIndex], stock: Number(e.target.value) }
                          form.setValue('skus', n)
                        }}
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        placeholder='URL ảnh'
                        className='h-7 text-xs w-36'
                        value={sku.image}
                        onChange={(e) => {
                          const n = [...skus]
                          n[sIndex] = { ...n[sIndex], image: e.target.value }
                          form.setValue('skus', n)
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SpecsTab ─────────────────────────────────────────────────────────────────
// Giữ nguyên pattern từ code gốc: local useState cho activeLang.
// findIndex hoạt động đúng ở đây vì SpecsTab không unmount khi switch tab cha
// (ProductDialog luôn render tab hiện tại, không conditional render SpecsTab).

interface SpecsTabProps {
  form: UseFormReturn<any>
  specGroupFields: FieldArrayWithId<any, 'specGroups', 'id'>[]
  expandedGroups: Record<number, boolean>
  setExpandedGroups: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  watchedSpecGroups: any[]
  addSpecGroup: () => void
  handleRemoveSpecGroup: (gIdx: number) => void
  addSpecItem: (gIdx: number) => void
  removeSpecItem: (gIdx: number, sIdx: number) => void
}

export function SpecsTab({
  form,
  specGroupFields,
  expandedGroups,
  setExpandedGroups,
  watchedSpecGroups,
  addSpecGroup,
  handleRemoveSpecGroup,
  addSpecItem,
  removeSpecItem
}: SpecsTabProps) {
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[0].id)

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>Nhóm thông số</p>
          <p className='text-xs text-muted-foreground mt-0.5'>VD: Bộ xử lý, Màn hình, Bộ nhớ RAM...</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex gap-1'>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type='button'
                onClick={() => setActiveLang(lang.id)}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border transition-colors',
                  activeLang === lang.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <Button type='button' variant='outline' size='sm' className='h-7 gap-1 text-xs' onClick={addSpecGroup}>
            <PlusCircle className='h-3 w-3' /> Thêm nhóm
          </Button>
        </div>
      </div>

      {specGroupFields.length === 0 && (
        <div className='flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground text-sm gap-2'>
          <span className='text-3xl opacity-20'>⚙️</span>
          <span>Chưa có nhóm nào. Nhấn "Thêm nhóm" để bắt đầu.</span>
        </div>
      )}

      {specGroupFields.map((groupField, gIdx) => {
        const currentSpecs = watchedSpecGroups[gIdx]?.specs ?? []
        const groupTranslations: any[] = watchedSpecGroups[gIdx]?.translations ?? []
        const gLangIdx = groupTranslations.findIndex((t: any) => t.languageId === activeLang)
        const safeGLangIdx = gLangIdx === -1 ? 0 : gLangIdx
        const groupLabel = groupTranslations[safeGLangIdx]?.label || watchedSpecGroups[gIdx]?.key || ''

        return (
          <div key={groupField.id} className='border rounded-lg overflow-hidden'>
            <div className='flex items-center gap-2 px-3 py-2 bg-muted/40 border-b'>
              <button
                type='button'
                onClick={() => setExpandedGroups((prev) => ({ ...prev, [gIdx]: !prev[gIdx] }))}
                className='flex-1 flex items-center gap-2 text-left min-w-0'
              >
                {expandedGroups[gIdx] ? (
                  <ChevronUp className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                )}
                <span className='text-sm font-medium truncate'>
                  {groupLabel || <span className='text-muted-foreground italic font-normal'>Nhóm chưa đặt tên</span>}
                </span>
                <Badge variant='outline' className='text-xs ml-auto flex-shrink-0'>
                  {currentSpecs.length} chỉ số
                </Badge>
              </button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-destructive flex-shrink-0'
                onClick={() => handleRemoveSpecGroup(gIdx)}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>

            {expandedGroups[gIdx] && (
              <div className='p-3 space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name={`specGroups.${gIdx}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <Label className='text-xs text-muted-foreground'>Key (slug)</Label>
                        <FormControl>
                          <Input
                            placeholder='VD: processor'
                            className='h-8 text-sm'
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`specGroups.${gIdx}.translations.${safeGLangIdx}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <Label className='text-xs text-muted-foreground'>
                          Tên nhóm ({SUPPORTED_LANGUAGES.find((l) => l.id === activeLang)?.label})
                        </Label>
                        <FormControl>
                          <Input placeholder='VD: Bộ xử lý & Đồ họa' className='h-8 text-sm' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='grid grid-cols-[110px_1fr_1fr_32px] gap-2 px-1'>
                    <span className='text-xs text-muted-foreground'>Key</span>
                    <span className='text-xs text-muted-foreground'>Tên chỉ số</span>
                    <span className='text-xs text-muted-foreground'>Giá trị</span>
                    <span />
                  </div>

                  {currentSpecs.map((_: any, sIdx: number) => {
                    const specTranslations: any[] = watchedSpecGroups[gIdx]?.specs?.[sIdx]?.translations ?? []
                    const sLangIdx = specTranslations.findIndex((t: any) => t.languageId === activeLang)
                    const safeSLangIdx = sLangIdx === -1 ? 0 : sLangIdx

                    return (
                      <div key={sIdx} className='grid grid-cols-[110px_1fr_1fr_32px] gap-2 items-start'>
                        <FormField
                          control={form.control}
                          name={`specGroups.${gIdx}.specs.${sIdx}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='VD: cpu_type'
                                  className='h-8 text-sm'
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specGroups.${gIdx}.specs.${sIdx}.translations.${safeSLangIdx}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder='VD: Loại CPU' className='h-8 text-sm' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specGroups.${gIdx}.specs.${sIdx}.translations.${safeSLangIdx}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder='VD: Intel Core Ultra 5 - 125H'
                                  className='text-sm min-h-[32px] h-8 py-1 resize-none'
                                  rows={1}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-destructive flex-shrink-0'
                          disabled={currentSpecs.length === 1}
                          onClick={() => removeSpecItem(gIdx, sIdx)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    )
                  })}

                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs gap-1 text-muted-foreground hover:text-foreground'
                    onClick={() => addSpecItem(gIdx)}
                  >
                    <PlusCircle className='h-3 w-3' /> Thêm chỉ số
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── HighlightsTab ────────────────────────────────────────────────────────────
//
// Root cause bug cũ: switch language → safeLangIdx thay đổi → field name thay đổi
// (highlights.0.* ↔ highlights.1.*) → RHF unmount input cũ + mount input mới
// với giá trị rỗng → mất data hoặc trùng data.
//
// Fix: render TẤT CẢ language panels cùng lúc với index CỐ ĐỊNH từ vị trí
// trong SUPPORTED_LANGUAGES (vi=0, en=1). Dùng HTML `hidden` để ẩn panel
// không active — không unmount — field name không bao giờ thay đổi.
//
// addHighlightSection/removeHighlightSection nhận langId để tự tính index,
// không phụ thuộc vào state ngoài.

interface HighlightsTabProps {
  form: UseFormReturn<any>
  watchedHighlights: any[]
  addHighlightSection: (langId: string) => void
  removeHighlightSection: (langId: string, sIdx: number) => void
}

export function HighlightsTab({
  form,
  watchedHighlights,
  addHighlightSection,
  removeHighlightSection
}: HighlightsTabProps) {
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[0].id)

  return (
    <div className='space-y-4'>
      {/* Language tabs */}
      <div className='flex gap-1 border-b pb-2'>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            type='button'
            onClick={() => setActiveLang(lang.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeLang === lang.id
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/*
        Render TẤT CẢ panels, index cố định theo SUPPORTED_LANGUAGES.
        Ẩn bằng `hidden` — không unmount — RHF registry không bị reset.
      */}
      {SUPPORTED_LANGUAGES.map((lang, langIdx) => {
        const sections = watchedHighlights?.[langIdx]?.sections ?? []

        return (
          <div key={lang.id} hidden={lang.id !== activeLang}>
            <div className='space-y-5'>
              <FormField
                control={form.control}
                name={`highlights.${langIdx}.summary`}
                render={({ field }) => (
                  <FormItem>
                    <Label>Đoạn giới thiệu ngắn</Label>
                    <p className='text-xs text-muted-foreground'>Tóm tắt sản phẩm trong 2-3 câu.</p>
                    <FormControl>
                      <Textarea
                        placeholder='VD: Laptop LG Gram 2024 ấn tượng bởi hiệu quả xử lý ưu trội...'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium'>Các mục nổi bật</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>Hỗ trợ HTML trong nội dung.</p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-7 gap-1 text-xs'
                    onClick={() => addHighlightSection(lang.id)}
                  >
                    <PlusCircle className='h-3 w-3' /> Thêm mục
                  </Button>
                </div>

                {sections.length === 0 && (
                  <div className='flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground text-sm gap-2'>
                    <span className='text-3xl opacity-20'>✨</span>
                    <span>Chưa có mục nào. Nhấn "Thêm mục" để bắt đầu.</span>
                  </div>
                )}

                {sections.map((_: any, sIdx: number) => (
                  <div key={sIdx} className='border rounded-lg p-3 space-y-3 bg-muted/20'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs flex-shrink-0'>
                        Mục {sIdx + 1}
                      </Badge>
                      <FormField
                        control={form.control}
                        name={`highlights.${langIdx}.sections.${sIdx}.heading`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input
                                placeholder='Tiêu đề mục (VD: RAM 16GB, ổ cứng SSD)'
                                className='h-8 text-sm font-medium'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive flex-shrink-0'
                        onClick={() => removeHighlightSection(lang.id, sIdx)}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`highlights.${langIdx}.sections.${sIdx}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <Label className='text-xs text-muted-foreground'>
                            Nội dung (hỗ trợ HTML hoặc plain text)
                          </Label>
                          <FormControl>
                            <Textarea
                              placeholder='VD: Laptop LG Gram 2024 sử dụng RAM chuẩn LPDDR5X...'
                              rows={4}
                              className='text-sm resize-y'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {(watchedHighlights?.[langIdx]?.summary || sections.length > 0) && (
                <div className='border rounded-lg p-4 space-y-3 bg-muted/10'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Xem trước</p>
                  {watchedHighlights?.[langIdx]?.summary && (
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {watchedHighlights[langIdx].summary}
                    </p>
                  )}
                  {sections.length > 0 && (
                    <ol className='space-y-1 text-sm list-decimal list-inside'>
                      {sections.map((s: any, i: number) => (
                        <li key={i} className='text-muted-foreground'>
                          {s.heading || <em className='opacity-50'>Chưa có tiêu đề</em>}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
