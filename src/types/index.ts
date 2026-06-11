export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviewCount: number
  description: string
  category: string
  categoryName: string
  images: string[]
  image: string
  stock: number
  inStock: boolean
  reviews?: {
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
}

export interface Category {
  slug: string
  name: string
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface SortOption {
  label: string
  value: string
}

export interface SearchSuggestion {
  type: "product" | "query"
  text: string
  id?: number
  image?: string
}

export interface Address {
  id: string
  name: string
  phone: string
  streetAddress: string
  city: string
  state: string
  pinCode: string
  type: "Home" | "Work" | "Other"
  isDefault?: boolean
}

export interface PaymentInfo {
  method: "Card" | "COD" | "UPI" | "NetBanking"
  cardLast4?: string
  upiId?: string
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  subtotal: number
  savings: number
  deliveryFee: number
  total: number
  address: Address
  payment: PaymentInfo
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled"
}
