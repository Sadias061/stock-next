import { ProductOverViewStats } from '@/type';
import React, { useCallback, useEffect, useState } from 'react'
import { getProductOverViewStats } from '../actions';
import { Box, DollarSign, ShoppingCart, Tag } from 'lucide-react';

const ProductOverView = ({ email }: { email: string }) => {

    const [stats, setStats] = useState<ProductOverViewStats | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            if (email) {
                const results = await getProductOverViewStats(email);
                if (results) {
                    setStats(results);
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [email]);

    function formatNumber(value: number): string {
        if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(1) + 'M';
            // return (value / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
        } else if (value >= 1_000) {
            return (value / 1_000).toFixed(1) + 'K';
        } else {
            return value.toString();
        }
    }

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);


    return (
        <div>
            {
                stats ? (
                    <div className='grid grid-cols-2 gap-4'>

                        <div className='border-2 p-4 border-base-300 rounded-3xl'>
                            <p className='stat-title'>Produits en stocks</p>
                            <div className="flex justify-between items-center">
                                <div className="stat-value">
                                    {stats.totalProducts}
                                </div>
                                <div className='bg-secondary/25 p-3 rounded-lg'>
                                    <Box className="w-6 h-6 text-secondary-content text-3xl flex justify-center items-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='border-2 p-4 border-base-300 rounded-3xl'>
                            <p className='stat-title'>Nombre de catégories</p>
                            <div className="flex justify-between items-center">
                                <div className="stat-value">
                                    {stats.totalCategories}
                                </div>
                                <div className='bg-secondary/25 p-3 rounded-lg'>
                                    <Tag className="w-6 h-6 text-secondary-content text-3xl flex justify-center items-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='border-2 p-4 border-base-300 rounded-3xl'>
                            <p className='stat-title'>Valeur total du stock</p>
                            <div className="flex justify-between items-center">
                                <div className="stat-value">
                                    {formatNumber(stats.stockValue)} $
                                </div>
                                <div className='bg-secondary/25 p-3 rounded-lg'>
                                    <DollarSign className="w-6 h-6 text-secondary-content text-3xl flex justify-center items-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='border-2 p-4 border-base-300 rounded-3xl'>
                            <p className='stat-title'>Total des transactions</p>
                            <div className="flex justify-between items-center">
                                <div className="stat-value">
                                    {stats.totalTransactions}
                                </div>
                                <div className='bg-secondary/25 p-3 rounded-lg'>
                                    <ShoppingCart className="w-6 h-6 text-secondary-content text-3xl flex justify-center items-center"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                )
                :
                (
                    <div className='flex justify-center items-center w-full'>
                        <span className="loading loading-bars loading-xl"></span>
                    </div>
                )
            }
        </div>
    )
}

export default ProductOverView