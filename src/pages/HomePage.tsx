import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard"
import { QuickView } from "@/components/product/QuickView"
import { fetchCategories, fetchProducts } from "@/api/dummyjson"
import type { Product, Category } from "@/types"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cats, productsResult] = await Promise.all([
        fetchCategories(),
        fetchProducts({ limit: 12 }),
      ])
      setCategories(cats)
      const sorted = productsResult ? [...productsResult.products].sort((a, b) => b.id - a.id) : []
      setFeaturedProducts(sorted)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main>
      <HeroBanner />
      <ShopByCategory categories={categories} loading={loading} />
      <FeaturedProducts products={featuredProducts} loading={loading} onQuickView={setQuickViewProduct} />
      <QuickView product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </main>
  )
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden bg-muted" style={{ height: "clamp(280px, 52vw, 560px)" }}>
      <img
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
        alt="Shop our collection"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 w-full">
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-6xl font-black leading-tight text-white mb-3">
              Discover Your Style
            </h1>
            <p className="text-lg text-white/80 mb-6">Shop the latest products from our curated collection.</p>
            <Link to="/products">
              <Button className="bg-white text-foreground hover:bg-white/90 font-bold px-8 py-3 text-base rounded-full shadow-lg hover:scale-105 transition-transform">
                Shop Now <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShopByCategory({ categories, loading }: { categories: Category[]; loading: boolean }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Shop by Category</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Explore our wide range of premium collections</p>
        </div>
        <Link to="/products" className="text-sm text-brand font-medium hover:underline flex items-center gap-1">
          View All <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[3/4] rounded-2xl" />
            ))
          : categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-muted"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl px-3 py-2.5 text-center transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/30">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                      {cat.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  )
}

function FeaturedProducts({
  products,
  loading,
  onQuickView,
}: {
  products: Product[]
  loading: boolean
  onQuickView: (p: Product) => void
}) {
  return (
    <section className={cn("max-w-[1440px] mx-auto px-4 lg:px-6 py-10", "bg-secondary/30")}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Handpicked items from our store</p>
        </div>
        <Link to="/products?sort=newest" className="text-sm text-brand font-medium hover:underline flex items-center gap-1">
          View All <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
      </div>
    </section>
  )
}
