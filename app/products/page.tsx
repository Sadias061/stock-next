"use client";
import React, { useEffect, useState, useCallback } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/type";
import { deleteProduct, readProducts } from "../actions";
import EmptyState from "../components/EmptyState";
import ProducImage from "../components/ProducImage";
import Link from "next/link";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
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
  }, [email]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = confirm(
      "Êtes-vous sûr de vouloir supprimer cet produit ?"
    );
    if (!confirmDelete) return;
    try {
      if (product.imageUrl) {
        const resDelete = await fetch("/api/upload", {
          method: "DELETE",
          body: JSON.stringify({ path: product.imageUrl }),
          headers : {"Content-Type" : "application/json"}
        })
        const dataDelete = await  resDelete.json()
        if (!dataDelete.success) {
          throw new Error("Erreur lors de la suppression de l'image")
        } else{
          if (email) {
            await deleteProduct(product.id, email)
            await fetchProducts()
            toast.success("Produit supprimé avec succès")
          }
        }
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Wrapper>
      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div>
            <EmptyState
              message={"Aucun produit disponible"}
              IconComponent="PackageSearch"
            />
          </div>
        ) : (
          // min-w-full bg-white border border-gray-200
          <table className="table">
            <thead>
              <tr>
                <th className=""></th>
                <th>Image</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <th>{index + 1}</th>
                  <td>
                    <ProducImage
                      src={product.imageUrl}
                      alt={product.imageUrl}
                      heightClass="h-12"
                      widthClass="w-12"
                    />
                  </td>
                  <td>
                    {product.name}
                  </td>
                  <td>
                    {product.description}
                  </td>
                  <td>
                    {product.price} €
                  </td>
                  <td className="capitalize">
                    {product.quantity} {product.unit}
                  </td>
                  <td>
                    {product.categoryName}
                  </td>
                  <td className="flex gap-2">
                    <Link href={`/update-product/${product.id}`} className="btn btn-sm btn-info rounded-lg" >
                      Modifier
                    </Link>
                    <button className="btn btn-sm w-fit btn-secondary rounded-lg" onClick={() => handleDeleteProduct(product)}>
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>

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
