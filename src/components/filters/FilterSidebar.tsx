import { useState } from "react"
import { ChevronDown, X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/formatPrice"
import type { Category } from "@/types"

export const PRICE_MAX = 2000

export interface ActiveFilters {
  categories: string[]
  priceRange: [number, number]
}

interface FiltersProps {
  filters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  categories: Category[]
  className?: string
}

export const DEFAULT_FILTERS: ActiveFilters = {
  categories: [],
  priceRange: [0, PRICE_MAX],
}

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-foreground hover:text-brand transition-colors"
      >
        {title}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-3">{children}</div>}
      <Separator />
    </div>
  )
}

function FiltersContent({ filters, onChange, categories }: FiltersProps) {
  function toggleCategory(slug: string) {
    const updated = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug]
    onChange({ ...filters, categories: updated })
  }

  const hasAnyFilter =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < PRICE_MAX

  return (
    <div>
      <div className="flex items-center justify-between py-3 mb-1">
        {/* <h2 className="text-base font-bold text-foreground">Filters</h2> */}
        {hasAnyFilter && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs text-brand font-medium hover:underline">
            Clear All
          </button>
        )}
      </div>
      <Separator />

      <FilterSection title="Category">
        <div className="space-y-2 mt-1 max-h-52 overflow-y-auto">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={filters.categories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
                className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
              />
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="mt-3 px-1">
          <Slider
            min={0}
            max={PRICE_MAX}
            step={10}
            value={filters.priceRange}
            onValueChange={(v) => onChange({ ...filters, priceRange: v as [number, number] })}
            className="[&_[data-slot=thumb]]:border-brand [&_[data-slot=range]]:bg-brand"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>
    </div>
  )
}

export function FilterSidebar({ filters, onChange, categories, className }: FiltersProps) {
  return (
    <aside className={cn("w-60 shrink-0", className)}>
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
        <FiltersContent filters={filters} onChange={onChange} categories={categories} />
      </div>
    </aside>
  )
}

export function FilterChips({ filters, onChange, categories }: FiltersProps) {
  const chips: { label: string; onRemove: () => void }[] = []

  filters.categories.forEach((slug) => {
    const cat = categories.find((c) => c.slug === slug)
    if (cat) {
      chips.push({
        label: cat.name,
        onRemove: () => onChange({ ...filters, categories: filters.categories.filter((x) => x !== slug) }),
      })
    }
  })
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < PRICE_MAX) {
    chips.push({
      label: `${formatPrice(filters.priceRange[0])}–${formatPrice(filters.priceRange[1])}`,
      onRemove: () => onChange({ ...filters, priceRange: [0, PRICE_MAX] }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <Badge key={i} variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium hover:bg-brand/10 cursor-default">
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-brand transition-colors ml-0.5">
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs text-brand font-medium hover:underline ml-1">
        Clear All
      </button>
    </div>
  )
}

export function MobileFilterDrawer({ filters, onChange, categories }: FiltersProps) {
  const filterCount = filters.categories.length + (filters.priceRange[0] > 0 || filters.priceRange[1] < PRICE_MAX ? 1 : 0)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
          {filterCount > 0 && (
            <Badge className="bg-brand text-brand-foreground border-0 size-4 p-0 text-[10px] flex items-center justify-center">
              {filterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4 px-4">
          <FiltersContent filters={filters} onChange={onChange} categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
