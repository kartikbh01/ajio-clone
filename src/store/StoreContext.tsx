import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem, Product, Address, Order } from "../types"

interface StoreState {
  cart: CartItem[]
  wishlist: number[]
  recentSearches: string[]
  orders: Order[]
  savedAddresses: Address[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateCartQty: (productId: number, qty: number) => void
  toggleWishlist: (productId: number) => void
  isWishlisted: (productId: number) => boolean
  addRecentSearch: (q: string) => void
  clearRecentSearches: () => void
  addOrder: (order: Order) => void
  cancelOrder: (orderId: string) => void
  clearCart: () => void
  addAddress: (address: Address) => void
  removeAddress: (id: string) => void
  cartCount: number
  cartTotal: number
}

function getTotals(cart: CartItem[]) {
  return {
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }
}

const dummyAddresses: Address[] = [
  {
    id: "addr-1",
    name: "John",
    phone: "9876543210",
    streetAddress: "A-12, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pinCode: "201301",
    type: "Home",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "John doe",
    phone: "9876543210",
    streetAddress: "Logix Cyber Park, Tower C",
    city: "Noida",
    state: "Uttar Pradesh",
    pinCode: "201301",
    type: "Work",
    isDefault: false,
  }
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recentSearches: [],
      orders: [],
      savedAddresses: dummyAddresses,
      cartCount: 0,
      cartTotal: 0,

      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id)
          const cart = existing
            ? state.cart.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            : [...state.cart, { product, quantity: 1 }]

          return { ...getTotals(cart), cart }
        })
      },

      removeFromCart: (productId) => {
        set((state) => {
          const cart = state.cart.filter((item) => item.product.id !== productId)
          return { ...getTotals(cart), cart }
        })
      },

      updateCartQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId)
          return
        }

        set((state) => {
          const cart = state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity: qty } : item
          )
          return { ...getTotals(cart), cart }
        })
      },

      toggleWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        }))
      },

      isWishlisted: (productId) => get().wishlist.includes(productId),

      addRecentSearch: (query) => {
        const q = query.trim()
        if (!q) return

        set((state) => ({
          recentSearches: [q, ...state.recentSearches.filter((search) => search !== q)].slice(0, 8),
        }))
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }))
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "Cancelled" } : o
          ),
        }))
      },

      clearCart: () => {
        set({
          cart: [],
          cartCount: 0,
          cartTotal: 0,
        })
      },

      addAddress: (address) => {
        set((state) => {
          const updatedAddresses = address.isDefault
            ? state.savedAddresses.map((a) => ({ ...a, isDefault: false }))
            : state.savedAddresses
          return {
            savedAddresses: [...updatedAddresses, address],
          }
        })
      },

      removeAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.id !== id),
        }))
      },
    }),
    {
      name: "ajio_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
