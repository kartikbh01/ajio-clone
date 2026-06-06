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
