import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useStore } from "@/store/StoreContext"
import { formatPrice } from "@/lib/formatPrice"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ChevronRight, CreditCard, Landmark, Truck, ShieldCheck, MapPin, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import type { Address, PaymentInfo, Order } from "@/types"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, cartTotal, savedAddresses, addAddress, removeAddress, addOrder, clearCart } = useStore()

  // Checkout State
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0]?.id || ""
  )
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "UPI" | "COD">("Card")

  // Address Form State
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    type: "Home" as "Home" | "Work" | "Other",
    isDefault: false,
  })

  // Payment State
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [upiId, setUpiId] = useState("")

  // Loading Simulation
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")

  const savings = cart.reduce((s, i) => s + (i.product.originalPrice - i.product.price) * i.quantity, 0)
  const deliveryFee = cartTotal >= 50 ? 0 : 5
  const finalTotal = cartTotal + deliveryFee

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <p className="text-muted-foreground">You don't have any items to check out.</p>
        <Link to="/products">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-full px-6">
            Go to Shop
          </Button>
        </Link>
      </div>
    )
  }

  // Address Handlers
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { name, phone, streetAddress, city, state, pinCode } = newAddress

    if (!name || !phone || !streetAddress || !city || !state || !pinCode) {
      toast.error("Please fill in all address fields")
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    if (!/^\d{6}$/.test(pinCode)) {
      toast.error("Please enter a valid 6-digit PIN code")
      return
    }

    const addressToAdd: Address = {
      ...newAddress,
      id: `addr-${Date.now()}`,
    }

    addAddress(addressToAdd)
    setSelectedAddressId(addressToAdd.id)
    setShowAddressForm(false)
    setNewAddress({
      name: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      pinCode: "",
      type: "Home",
      isDefault: false,
    })
    toast.success("Delivery Address saved successfully!")
  }

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeAddress(id)
    toast.success("Address deleted")
    if (selectedAddressId === id) {
      const remaining = savedAddresses.filter((a) => a.id !== id)
      setSelectedAddressId(remaining[0]?.id || "")
    }
  }

  // Card details validation formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "")
    const formatted = rawVal.match(/.{1,4}/g)?.join(" ") || rawVal
    setCardDetails({ ...cardDetails, number: formatted.slice(0, 19) })
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/\D/g, "")
    if (rawVal.length > 2) {
      rawVal = `${rawVal.slice(0, 2)}/${rawVal.slice(2, 4)}`
    }
    setCardDetails({ ...cardDetails, expiry: rawVal.slice(0, 5) })
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "")
    setCardDetails({ ...cardDetails, cvv: rawVal.slice(0, 3) })
  }

  // Place Order Simulation
  const handlePlaceOrder = () => {
    // 1. Validate address selection
    const address = savedAddresses.find((a) => a.id === selectedAddressId)
    if (!address) {
      toast.error("Please select a delivery address or add a new one")
      return
    }

    // 2. Validate payment information
    let paymentInfo: PaymentInfo = { method: paymentMethod }

    if (paymentMethod === "Card") {
      const cleanNum = cardDetails.number.replace(/\s/g, "")
      if (cleanNum.length !== 16) {
        toast.error("Please enter a valid 16-digit card number")
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        toast.error("Please enter expiry in MM/YY format")
        return
      }
      if (cardDetails.cvv.length !== 3) {
        toast.error("Please enter a valid 3-digit CVV")
        return
      }
      if (!cardDetails.name.trim()) {
        toast.error("Please enter the cardholder's name")
        return
      }
      paymentInfo.cardLast4 = cleanNum.slice(-4)
    } else if (paymentMethod === "UPI") {
      if (!upiId.trim() || !upiId.includes("@")) {
        toast.error("Please enter a valid UPI ID (e.g. name@upi)")
        return
      }
      paymentInfo.upiId = upiId.trim()
    }

    // 3. Trigger premium loading payment animation
    setIsProcessing(true)

    setTimeout(() => {
      setProcessingStatus("Finalizing order placement...")
    }, 1500)

    setTimeout(() => {
      // Create final order object
      const newOrder: Order = {
        id: `AJIO-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        items: [...cart],
        subtotal: cartTotal,
        savings,
        deliveryFee,
        total: finalTotal,
        address,
        payment: paymentInfo,
        status: "Processing",
      }

      // Save order, clear cart, stop loader, redirect
      addOrder(newOrder)
      clearCart()
      setIsProcessing(false)
      toast.success("Order Placed Successfully!")
      navigate(`/order-success/${newOrder.id}`)
    }, 2400)
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      {/* Simulation Screen Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <Loader2 className="size-16 animate-spin text-brand" />
            <ShieldCheck className="size-6 text-brand absolute" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-foreground">Processing Payment</h3>
            <p className="text-sm text-muted-foreground animate-pulse">{processingStatus}</p>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/cart" className="hover:text-brand transition-colors">My Bag</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-semibold">Checkout</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Secure payment & shipping</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            <Card className="shadow-sm border border-border/80">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4 border-border/60">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-5 text-brand" /> Delivery Address
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Select where you want your order delivered</CardDescription>
                </div>
                {!showAddressForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full flex items-center gap-1.5"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus className="size-3.5" /> Add New Address
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {showAddressForm ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="addr-name">Full Name</Label>
                        <Input
                          id="addr-name"
                          placeholder="e.g. John Doe"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="addr-phone">Phone Number (10 digits)</Label>
                        <Input
                          id="addr-phone"
                          placeholder="e.g. 9876543210"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="addr-street">Street Address / Landmark</Label>
                      <Input
                        id="addr-street"
                        placeholder="e.g. Flat/House No, Building, Apartment, Sector"
                        value={newAddress.streetAddress}
                        onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="addr-city">City</Label>
                        <Input
                          id="addr-city"
                          placeholder="e.g. Noida"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="addr-state">State</Label>
                        <Input
                          id="addr-state"
                          placeholder="e.g. Uttar Pradesh"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="addr-pincode">PIN Code (6 digits)</Label>
                        <Input
                          id="addr-pincode"
                          placeholder="e.g. 201301"
                          value={newAddress.pinCode}
                          onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address Type</Label>
                      <div className="flex gap-4">
                        {(["Home", "Work", "Other"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, type })}
                            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                              newAddress.type === type
                                ? "bg-brand border-brand text-brand-foreground"
                                : "bg-background border-border hover:bg-accent text-foreground"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="addr-default"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="addr-default" className="text-xs cursor-pointer select-none">
                        Make this my default address
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 rounded-full font-bold">
                        Save Address
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : savedAddresses.length > 0 ? (
                  <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`flex gap-3 p-4 border rounded-xl bg-card cursor-pointer transition-all relative overflow-hidden ${
                          selectedAddressId === addr.id
                            ? "border-brand ring-2 ring-brand/10 shadow-sm"
                            : "border-border/80 hover:border-brand/40"
                        }`}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1 shrink-0" />
                        <div className="space-y-1.5 pr-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{addr.name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {addr.streetAddress}, {addr.city}, {addr.state} - <span className="font-medium text-foreground">{addr.pinCode}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Phone: <span className="font-medium text-foreground">{addr.phone}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted/80 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">No saved addresses found. Please add a shipping address.</p>
                    <Button onClick={() => setShowAddressForm(true)} className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-full">
                      Add Shipping Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Payment */}
            <Card className="shadow-sm border border-border/80">
              <CardHeader className="border-b pb-4 border-border/60">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-brand" /> Payment Details
                </CardTitle>
                <CardDescription className="text-xs mt-1">Select payment mode and enter dummy credentials</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  {([
                    { id: "Card", label: "Credit/Debit Card", icon: CreditCard },
                    { id: "UPI", label: "UPI ID", icon: Landmark },
                    { id: "COD", label: "Cash on Delivery", icon: Truck },
                  ] as const).map((method) => {
                    const Icon = method.icon
                    const isSelected = paymentMethod === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-brand/5 border-brand text-brand ring-2 ring-brand/10"
                            : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{method.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="bg-muted/20 border rounded-xl p-5">
                  {paymentMethod === "Card" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={cardDetails.number}
                          onChange={handleCardNumberChange}
                          className="bg-card font-mono"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="card-expiry">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            className="bg-card font-mono text-center"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input
                            id="card-cvv"
                            placeholder="123"
                            type="password"
                            value={cardDetails.cvv}
                            onChange={handleCvvChange}
                            className="bg-card font-mono text-center"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="e.g. John"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="bg-card"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "UPI" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input
                          id="upi-id"
                          placeholder="e.g. kartik@paytm or bhardwaj@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="bg-card"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A payment request will be sent to this UPI ID. Open your UPI application to approve the request once you proceed.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "COD" && (
                    <div className="space-y-2 py-2">
                      <p className="text-sm font-semibold text-foreground">Cash on Delivery (COD) Selected</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pay in cash or swipe cards when the package is delivered to your doorstep. There are no additional transaction fees.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-foreground">Order Summary</h2>

              <Separator />

              {/* Items Listing Scrollable */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="size-12 rounded-lg object-cover bg-muted shrink-0 border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.product.brand}</p>
                      <p className="text-xs font-medium mt-0.5 text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-foreground">{formatPrice(cartTotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                    <span>Discount Savings</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className={deliveryFee === 0 ? "text-emerald-600 font-semibold" : "font-semibold text-foreground"}>
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-foreground text-sm">
                <span>Payable Amount</span>
                <span className="text-base">{formatPrice(finalTotal)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand/90 font-bold text-sm rounded-xl mt-4 flex items-center justify-center gap-2 shadow-sm"
              >
                Place Order & Pay {formatPrice(finalTotal)}
              </Button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground pt-1.5">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span>100% Safe and Secure Payments. Genuine Products only.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
