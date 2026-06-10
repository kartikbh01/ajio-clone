import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ChevronRight, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard"
import { FilterSidebar, FilterChips, MobileFilterDrawer, DEFAULT_FILTERS, PRICE_MAX, type ActiveFilters } from "@/components/filters/FilterSidebar"
import { fetchProducts, fetchCategories } from "@/api/dummyjson"
import type { Product, Category } from "@/types"
import { cn } from "@/lib/utils"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Discount", value: "discount" },
]

const PAGE_SIZE = 24

function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products]
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.id - a.id)
      break
    case "price_asc":
      sorted.sort((a, b) => a.price - b.price)
      break
    case "price_desc":
      sorted.sort((a, b) => b.price - a.price)
      break
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating)
      break
    case "discount":
      sorted.sort((a, b) => b.discount - a.discount)
      break
  }
  return sorted
}

function applyClientFilters(products: Product[], filters: ActiveFilters): Product[] {
  return products.filter((p) => {
    if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false
    return true
  })
}

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [viewMode, setViewMode] = useState<"grid-4" | "list">("grid-4")

  const searchTerm = searchParams.get("search") ?? ""
  const categoryParam = searchParams.get("category") ?? ""
  const sortParam = searchParams.get("sort") ?? "recommended"
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10)

  const [filters, setFilters] = useState<ActiveFilters>(() => ({
    ...DEFAULT_FILTERS,
    categories: categoryParam ? categoryParam.split(",") : [],
  }))

  const hasClientFilters =
    filters.categories.length > 1 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < PRICE_MAX

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  useEffect(() => {
    const categoriesFromParam = categoryParam ? categoryParam.split(",") : []
    setFilters((prev) => {
      const isSame =
        prev.categories.length === categoriesFromParam.length &&
        prev.categories.every((c) => categoriesFromParam.includes(c))
      if (isSame) return prev
      return {
        ...prev,
        categories: categoriesFromParam,
      }
    })
  }, [categoryParam])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(false)

      const apiCategory =
        filters.categories.length === 1 && !hasClientFilters
          ? filters.categories[0]
          : undefined

      const result = await fetchProducts({
        limit: hasClientFilters ? 194 : PAGE_SIZE,
        skip: hasClientFilters ? 0 : (pageParam - 1) * PAGE_SIZE,
        search: searchTerm || undefined,
        category: apiCategory,
      })

      if (cancelled) return

      if (!result) {
        setError(true)
        setProducts([])
        setTotal(0)
      } else {
        let filtered = applyClientFilters(result.products, filters)
        filtered = sortProducts(filtered, sortParam)

        if (hasClientFilters) {
          const start = (pageParam - 1) * PAGE_SIZE
          setTotal(filtered.length)
          setProducts(filtered.slice(start, start + PAGE_SIZE))
        } else {
          setProducts(filtered)
          setTotal(result.total)
        }
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [searchTerm, filters, sortParam, pageParam, categoryParam, hasClientFilters])

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [pageParam])

  function updateParams(updates: Record<string, string | null>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === "") next.delete(k)
        else next.set(k, v)
      })
      return next
    })
  }

  function handleFilterChange(newFilters: ActiveFilters) {
    setFilters(newFilters)
    const categoryUpdate = newFilters.categories.length > 0 ? newFilters.categories.join(",") : null
    updateParams({ page: "1", category: categoryUpdate })
  }

  const parsedCategories = categoryParam ? categoryParam.split(",") : []
  const activeCategories = categories.filter((c) => parsedCategories.includes(c.slug))
  let breadcrumbLabel = "All Products"
  if (searchTerm) {
    breadcrumbLabel = `Search: "${searchTerm}"`
  } else if (activeCategories.length > 0) {
    if (activeCategories.length <= 3) {
      breadcrumbLabel = activeCategories.map((c) => c.name).join(", ")
    } else {
      breadcrumbLabel = `${activeCategories.slice(0, 3).map((c) => c.name).join(", ")} +${activeCategories.length - 3} more`
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(Math.max(1, pageParam), totalPages)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{breadcrumbLabel}</span>
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-12">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{breadcrumbLabel}</h1>
            {!loading && !error && (
              <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} Products</p>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <FilterSidebar filters={filters} onChange={handleFilterChange} categories={categories} className="hidden lg:block" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <MobileFilterDrawer filters={filters} onChange={handleFilterChange} categories={categories} />

              <div className="flex items-center gap-2 ml-auto">
                <Select value={sortParam} onValueChange={(v) => updateParams({ sort: v, page: "1" })}>
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex items-center border border-border rounded-md overflow-hidden">
                  <button onClick={() => setViewMode("grid-4")} className={cn("px-2.5 py-1.5 transition-colors", viewMode === "grid-4" ? "bg-brand text-brand-foreground" : "hover:bg-accent")}>
                    <LayoutGrid className="size-4" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={cn("px-2.5 py-1.5 transition-colors", viewMode === "list" ? "bg-brand text-brand-foreground" : "hover:bg-accent")}>
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <FilterChips filters={filters} onChange={handleFilterChange} categories={categories} />

            {loading ? (
              <div className={cn(
                viewMode === "list" 
                  ? "flex flex-col gap-4" 
                  : viewMode === "grid-4"
                    ? "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid gap-4 grid-cols-2 sm:grid-cols-3"
              )}>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} view={viewMode === "list" ? "list" : "grid"} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Failed to load products</p>
                <p className="text-sm text-muted-foreground mb-6">Please check your connection and try again.</p>
                <Button onClick={() => window.location.reload()} className="bg-brand text-brand-foreground">Retry</Button>
              </div>
            ) : products.length === 0 ? (
              <EmptyState onClear={() => { setFilters(DEFAULT_FILTERS); updateParams({ page: "1", category: null }) }} />
            ) : (
              <div className={cn(
                viewMode === "list" 
                  ? "flex flex-col gap-4" 
                  : viewMode === "grid-4"
                    ? "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid gap-4 grid-cols-2 sm:grid-cols-3"
              )}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} view={viewMode === "list" ? "list" : "grid"} />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && products.length > 0 && (
              <PaginationControls page={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: String(p) })} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">We couldn't find what you're looking for. Try adjusting your filters or search term.</p>
      <Button onClick={onClear} className="bg-brand text-brand-foreground hover:bg-brand/90">Clear All Filters</Button>
    </div>
  )
}

function PaginationControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const pages: (number | "ellipsis")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("ellipsis")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
  }

  return (
    <div className="mt-10 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              className={cn(page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:text-brand")}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => onPageChange(p)}
                  className={cn("cursor-pointer", p === page && "bg-brand text-brand-foreground border-brand hover:bg-brand/90 hover:text-brand-foreground")}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && onPageChange(page + 1)}
              className={cn(page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:text-brand")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
