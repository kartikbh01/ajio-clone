import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Heart, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard"
import { useStore } from "@/store/StoreContext"
import { fetchProductById } from "@/api/dummyjson"
import type { Product } from "@/types"

export default function WishlistPage() {
  const { wishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const results = await Promise.all(wishlist.map((id) => fetchProductById(id)))
      if (!cancelled) {
        setProducts(results.filter((p): p is Product => p !== null))
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [wishlist])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">Wishlist ({products.length})</span>
        </nav>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: Math.max(wishlist.length, 4) }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Heart className="size-20 text-muted-foreground/40" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Your wishlist is empty</h2>
              <p className="text-muted-foreground mt-2">Save items you love by clicking the heart icon.</p>
            </div>
            <Link to="/products">
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-bold px-8 rounded-full">
                Explore Products <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground mb-6">My Wishlist ({products.length})</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
