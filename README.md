# AJIO Clone

A responsive and premium frontend-only e-commerce application imitating the look and feel of AJIO. <br/>
Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Zustand** for state management.

---

## 🚀 Key Features

*   **Product Listings & Filtering**: Category-wise filtering and search functionality.
*   **Search suggestions**: Dynamically displays search suggestions as the user types.
*   **Detailed Product Pages**: Displays descriptions, ratings, prices, discount calculation, stock status, and image galleries.
*   **Persistent Cart & Wishlist**: Powered by a unified Zustand store with local storage persistence.
*   **Responsive UI**: Optimized for mobile, tablet, and desktop screens with a high-contrast dark/light mode setup.

---

## 🛠️ Tech Stack

*   **Core**: React, TypeScript
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Routing**: React Router DOM
*   **Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **Icons**: Lucide React

---

## 🔌 API & Endpoints

This project consumes the public **[DummyJSON API](https://dummyjson.com/)** for fetching e-commerce resources. The custom API interaction layer is implemented in [dummyjson.ts](file:///c:/Users/karti/OneDrive/Desktop/ajio-clone/src/api/dummyjson.ts).

### Base URL
```
https://dummyjson.com
```

### Endpoints Used

| Endpoint | Method | Helper Function | Description & Usage |
| :--- | :--- | :--- | :--- |
| `/products/categories` | `GET` | `fetchCategories()` | Retrieves all categories. Used in [Footer.tsx](file:///c:/Users/karti/OneDrive/Desktop/ajio-clone/src/components/common/Footer.tsx) and header navigation. |
| `/products` | `GET` | `fetchProducts()` | Retrieves products. Fetches bulk limit of 200 items, filters out non-fashion categories (like `vehicle`, `motorcycle`, `laptops`, `groceries`), and paginates them client-side. |
| `/products/search` | `GET` | `fetchProducts({ search: query })`<br/>`fetchSearchSuggestions(query)` | Searches for products matching the query string. Used for searching and search suggestions. |
| `/products/category/{categorySlug}` | `GET` | `fetchCategoryProducts(categorySlug)` | Retrieves products belonging to a specific category. |
| `/products/{id}` | `GET` | `fetchProductById(id)` | Retrieves full details for a product by its numeric ID. Used in the product details view. |

---

## 📂 Project Structure

The project has a modular layout with a clear separation of concerns between pages, components, state management, and the API helper:

```
src/
├── api/             # API services & DummyJSON client integration
├── components/      # Reusable UI component libraries
│   ├── common/      # Shared elements (e.g., Footer)
│   ├── filters/     # Product filtering components
│   ├── navbar/      # Navigation and search bar
│   ├── product/     # Cards, image galleries, and listing components
│   └── ui/          # Raw Shadcn/UI primitive primitives
├── hooks/           # Custom React hooks
├── pages/           # Page-level components corresponding to routing
├── store/           # Zustand global state (cart, wishlist, search)
├── types/           # Global TypeScript type definitions
├── App.tsx          # Router layout & application shell setup
├── main.tsx         # Application entry point
└── index.css        # Tailwind CSS variables & themes
```

---

## 🚦 Routing Structure

Client-side routing is handled using `react-router-dom`. All pages are wrapped inside a common `Layout` component that keeps the header navigation (`Navbar`) and footer (`Footer`) persistent.

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Splash page showcasing top slide banners and featured category grid |
| `/products` | `ProductListingPage` | List of items with search, filters (size, price, ratings), sorting, and grid layout |
| `/product/:id` | `ProductDetailPage` | Full details, customer ratings, image selection gallery, and add-to-cart/wishlist buttons |
| `/cart` | `CartPage` | Overview of selected products, quantity selectors, checkout calculations, and coupon inputs |
| `/wishlist` | `WishlistPage` | Saved fashion items that users want to buy later |

---