"use client"
import { useUser } from '@clerk/nextjs';
import React, { useCallback, useState } from "react";
import { useEffect } from 'react';
import { deductStockWithTransaction, readProducts } from '../actions';
import Wrapper from '../components/Wrapper';
import { OrderItem, Product } from '@/type';
import ProductComponent from '../components/ProductComponent';
import EmptyState from '../components/EmptyState';
import { Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductImage from '../components/ProductImage';


const Page = () => {

    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            if (email) {
                const products = await readProducts(email);
                if (products) {
                    console.log("Produits récupérés :", products);
                    setProducts(products);
                } else {
                    console.log("Aucun produit récupéré");
                }
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des produits :", error);
        }
    }, [email]);

    useEffect(() => {
        if (email) {
            fetchProducts();
        }
    }, [email, fetchProducts]);

    const filteredAvailableProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const isNotSelected = !selectedProductIds.includes(product.id);
            console.log("Produit filtré :", product, "Correspond à la recherche :", matchesSearch, "Non sélectionné :", isNotSelected);
            return matchesSearch && isNotSelected;
        })
        .slice(0, 10); // Limiter à 10 résultats

    const handleAddToCart = (product: Product) => {
        setOrders(prevOrders => {
            const existingOrder = prevOrders.find((item) => item.productId === product.id);
            let updateOrder;
            if (existingOrder) {
                // Si le produit est déjà dans la commande, augmenter la quantité
                updateOrder = prevOrders.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
                        : item
                );
            } else {
                // Sinon, ajouter un nouvel élément de commande
                updateOrder = [
                    ...prevOrders,
                    {
                        productId: product.id,
                        quantity: 1,
                        unit: product.unit,
                        imageUrl: product.imageUrl,
                        name: product.name,
                        availableQuantity: product.quantity
                    }
                ];
            }

            setSelectedProductIds((prevIds) =>
                prevIds.includes(product.id) ? prevIds :
                    [...prevIds, product.id]);
            return updateOrder;
        });

    }

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 0) return; // Empêcher les quantités négatives

        setOrders((prevOrders) => {
            return prevOrders.map((order) => {
                if (order.productId === productId) {
                    return { ...order, quantity: newQuantity };
                }
                return order;
            });
        });
    };


    const handleRemoveFromCart = (productId: string) => () => {
        setOrders((prevOrders) => {
            const updatedOrder = prevOrders.filter((item) => item.productId !== productId);
            setSelectedProductIds((prevIds) => prevIds.filter((id) => id !== productId));
            return updatedOrder;
        });
    }

    const handleConfirmDonation = async () => {
        try {
            if (orders.length == 0) {
                toast("Le panier est vide, veuillez ajouter des produits avant de confirmer le don.");
                return;
            }

            // Vérifier si des quantités sont égales à 0
            const invalidOrders = orders.filter(order => order.quantity <= 0);
            if (invalidOrders.length > 0) {
                toast.error("Impossible d'effectuer un don avec une quantité de 0.");
                return;
            }

            // Demander confirmation si les quantités sont valides
            const confirmation = window.confirm("Êtes-vous sûr de vouloir effectuer ce don ?");
            if (!confirmation) {
                return;
            }

            const response = await deductStockWithTransaction(orders, email);

            if (response?.success) {
                toast.success("Don confirmé avec succès !");
                // Réinitialiser le panier après confirmation
                setOrders([]);
                setSelectedProductIds([]);
                // Rafraîchir la liste des produits disponibles
                fetchProducts();
            } else {
                toast.error(`${response?.message}`);
            }

        } catch (error) {
            console.error("Erreur lors de la confirmation du don :", error);
        }
    }

    return (
        <Wrapper>
            <div className="flex md:flex-row flex-col-reverse">
                <div className="md:w-1/3 w-full">
                    <input type="text"
                        name=""
                        placeholder="Rechercher un produit..."
                        className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-secondary border-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="space-y-2">
                        {filteredAvailableProducts.length > 0 ? (
                            filteredAvailableProducts.map((product, index) => (
                                <ProductComponent
                                    key={index}
                                    add={true}
                                    product={product}
                                    handleAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <EmptyState
                                message={"Aucun produit disponible"}
                                IconComponent="PackageSearch"
                            />
                        )}
                    </div>
                </div>

                <div className="md:w-2/3 p-4  md:ml-4 mb-4 md:mb-0 h-fit border-2 border-secondary rounded-3xl overflow-x-auto">
                    {orders.length > 0 ? (
                        <div className="">
                            <table className="table w-full scroll-auto">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Nom</th>
                                        <th>Quantité</th>
                                        <th>Unité</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((item) => (
                                        <tr key={item.productId}>
                                            <td>
                                                <ProductImage
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    heightClass="h-12"
                                                    widthClass="w-12"
                                                />
                                            </td>
                                            <td>{item.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                                                    className="border border-base-300 w-25 rounded-lg p-2 focus:outline-none focus:ring-0 mb-4 focus:border-secondary "
                                                />
                                            </td>
                                            <td className="capitalize">{item.unit}</td>
                                            <td>
                                                <button
                                                    className="btn btn-error btn-sm rounded-lg"
                                                    onClick={handleRemoveFromCart(item.productId)}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button 
                            className="btn btn-secondary rounded-lg mt-4 w-fit px-12"
                            onClick={handleConfirmDonation}
                            >
                                Confirmer le don
                            </button>
                        </div>
                    ) : (
                        <EmptyState
                            message={"Aucun produit dans le panier"}
                            IconComponent="HandHeart"
                        />
                    )}
                </div>
            </div>
        </Wrapper>
    )
}

export default Page