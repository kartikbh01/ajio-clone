import { useParams, Link } from "react-router-dom"
import { useStore } from "@/store/StoreContext"
import { formatPrice } from "@/lib/formatPrice"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle2, ShoppingBag, ArrowRight, ClipboardList, MapPin, CreditCard } from "lucide-react"

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { orders } = useStore()

  const order = orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold text-destructive">Order Not Found</h2>
        <p className="text-muted-foreground">We couldn't retrieve the details for order ID: {orderId}</p>
        <Link to="/">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-full px-6">
            Go to Homepage
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate estimated delivery date: Order date + 4 days
  const deliveryEst = new Date()
  deliveryEst.setDate(deliveryEst.getDate() + 4)
  const estDateStr = deliveryEst.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="max-w-[720px] mx-auto px-4">
        {/* Celebration Block */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-4 border-emerald-50 dark:border-emerald-900/40 mb-2 animate-bounce">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Thank you for shopping with AJIO! Your payment was verified and your order has been received.
          </p>
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand/5 border border-brand/20 text-brand font-mono font-bold text-xs uppercase">
            Order ID: {order.id}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-border/80">
            <CardHeader className="border-b pb-4 border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Shipping & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4 text-xs">
              <div className="flex gap-3">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{order.address.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                      {order.address.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {order.address.streetAddress}, {order.address.city}, {order.address.state} - {order.address.pinCode}
                  </p>
                  <p className="text-muted-foreground">Phone: {order.address.phone}</p>
                </div>
              </div>

              <div className="border-t border-dashed pt-4">
                <p className="font-semibold text-foreground">
                  Estimated Delivery: <span className="text-brand font-bold">{estDateStr}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  We will send you SMS and Email notifications as your package moves.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="shadow-sm border border-border/80">
            <CardHeader className="border-b pb-4 border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <span className="font-semibold">Payment Mode</span>
                </div>
                <span className="font-bold text-foreground">
                  {order.payment.method === "Card"
                    ? `Card (ending in ${order.payment.cardLast4})`
                    : order.payment.method === "UPI"
                    ? `UPI ID (${order.payment.upiId})`
                    : "Cash on Delivery (COD)"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 font-bold text-sm text-foreground">
                <span>Total Paid</span>
                <span className="text-base text-brand">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items Purchased */}
          <Card className="shadow-sm border border-border/80">
            <CardHeader className="border-b pb-4 border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Items In This Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 divide-y divide-border/60">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-16 object-cover rounded-lg bg-muted border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{item.product.brand}</p>
                    <p className="text-xs font-semibold text-foreground line-clamp-1 mt-0.5">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Link to="/orders" className="w-full sm:w-auto">
              <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-bold rounded-xl flex items-center justify-center gap-2">
                <ClipboardList className="size-4" /> View My Orders <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full font-semibold rounded-xl flex items-center justify-center gap-2">
                <ShoppingBag className="size-4" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
