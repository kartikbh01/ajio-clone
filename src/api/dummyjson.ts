import type { Category, Product, SearchSuggestion } from "@/types"

const BASE_URL = "https://dummyjson.com"

export interface DummyProductRaw {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  thumbnail: string
  images: string[]
  reviews?: { rating: number; comment: string; reviewerName: string, reviewerEmail:string }[]
}

export interface DummyProductsResponse {
  products: DummyProductRaw[]
  total: number
  skip: number
  limit: number
}

export interface DummyCategoryRaw {
  slug: string
  name: string
  url: string
}

export interface FetchProductsParams {
  limit?: number
  skip?: number
  search?: string
  category?: string
}

export interface FetchProductsResult {
  products: Product[]
  total: number
  skip: number
  limit: number
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const url = new URL(`${BASE_URL}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await fetch(url.toString())
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function mapDummyProduct(item: DummyProductRaw): Product {
  const discount = Math.round(item.discountPercentage)
  const originalPrice = discount > 0
    ? Math.round((item.price / (1 - item.discountPercentage / 100)) * 100) / 100
    : item.price
  const images = item.images?.length ? item.images : [item.thumbnail]

  return {
    id: item.id,
    name: item.title,
    brand: item.brand,
    price: item.price,
    originalPrice,
    discount,
    rating: item.rating,
    reviewCount: item.reviews?.length ?? 0,
    description: item.description,
    category: item.category,
    categoryName: formatCategoryName(item.category),
    images,
    image: item.thumbnail || images[0],
    stock: item.stock,
    inStock: item.stock > 0,
    reviews:item.reviews
  }
}

const CATEGORY_IMAGES: Record<string, string> = {
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
  fragrances: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80",
  furniture: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop&q=80",
  groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
  "home-decoration": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80",
  "kitchen-accessories": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80",
  laptops: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&auto=format&fit=crop&q=80",
  "mens-shirts": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
  "mens-shoes": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80",
  "mens-watches": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80",
  "mobile-accessories": "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&auto=format&fit=crop&q=80",
  motorcycle: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80",
  "skin-care": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&auto=format&fit=crop&q=80",
  smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
  "sports-accessories": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=80",
  sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80",
  tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
  tops: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80",
  vehicle: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&auto=format&fit=crop&q=80",
  "womens-bags": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
  "womens-dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80",
  "womens-jewellery": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80",
  "womens-shoes": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80",
  "womens-watches": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80",
}

function mapDummyCategory(item: DummyCategoryRaw): Category {
  return {
    slug: item.slug,
    name: item.name,
    image: CATEGORY_IMAGES[item.slug] || `https://placehold.co/400x500/f5f5f5/333?text=${encodeURIComponent(item.name)}`,
  }
}

const EXCLUDED_CATEGORIES = ["vehicle", "motorcycle", "laptops", "groceries"]

export async function fetchProducts(params: FetchProductsParams = {}): Promise<FetchProductsResult | null> {
  if (params.category && EXCLUDED_CATEGORIES.includes(params.category)) {
    return { products: [], total: 0, skip: params.skip ?? 0, limit: params.limit ?? 24 }
  }

  // To ensure correct client-side filtering and pagination, we fetch all items matching the path
  // from DummyJSON API, filter out the excluded ones, and then paginate manually.
  const query: Record<string, string> = {
    limit: "200",
  }

  let path = "/products"
  if (params.search) {
    path = "/products/search"
    query.q = params.search
  } else if (params.category) {
    path = `/products/category/${params.category}`
  }

  const data = await apiFetch<DummyProductsResponse>(path, query)
  if (!data) return null

  // Map and filter out the excluded categories
  const allFilteredProducts = data.products
    .map(mapDummyProduct)
    .filter((p) => !EXCLUDED_CATEGORIES.includes(p.category))

  // Paginate manually
  const limit = params.limit ?? 24
  const skip = params.skip ?? 0
  const paginatedProducts = allFilteredProducts.slice(skip, skip + limit)

  return {
    products: paginatedProducts,
    total: allFilteredProducts.length,
    skip,
    limit,
  }
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const data = await apiFetch<DummyProductRaw>(`/products/${id}`)
  if (!data) return null
  const product = mapDummyProduct(data)
  if (EXCLUDED_CATEGORIES.includes(product.category)) return null
  return product
}

const CATEGORY_PRIORITY: Record<string, number> = {
  "womens-dresses": 1,
  "mens-shirts": 2,
  "tops": 3,
  "womens-shoes": 4,
  "mens-shoes": 5,
  "womens-bags": 6,
  "womens-jewellery": 7,
  "sunglasses": 8,
  "womens-watches": 9,
  "mens-watches": 10,
  "beauty": 11,
  "skin-care": 12,
  "fragrances": 13,
  "sports-accessories": 14,
  "mobile-accessories": 15,
  "smartphones": 16,
  "tablets": 17,
  "home-decoration": 18,
  "furniture": 19,
  "kitchen-accessories": 20,
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await apiFetch<DummyCategoryRaw[]>("/products/categories")
  if (!data) return []
  const mapped = data
    .filter((cat) => !EXCLUDED_CATEGORIES.includes(cat.slug))
    .map(mapDummyCategory)
  return mapped.sort((a, b) => {
    const aPriority = CATEGORY_PRIORITY[a.slug] ?? 999
    const bPriority = CATEGORY_PRIORITY[b.slug] ?? 999
    return aPriority - bPriority
  })
}

export async function fetchCategoryProducts(
  categorySlug: string,
  params: { limit?: number; skip?: number } = {}
): Promise<FetchProductsResult | null> {
  return fetchProducts({
    category: categorySlug,
    limit: params.limit ?? 8,
    skip: params.skip ?? 0,
  })
}

export async function fetchSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (query.length < 2) return []
  const result = await fetchProducts({ search: query, limit: 10 })
  if (!result) return []
  return result.products.map((p) => ({
    type: "product" as const,
    text: p.name,
    id: p.id,
    image: p.image,
  }))
}
