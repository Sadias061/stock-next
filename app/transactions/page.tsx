"use client"
import React, { useCallback, useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs';
import { Product, Transaction } from '@/type';
import { getTransactions, readProducts } from '../actions';
import EmptyState from '../components/EmptyState';
import TransactionComponent from '../components/TransactionComponent';
import { RotateCcw } from 'lucide-react';

const Page = () => {
    // Récupération de l'utilisateur connecté
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;
    // État pour stocker les produits
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [dateStart, setDateStart] = useState<string>("");
    const [dateEnd, setDateEnd] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5; // Nombre d'éléments par page

    const fetchData = useCallback(async () => {
        try {
            if (email) {
                const products = await readProducts(email);
                const transactions = await getTransactions(email);
                if (products) {
                    // Transformation des données pour garantir que categoryName est une chaîne
                    const formattedProducts = products.map((product) => ({
                        ...product,
                        categoryName: product.categoryName || "Inconnu", // Valeur par défaut
                    }));
                    setProducts(formattedProducts);
                }
                if (transactions) {
                    setTransactions(transactions)
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [email]);

    useEffect(() => {
        fetchData();
    }, [email, fetchData]);

    // Filtrage des transactions
    const filteredTransactions = transactions.filter((tx) => {
        let isValid = true;

        if (selectedProduct) {
            isValid = isValid && tx.productId === selectedProduct.id;
        }

        if (dateStart) {
            const startOfDay = new Date(dateStart);
            startOfDay.setHours(0, 0, 0, 0); // Début de la journée
            isValid = isValid && new Date(tx.createdAt) >= startOfDay;
        }

        if (dateEnd) {
            const endOfDay = new Date(dateEnd);
            endOfDay.setHours(23, 59, 59, 999); // Fin de la journée
            isValid = isValid && new Date(tx.createdAt) <= endOfDay;
        }

        return isValid;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Gestion du changement de page
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    useEffect(() => {
        if (!dateStart && !dateEnd) {
            // Si aucun intervalle n'est sélectionné, afficher tous les produits
            setProducts(products);
            return;
        }

        // Filtrer les produits ayant des transactions dans l'intervalle sélectionné
        const filteredProducts = products.filter((product) => {
            return transactions.some((tx) => {
                const txDate = new Date(tx.createdAt).getTime(); // Convertir en timestamp
                const startOfDay = dateStart ? new Date(dateStart).setHours(0, 0, 0, 0) : null;
                const endOfDay = dateEnd ? new Date(dateEnd).setHours(23, 59, 59, 999) : null;

                return (
                    tx.productId === product.id &&
                    (!startOfDay || txDate >= startOfDay) &&
                    (!endOfDay || txDate <= endOfDay)
                );
            });
        });

        setProducts(filteredProducts);
    }, [dateStart, dateEnd, transactions, products]);

    // Correction de la syntaxe pour réinitialiser les filtres
    const resetFilters = () => {
        setSelectedProduct(null);
        setDateStart("");
        setDateEnd("");
    };

    return (
        <Wrapper>
            <div className="flex justify-between items-center flex-wrap gap-4">

                <div className="flex md:justify-between w-full mb-4 space-x-2 md:space-x-0">
                    <div className="">
                        <select
                            value={selectedProduct?.id || ""}
                            onChange={(e) => {
                                const product = products.find((p) => p.id === e.target.value) || null
                                setSelectedProduct(product)
                            }}
                            className="select select-bordered w-full border-2 rounded-lg focus:outline-none focus:ring-0 
                                focus:border-secondary transition-colors duration-300 pl-2 md:w-64"
                        >
                            <option value="">Tous les produits</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="text"
                            title='Date de début'
                            placeholder='Date de début'
                            value={dateStart}
                            // quand l'utilisateur clique sur le champ
                            onFocus={(e) => e.target.type = ("date")}
                            // quand l'utilisateur sort du champ 
                            onBlur={(e) => { if (!e.target.value) e.target.type = ("text") }}
                            onChange={(e) => setDateStart(e.target.value)}
                            className='input input-bordered w-full border-2 rounded-lg focus:outline-none focus:ring-0 
                                focus:border-secondary transition-colors duration-300 pl-2 '
                        />

                        {/* Date de fin */}
                        <input type="text"
                            title='Date de fin'
                            placeholder='Date de fin'
                            value={dateEnd}
                            // quand l'utilisateur clique sur le champ
                            onFocus={(e) => e.target.type = ("date")}
                            // quand l'utilisateur sort du champ 
                            onBlur={(e) => { if (!e.target.value) e.target.type = ("text") }}
                            onChange={(e) => setDateEnd(e.target.value)}
                            className='input input-bordered w-full border-2 rounded-lg focus:outline-none focus:ring-0 
                                focus:border-secondary transition-colors duration-300 pl-2 '
                        />

                        <button className='btn btn-ghost rounded-lg'
                            title='Réinitialiser les filtres'
                            onClick={resetFilters}
                        >
                            <RotateCcw />
                        </button>
                    </div>
                </div>

                {/* Table des transactions */}
                {transactions.length === 0 ? (
                    <EmptyState
                        message={"Aucune transaction disponible pour les filtres sélectionnés"}
                        IconComponent="CaptionsOff"
                    />
                ) : (
                    <div className="w-full space-y-2 ">
                        {currentTransactions.map((tx) => (
                            <TransactionComponent key={tx.id} tx={tx} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredTransactions.length > ITEMS_PER_PAGE && (
                    <div className="join  btn-secondary space-x-2">
                        <button className="join-item btn"
                            title='Page précédente'
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        <button className="join-item btn">
                            Page {currentPage}
                        </button>
                        <button className="join-item btn"
                            title='Page suivante'
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}
            </div>
        </Wrapper>
    )
}

export default Page
