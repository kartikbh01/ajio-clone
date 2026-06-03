import axios from "axios";

// Initialization
export const asosApi = axios.create({
  baseURL: import.meta.env.VITE_RAPIDAPI_BASE_URL,
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
    "x-rapidapi-host": import.meta.env.VITE_RAPIDAPI_HOST,
    "Content-Type": "application/json",
  },
});

// Categories
export async function getCategories() {
  const { data } = await asosApi.get("/getCategories");
  return data;
}

// Products
export async function getProductList({
  limit = 50,
  offset = 0,
  sort = "recommended",
}: {
  limit?: number;
  offset?: number;
  sort?: string;
} = {}) {
  const { data } = await asosApi.get("/getProductList", {
    params: {
      limit,
      offset,
      sort,
    },
  });

  return data;
}

// search suggestions
export async function getSearchSuggestions(query: string) {
  const { data } = await asosApi.get("/autoSuggestion", {
    params: {
      query,
    },
  });

  return data;
}

// search product
export async function getProductsBySearchTerm(
  searchTerm: string,
  limit = 50,
  offset = 0
) {
  const { data } = await asosApi.get("/getProductListBySearchTerm", {
    params: {
      searchTerm,
      limit,
      offset,
    },
  });

  return data;
}

// product details
export async function getProductDetails(productId: number | string) {
  const { data } = await asosApi.get("/getProductDetails", {
    params: {
      productId,
    },
  });

  return data;
}

// product suggestions
export async function getYouMightAlsoLike(productId: number | string) {
  const { data } = await asosApi.get("/getYouMightAlsoLike", {
    params: {
      productId,
    },
  });

  return data;
}

// product suggestions
export async function getPeopleAlsoBought(productId: number | string) {
  const { data } = await asosApi.get("/getPeopleAlsoBought", {
    params: {
      productId,
    },
  });

  return data;
}
