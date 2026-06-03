import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import ProductList from "../pages/ProductList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/products",
    element: <ProductList />,
  },
  {
    path: "/products/:productId",
    element: <ProductDetails />,
  },
]);
