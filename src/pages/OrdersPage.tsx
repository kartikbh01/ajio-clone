import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "@/store/StoreContext"
import { formatPrice } from "@/lib/formatPrice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ChevronRight,
  Truck,
  Undo2,
  CheckCircle2,
  Circle,
  XCircle,
  HelpCircle,
} from "lucide-react"
import type { Order } from "@/types"

export default function OrdersPage() {
  const { orders, cancelOrder } = useStore()
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)

  const handleCancelClick = (order: Order) => {
    setCancellingOrder(order)
  }

  const confirmCancellation = () => {
    if (cancellingOrder) {
      cancelOrder(cancellingOrder.id)
      toast.success(`Order ${cancellingOrder.id} cancelled successfully`)
      setCancellingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60"
      case "Shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60"
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60"
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Package className="size-20 text-muted-foreground/30" />
        <div>
          <h2 className="text-2xl font-bold">No Orders Placed Yet</h2>
          <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
            You haven't ordered any items yet. Start exploring our wide collection of apparel and lifestyle products!
          </p>
        </div>
        <Link to="/products">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-full px-8 font-bold">
            Start Shopping <ChevronRight className="size-4 ml-1" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Track shipping progress and review order history</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            // Est delivery calculation
            const deliveryEst = new Date(order.date)
            deliveryEst.setDate(deliveryEst.getDate() + 4)
            const estDateStr = deliveryEst.toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            return (
              <Card key={order.id} className="shadow-sm border border-border/80 overflow-hidden bg-card transition-all hover:shadow-md">
                {/* Card Header */}
                <div className="bg-muted/40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 text-xs">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <p className="text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Order Placed</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="size-3.5 text-muted-foreground" /> {order.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Total Amount</p>
                      <p className="font-bold text-foreground text-sm">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Ship To</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="size-3.5 text-muted-foreground" /> {order.address.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground tracking-tight select-all">#{order.id}</span>
                    <Badge variant="outline" className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items Purchased (left 2 cols on desktop) */}
                    <div className="md:col-span-2 space-y-4">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <Link to={`/product/${item.product.id}`} className="shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-20 object-cover rounded-lg bg-muted border border-border"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{item.product.brand}</p>
                            <Link to={`/product/${item.product.id}`} className="hover:underline">
                              <p className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5">{item.product.name}</p>
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                            <p className="text-xs font-bold text-foreground mt-1">{formatPrice(item.product.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meta info & Action buttons (right col on desktop) */}
                    <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/80 pt-4 md:pt-0 md:pl-6 space-y-4">
                      <div className="space-y-2 text-xs">
                        {order.status !== "Cancelled" && (
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Truck className="size-4 text-brand shrink-0" />
                            <span>Delivery expected by {estDateStr}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard className="size-4 shrink-0" />
                          <span>
                            {order.payment.method === "Card"
                              ? `Card ending in *${order.payment.cardLast4}`
                              : order.payment.method === "UPI"
                              ? `UPI ID: ${order.payment.upiId}`
                              : "Cash on Delivery"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTrackingOrder(order)}
                          className="flex-1 text-xs rounded-xl flex items-center gap-1 h-10 p-2"
                        >
                          Track Shipment
                        </Button>
                        {order.status === "Processing" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelClick(order)}
                            className="flex-1 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive rounded-xl flex items-center gap-1 h-9"
                          >
                            <Undo2 className="size-3.5" /> Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* TRACKING TIMELINE MODAL */}
      <Dialog open={!!trackingOrder} onOpenChange={(open) => !open && setTrackingOrder(null)}>
        <DialogContent className="sm:max-w-md max-w-sm rounded-3xl p-6">
          {trackingOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="size-5 text-brand" /> Track Order Shipment
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Order ID: <span className="font-mono font-semibold text-foreground">#{trackingOrder.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                {trackingOrder.status === "Cancelled" ? (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="size-8 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <XCircle className="size-5" />
                      </div>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Order Cancelled</h4>
                      <p className="text-xs text-muted-foreground">This order was cancelled by the user and will not be shipped.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {/* Step 1: Placed */}
                    <div className="flex gap-4 relative pb-6">
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-emerald-500" />
                      <div className="flex flex-col items-center z-10">
                        <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200">
                          <CheckCircle2 className="size-5" />
                        </div>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        <h4 className="text-sm font-bold text-foreground">Order Placed</h4>
                        <p className="text-xs text-muted-foreground">Order request received and approved on {trackingOrder.date}.</p>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex gap-4 relative pb-6">
                      <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${trackingOrder.status !== "Processing" ? "bg-emerald-500" : "bg-muted"}`} />
                      <div className="flex flex-col items-center z-10">
                        {trackingOrder.status === "Processing" ? (
                          <div className="size-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/30 animate-pulse">
                            <Circle className="size-4 fill-brand text-brand" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        <h4 className={`text-sm font-bold ${trackingOrder.status === "Processing" ? "text-brand" : "text-foreground"}`}>
                          Processing & Packing
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {trackingOrder.status === "Processing"
                            ? "Items are currently being packed and verified at our fulfillment center."
                            : "Order processed and package prepared."}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex gap-4 relative pb-6">
                      <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${trackingOrder.status === "Delivered" ? "bg-emerald-500" : "bg-muted"}`} />
                      <div className="flex flex-col items-center z-10">
                        {trackingOrder.status === "Shipped" ? (
                          <div className="size-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/30 animate-pulse">
                            <Circle className="size-4 fill-brand text-brand" />
                          </div>
                        ) : trackingOrder.status === "Delivered" ? (
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 className="size-5" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 border border-border">
                            <Circle className="size-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        <h4 className={`text-sm font-bold ${trackingOrder.status === "Shipped" ? "text-brand" : trackingOrder.status === "Delivered" ? "text-foreground" : "text-muted-foreground"}`}>
                          Shipped (In Transit)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {trackingOrder.status === "Shipped"
                            ? "Package is in transit via BlueDart shipping service."
                            : trackingOrder.status === "Delivered"
                            ? "Handed over to carrier partner."
                            : "Upcoming shipping step."}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex gap-4 relative">
                      <div className="flex flex-col items-center z-10">
                        {trackingOrder.status === "Delivered" ? (
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 className="size-5" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 border border-border">
                            <Circle className="size-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        <h4 className={`text-sm font-bold ${trackingOrder.status === "Delivered" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                          Delivered
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {trackingOrder.status === "Delivered"
                            ? "Delivered to shipping address and signed by recipient."
                            : "Upcoming delivery step."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* <DialogFooter>
                <DialogClose asChild>
                </DialogClose>
              </DialogFooter> */}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCELLATION CONFIRMATION DIALOG */}
      <Dialog open={!!cancellingOrder} onOpenChange={(open) => !open && setCancellingOrder(null)}>
        <DialogContent className="sm:max-w-md max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <HelpCircle className="size-5" /> Cancel Order?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel order <span className="font-mono font-semibold text-foreground">#{cancellingOrder?.id}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. Any payment made will be refunded to your original source of payment within 3-5 business days.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              className="rounded-xl font-bold text-xs"
              onClick={confirmCancellation}
            >
              Yes, Cancel Order
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl text-xs font-semibold">
                No, Keep Order
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
