import { useState } from "react"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/store/StoreContext"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/formatPrice"
import type { Product } from "@/types"
import { toast } from "sonner"
import { Link } from "react-router-dom"

interface QuickViewProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function QuickView({ product, open, onClose }: QuickViewProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore()
  const [activeImg, setActiveImg] = useState(0)

  if (!product) return null
  const wishlisted = isWishlisted(product.id)

  function handleAddToCart() {
    addToCart(product!)
    toast.success("Added to bag", { description: product!.name })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative bg-muted">
            <img src={product.images[activeImg] ?? product.image} alt={product.name} className="w-full aspect-[4/5] object-cover" />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {product.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={cn("size-2 rounded-full transition-all", i === activeImg ? "bg-brand w-4" : "bg-white/60 hover:bg-white")} />
              ))}
            </div>
            {product.discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground border-0 font-bold">{product.discount}% OFF</Badge>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{product.brand}</p>
              <h2 className="text-lg font-semibold text-foreground mt-1 leading-snug">{product.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
                {product.rating.toFixed(1)} <Star className="size-3 fill-current" />
              </div>
              {product.reviewCount > 0 && (
                <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-4">{product.description}</p>

            <div className="flex gap-2 mt-auto">
              <Button
                className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="size-4 mr-2" />
                {product.inStock ? "Add to Bag" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleWishlist(product.id)}
                className={cn(wishlisted && "border-brand text-brand bg-brand-light dark:bg-accent")}
              >
                <Heart className={cn("size-4", wishlisted && "fill-brand")} />
              </Button>
            </div>

            <Link to={`/product/${product.id}`} onClick={onClose} className="text-sm text-center text-brand underline underline-offset-2 hover:text-brand/80 transition-colors">
              View Full Details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
