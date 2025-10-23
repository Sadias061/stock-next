"use client";
import React, { useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/type";

const page = () => {
  // const { user } = useUser();
  // const email = user?.primaryEmailAddress?.emailAddress as string;
  // const [products, setProducts] = useState<Product[]>([]);

  // const fetchProducts = async () => {
  //   const response = await fetch(`/api/products?email=${email}`);
  //   const data = await response.json();
  //   setProducts(data);
  // };

  // fetchProducts();


  return (
    <Wrapper>
      <h1>Page produit</h1>
    </Wrapper>
  );
};

export default page;
