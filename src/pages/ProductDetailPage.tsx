import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Heart, ShoppingBag, Star, ChevronRight, Share2, Shield, Truck, RefreshCw, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product/ProductCard"
import { useStore } from "@/store/StoreContext"
import { fetchProductById, fetchCategoryProducts } from "@/api/dummyjson"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/formatPrice"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    const productId = Number(id)

    async function load() {
      setLoading(true)
      setActiveImg(0)

      const found = await fetchProductById(productId)
      if (cancelled) return

      setProduct(found)

      if (found) {
        const related = await fetchCategoryProducts(found.category, { limit: 8 })
        if (!cancelled && related) {
          setRelatedProducts(related.products.filter((p) => p.id !== found.id))
        }
      } else {
        setRelatedProducts([])
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addToCart(product)
    toast.success("Added to bag!", { description: product.name })
  }

  function handleBuyNow() {
    if (!product) return
    addToCart(product)
    navigate("/cart")
  }

  if (loading) return <ProductDetailSkeleton />
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Product not found</p>
      <Button onClick={() => navigate("/products")} className="bg-brand text-brand-foreground">Browse Products</Button>
    </div>
  )

  const wishlisted = isWishlisted(product.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="size-3" />
          <Link to={`/products?category=${product.category}`} className="hover:text-brand">{product.categoryName}</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium truncate max-w-40">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex gap-3">
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-lg border-2 transition-all",
                    i === activeImg ? "border-brand" : "border-transparent hover:border-border"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted relative">
                <img src={product.images[activeImg] ?? product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.discount > 0 && (
                  <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground border-0 font-bold">{product.discount}% OFF</Badge>
                )}

                <div className="sm:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={cn("size-1.5 rounded-full transition-all", i === activeImg ? "bg-brand w-3" : "bg-white/60")} />
                  ))}
                </div>

                {product.images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg((i) => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ChevronLeft className="size-4" />
                    </button>
                    <button onClick={() => setActiveImg((i) => Math.min(product.images.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{product.brand}</p>
                  <h1 className="text-2xl font-bold text-foreground mt-1 leading-snug">{product.name}</h1>
                </div>
                <button onClick={() => { toast("Link copied!"); navigator.clipboard.writeText(window.location.href).catch(() => {}) }} className="shrink-0 mt-1 p-2 rounded-full hover:bg-accent transition-colors">
                  <Share2 className="size-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-emerald-500 text-white text-sm font-bold px-2 py-1 rounded-sm">
                  {product.rating.toFixed(1)} <Star className="size-3.5 fill-current" />
                </div>
                {product.reviewCount > 0 && (
                  <span className="text-sm text-muted-foreground">{product.reviewCount} Ratings & Reviews</span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.discount > 0 && (
                  <span className="text-base text-emerald-600 font-bold">{product.discount}% off</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 bg-brand hover:bg-brand/90 text-brand-foreground font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="size-5 mr-2" />
                {product.inStock ? "Add to Bag" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 font-bold text-base rounded-xl border-2 hover:border-brand hover:text-brand hover:bg-brand-light dark:hover:bg-accent transition-all"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn("h-12 w-12 rounded-xl border-2 transition-all", wishlisted ? "border-brand bg-brand-light dark:bg-accent text-brand" : "hover:border-brand hover:text-brand")}
                onClick={() => { toggleWishlist(product.id); toast(isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist") }}
              >
                <Heart className={cn("size-5", wishlisted && "fill-brand text-brand")} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "Free Delivery", sub: "On orders above $50" },
                { icon: RefreshCw, title: "Easy Returns", sub: "30-day return policy" },
                { icon: Shield, title: "100% Authentic", sub: "Genuine products only" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center p-3 bg-secondary/50 rounded-xl gap-1.5">
                  <Icon className="size-5 text-brand" />
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>
                </div>
              ))}
            </div>

            <Tabs defaultValue="description">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Product Details</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="text-sm text-foreground/80 leading-relaxed mt-3">
                <p>{product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="mt-3">
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[["Brand", product.brand], ["Category", product.categoryName], ["Stock", String(product.stock)], ["In Stock", product.inStock ? "Yes" : "No"]].map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k}</dt>
                      <dd className="text-sm text-foreground mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 w-16">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          </div>
          <Skeleton className="flex-1 aspect-[4/5] rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-3"><Skeleton className="h-12 flex-1 rounded-xl" /><Skeleton className="h-12 flex-1 rounded-xl" /><Skeleton className="h-12 w-12 rounded-xl" /></div>
        </div>
      </div>
    </div>
  )
}
