import { useEffect, useState } from "react";
import { getProductsBySearchTerm } from "../api/asos-api";

function ProductList() {
  const [data, setData] = useState();
  useEffect(() => {
    // test
    getProductsBySearchTerm("t shirt").then((data) => setData(data));
  }, []);
  return <pre>{JSON.stringify(data)}</pre>;
}

export default ProductList;
