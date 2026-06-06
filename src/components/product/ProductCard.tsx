import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/store/StoreContext"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/formatPrice"
import type { Product } from "@/types"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useStore()
  const [imgLoaded, setImgLoaded] = useState(false)
  const wishlisted = isWishlisted(product.id)

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: product.name,
      duration: 2000,
    })
  }

  return (
    <Link to={`/product/${product.id}`} className="group relative block bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-brand/30 transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {!imgLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            !imgLoaded && "opacity-0"
          )}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount >= 10 && (
            <Badge className="bg-brand text-brand-foreground text-[10px] px-1.5 py-0.5 font-bold border-0">
              {product.discount}% OFF
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-bold">OUT OF STOCK</Badge>
          )}
        </div>

        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 size-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
            wishlisted
              ? "bg-brand text-brand-foreground scale-110"
              : "bg-white/90 text-foreground hover:bg-brand hover:text-brand-foreground hover:scale-110"
          )}
        >
          <Heart className={cn("size-3.5", wishlisted && "fill-current")} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs font-semibold bg-white/95 hover:bg-white text-foreground border-0 shadow-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product) }}
          >
            <Eye className="size-3.5 mr-1.5" />
            Quick View
          </Button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">{product.brand}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2 leading-snug">{product.name}</p>

        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="size-2.5 fill-current" />
          </div>
          {product.reviewCount > 0 && (
            <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
