'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { UseFormReturn, FieldArrayWithId } from 'react-hook-form'
import { TABS, TabKey } from './use-product-form'
import { BasicTab, ImagesTab, VariantsTab, SpecsTab, HighlightsTab } from './product-tabs'
import { CategoryListResType } from '@/schemaValidations/category.schema'
import { BrandListResType } from '@/schemaValidations/brand.schema'
import { LoaderCircle } from 'lucide-react'
import { UseMutationResult } from '@tanstack/react-query'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  formId: string
  form: UseFormReturn<any>
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
  submitLabel: string
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  goNextTab: () => void
  goPrevTab: () => void
  categoryList: CategoryListResType['data']
  brandList: BrandListResType['data']
  filteredCategoryList: CategoryListResType['data']
  filteredBrandList: BrandListResType['data']
  categorySearch: string
  setCategorySearch: (v: string) => void
  brandSearch: string
  setBrandSearch: (v: string) => void
  openParents: Record<number, boolean>
  setOpenParents: (v: Record<number, boolean>) => void
  toggleParent: (id: number) => void
  handleToggleCategory: (childId: number, checked: boolean) => void
  imageUrl: string
  setImageUrl: (v: string) => void
  handleAddImage: () => void
  handleRemoveImage: (url: string) => void
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
  specGroupFields: FieldArrayWithId<any, 'specGroups', 'id'>[]
  expandedGroups: Record<number, boolean>
  setExpandedGroups: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  watchedSpecGroups: any[]
  addSpecGroup: () => void
  handleRemoveSpecGroup: (gIdx: number) => void
  addSpecItem: (gIdx: number) => void
  removeSpecItem: (gIdx: number, sIdx: number) => void
  // Highlights — mảng đa ngôn ngữ
  // activeLangTab: string
  // setActiveLangTab: (v: string) => void
  watchedHighlights: any[]
  addHighlightSection: (langId: string) => void
  removeHighlightSection: (langId: string, sIdx: number) => void
  productMutation: UseMutationResult<any, Error, any>
}

export function ProductDialog({
  open,
  onOpenChange,
  title,
  formId,
  form,
  onSubmit,
  onReset,
  submitLabel,
  activeTab,
  setActiveTab,
  goNextTab,
  goPrevTab,
  categoryList,
  brandList,
  filteredCategoryList,
  filteredBrandList,
  categorySearch,
  setCategorySearch,
  brandSearch,
  setBrandSearch,
  openParents,
  setOpenParents,
  toggleParent,
  handleToggleCategory,
  imageUrl,
  setImageUrl,
  handleAddImage,
  handleRemoveImage,
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
  skus,
  specGroupFields,
  expandedGroups,
  setExpandedGroups,
  watchedSpecGroups,
  addSpecGroup,
  handleRemoveSpecGroup,
  addSpecItem,
  removeSpecItem,
  // activeLangTab,
  // setActiveLangTab,
  watchedHighlights,
  addHighlightSection,
  removeHighlightSection,
  productMutation
}: ProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[750px] h-[90vh] flex flex-col overflow-hidden p-0'>
        <DialogHeader className='px-6 pt-6 pb-0 flex-shrink-0'>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className='flex gap-0 border-b flex-shrink-0 px-6'>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6'>
          <Form {...form}>
            <form noValidate id={formId} className='grid gap-6 py-5' onSubmit={onSubmit} onReset={onReset}>
              {activeTab === 'basic' && (
                <BasicTab
                  form={form}
                  filteredCategoryList={filteredCategoryList}
                  filteredBrandList={filteredBrandList}
                  categoryList={categoryList}
                  categorySearch={categorySearch}
                  setCategorySearch={setCategorySearch}
                  brandSearch={brandSearch}
                  setBrandSearch={setBrandSearch}
                  openParents={openParents}
                  setOpenParents={setOpenParents}
                  toggleParent={toggleParent}
                  handleToggleCategory={handleToggleCategory}
                />
              )}
              {activeTab === 'images' && (
                <ImagesTab
                  form={form}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  handleAddImage={handleAddImage}
                  handleRemoveImage={handleRemoveImage}
                />
              )}
              {activeTab === 'variants' && (
                <VariantsTab
                  form={form}
                  variantFields={variantFields}
                  appendVariant={appendVariant}
                  removeVariant={removeVariant}
                  optionInputs={optionInputs}
                  setOptionInputs={setOptionInputs}
                  handleAddOption={handleAddOption}
                  handleRemoveOption={handleRemoveOption}
                  onDragStart={onDragStart}
                  onDragEnter={onDragEnter}
                  onDragEnd={onDragEnd}
                  skus={skus}
                />
              )}
              {activeTab === 'specs' && (
                <SpecsTab
                  form={form}
                  specGroupFields={specGroupFields}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                  watchedSpecGroups={watchedSpecGroups}
                  addSpecGroup={addSpecGroup}
                  handleRemoveSpecGroup={handleRemoveSpecGroup}
                  addSpecItem={addSpecItem}
                  removeSpecItem={removeSpecItem}
                />
              )}
              {activeTab === 'highlights' && (
                <HighlightsTab
                  form={form}
                  // activeLangTab={activeLangTab}
                  // setActiveLangTab={setActiveLangTab}
                  watchedHighlights={watchedHighlights}
                  addHighlightSection={addHighlightSection}
                  removeHighlightSection={removeHighlightSection}
                />
              )}
            </form>
          </Form>
        </div>

        {/* Footer */}
        <DialogFooter className='flex-shrink-0 border-t px-6 py-4'>
          <div className='flex items-center gap-3 w-full'>
            {/* Dot indicators */}
            <div className='flex gap-1.5 mr-auto'>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type='button'
                  title={tab.label}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeTab === tab.key ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>
            {activeTab !== 'basic' && (
              <Button type='button' variant='ghost' size='sm' onClick={goPrevTab}>
                ← Trước
              </Button>
            )}
            {activeTab !== 'highlights' ? (
              <Button type='button' variant='ghost' size='sm' onClick={goNextTab}>
                Tiếp theo →
              </Button>
            ) : (
              <Button type='button' variant='ghost' size='sm' disabled>
                Tiếp theo →
              </Button>
            )}
            <Button type='submit' form={formId} disabled={productMutation.isPending}>
              {productMutation.isPending && <LoaderCircle className='w-5 h-5 mr-2 animate-spin' />} {submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
