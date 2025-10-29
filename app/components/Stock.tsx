"use client";
import { Product } from '@/type';
import { useUser } from '@clerk/nextjs';
import React, { useCallback, useEffect, useState } from 'react'
import { readProducts, replenishStockWithTransaction } from '../actions';
import ProductComponent from './ProductComponent';
import { toast } from 'react-toastify';

const Stock = () => {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    const handleProductChange = (productId: string) => {
        const product = products.find((p) => p.id === productId);
        setSelectedProduct(product || null);
        setSelectedProductId(productId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Logique pour ajouter la quantité au stock du produit sélectionné
        if (!selectedProductId || quantity <= 0) {
            toast.error("Veuillez entrer une quantité supérieure à 0.");
            return;
        }

        try {
            if (email) {
                // Appel à l'action pour ajouter la quantité au stock
                await replenishStockWithTransaction(selectedProductId, quantity, email);
            }
            toast.success("Le stock a été réapprovisionné avec succès");
            fetchProducts();
            setSelectedProductId("");
            setQuantity(0);
            setSelectedProduct(null);
            // fermeture de la modal    
            const modal = document.getElementById('my_modal_stock') as HTMLDialogElement;
            if (modal) {
                modal.close();
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la quantité au stock :", error);

        }
    }

    return (
        <div>
            {/* You can open the modal using document.getElementById('ID').showModal() method */}
            <dialog id="my_modal_stock" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-secondary absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Gestion de stock</h3>
                    <p className="py-4">Ajouter des quantité aux produits disponibles dans votre stock</p>

                    <form className="space-y-2" onSubmit={handleSubmit}>
                        <label className='block'>Sélectionner un produit</label>
                        <select
                            name={selectedProductId}
                            className="select select-bordered w-full border-2 rounded-lg focus:outline-none focus:ring-0 
                            focus:border-secondary transition-colors duration-300 pl-2 "
                            required
                            onChange={(e) => handleProductChange(e.target.value)}
                        >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} - {product.categoryName}
                                </option>
                            ))}
                        </select>
                        {selectedProduct && (
                            <ProductComponent product={selectedProduct} />
                        )}

                        <label className='block'>Quantité à ajouter</label>
                        <input
                            type="number"
                            className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 
                            focus:border-secondary border-2"
                            placeholder="Quantité à ajouter"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={0}

                        />

                        <button className="btn btn-secondary w-fit rounded-lg mt-2" type="submit">
                            Ajouter la quantité au stock
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    )
}

export default Stock