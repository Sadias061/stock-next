"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/type";
import { readProducts } from "../actions";
import EmptyState from "../components/EmptyState";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      if (email) {
        const products = await readProducts(email);
        if (products) {
          // Transformation des données pour garantir que categoryName est une chaîne
          const formattedProducts = products.map((product) => ({
            ...product,
            categoryName: product.categoryName || "Inconnu", // Valeur par défaut
          }));
          setProducts(formattedProducts);
        }

      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  useEffect(() => {
    if (email) {
      fetchProducts();
    }
  }, [email]);


  return (
    <Wrapper>
      <div className="overflow-x-auto">
        {products.length === 0 ? (
         <p className="text-center mt-10">Produits non trouvé.</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Category</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b">{product.price} €</td>
                  <td className="py-2 px-4 border-b">{product.categoryName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
