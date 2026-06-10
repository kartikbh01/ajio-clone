import { Link } from "react-router-dom"
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/store/StoreContext"
import { formatPrice } from "@/lib/formatPrice"
import { toast } from "sonner"

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, cartTotal } = useStore()

  const savings = cart.reduce((s, i) => s + (i.product.originalPrice - i.product.price) * i.quantity, 0)
  const deliveryFee = cartTotal >= 50 ? 0 : 5
  const finalTotal = cartTotal + deliveryFee

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="size-20 text-muted-foreground/40" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Your bag is empty</h2>
          <p className="text-muted-foreground mt-2">Add items to your bag before proceeding.</p>
        </div>
        <Link to="/products">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-bold px-8 rounded-full">
            Continue Shopping <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-brand">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">My Bag ({cart.length})</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-24 h-32 object-cover rounded-lg" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.product.brand}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2">{item.product.name}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold">{formatPrice(item.product.price)}</span>
                    {item.product.originalPrice > item.product.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(item.product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-accent transition-colors">
                        <Minus className="size-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-border">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-accent transition-colors">
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => { removeFromCart(item.product.id); toast("Item removed from bag") }}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground">Order Summary</h2>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>You save</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground/80">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-emerald-600 font-medium" : ""}>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-foreground text-base">
                <span>Total Amount</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
              <Link to="/checkout" className="w-full block">
                <Button className="w-full h-12 bg-brand text-brand-foreground hover:bg-brand/90 font-bold text-base rounded-xl">
                  Proceed to Checkout <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">Free delivery on orders above $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
