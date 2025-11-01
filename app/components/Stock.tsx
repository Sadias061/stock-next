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

    // Au montage du composant, récupérer la liste des produits pour le select.
    // On conserve la liste `products` en state afin de pouvoir pré-sélectionner
    // un produit lorsqu'un autre composant déclenche l'événement `openStockModal`.
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Écoute d'un événement personnalisé émis par un autre composant/page
    // (par exemple : la page Give quand l'utilisateur clique sur "Réapprovisionner").
    // Le détail de l'événement contient { productId } pour permettre la pré-sélection.
    useEffect(() => {
        const handler = (e: Event) => {
            // Caster en CustomEvent pour accéder à detail
            const ev = e as CustomEvent<{ productId: string | null }>;
            const pid = ev?.detail?.productId;

            if (pid) {
                // Si la liste des produits est déjà chargée, trouver le produit et le sélectionner.
                const prod = products.find((p) => p.id === pid);
                if (prod) {
                    setSelectedProductId(pid);
                    setSelectedProduct(prod);
                } else {
                    // Sinon, conserver l'id pour le sélectionner après le chargement des produits.
                    setSelectedProductId(pid);
                }
            }

            // Ouvrir la modal (ne fera rien si elle n'est pas montée).
            const modal = document.getElementById('my_modal_stock') as HTMLDialogElement | null;
            if (modal) modal.showModal();
        };

        window.addEventListener('openStockModal', handler as EventListener);
        return () => window.removeEventListener('openStockModal', handler as EventListener);
    }, [products]);

    // Si selectedProductId est défini mais que selectedProduct n'est pas encore peuplé,
    // essayer de le sélectionner lorsque products change
    useEffect(() => {
        if (selectedProductId && !selectedProduct && products.length > 0) {
            const prod = products.find((p) => p.id === selectedProductId);
            if (prod) setSelectedProduct(prod);
        }
    }, [selectedProductId, products, selectedProduct]);

    // Met à jour le produit sélectionné et son id lorsque l'utilisateur choisit
    // un produit dans le select.
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
            {/* On peut ouvrir la modal via document.getElementById('ID').showModal() */}
            <dialog id="my_modal_stock" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* si le formulaire contient un bouton, il fermera la modal (method dialog) */}
                        <button className="btn btn-sm btn-circle btn-secondary absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Gestion de stock</h3>
                    <p className="py-4">Ajouter des quantité aux produits disponibles dans votre stock</p>

                    <form className="space-y-2" onSubmit={handleSubmit}>
                        <label className='block'>Sélectionner un produit</label>
                        <select
                            // Bind the select value to `selectedProductId` so the correct
                            // option is shown when we pre-select a product programmatically.
                            value={selectedProductId}
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