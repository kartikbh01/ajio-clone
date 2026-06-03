# Fashion Store

A modern fashion e-commerce application built with React, TypeScript, Tailwind CSS, and React Router. The application uses the ASOS API (via RapidAPI) to provide product discovery, category browsing, search functionality, and detailed product information.

## Features

### Product Discovery

* Browse fashion products by category
* View trending and popular products
* Explore related recommendations

### Search Experience

* Real-time search suggestions
* Product search by keyword
* Fast and responsive search results

### Product Details

* Detailed product information
* Product images
* Pricing and brand information
* Available sizes and color variants (if provided by API)

### Recommendations

* You Might Also Like
* People Also Bought



## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* React Router
* Axios

### API

* ASOS API (RapidAPI)

---

## API Endpoints Used

Base URL: https://asos10.p.rapidapi.com/api/v1/

| Feature                 | Endpoint                            | URL 
| ----------------------- | ------------------------------------|---------------------------------------------------
| Categories              | **GET** getCategories               | /getCategories
| Product Listing         | **GET** getProductList              | /getProductList?limit=50&offset=0&sort=recommended
| Search Suggestions      | **GET** getAutoSuggestion           | /autoSuggestion?query=shir
| Product Search          | **GET** getProductListBySearchTerm  | /getProductListBySearchTerm?searchTerm=query
| Product Details         | **GET** getProductDetails           | /getProductDetails?productId=201748564
| Related Products        | **GET** getYouMightAlsoLike         | /getYouMightAlsoLike?productId=201748564
| Product Recommendations | **GET** getPeopleAlsoBought         | /getPeopleAlsoBought?productId=201748564

---

## Project Structure

```text
src/
├── pages/
│   ├── Home.tsx
│   ├── ProductListing.tsx
│   ├── ProductDetails.tsx
│   └── NotFound.tsx
├── routes/
    └── router.ts
├── api/
│   └── asos-api.ts
├── types/
├── utils/
└── main.tsx
```

---

## Application Routes

### Home Page

```text
/
```

Displays:

* Featured categories
* Trending products
* Search bar

### Category Page

```text
/category/:categoryId
```

Displays:

* Products belonging to a selected category
* Filtering and sorting options

### Search Results Page

```text
/search?q=shirt
```

Displays:

* Products matching the search query
* Pagination support

### Product Details Page

```text
/product/:productId
```

Displays:

* Product information
* Product gallery
* Related recommendations
* People also bought section

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_RAPIDAPI_HOST=your_rapidapi_host
VITE_API_BASE_URL=your_api_base_url
```
