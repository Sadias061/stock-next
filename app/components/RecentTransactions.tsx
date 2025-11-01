import { Transaction } from '@/type';
import React, { useCallback, useEffect, useState } from 'react'
import { getTransactions } from '../actions';
import EmptyState from './EmptyState';
import TransactionComponent from './TransactionComponent';

const RecentTransactions = ({ email }: { email: string }) => {

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const fetchData = useCallback(async () => {
        try {
            if (email) {
                // On récupère uniquement les 10 dernières transactions côté serveur
                const transactions = await getTransactions(email, 10);
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


    return (
        <div className='w-full border-2 border-secondary/50 mt-4 p-4 rounded-3xl'>
            {/* Table des transactions */}
            {transactions.length === 0 ? (
                <EmptyState
                    message={"Aucune transaction disponible pour les filtres sélectionnés"}
                    IconComponent="CaptionsOff"
                />
            ) : (
                <div className="">
                    <h2 className='text-xl font-bold mb-4'>10 dernières transactions</h2>
                    <div className='space-y-4'>
                        {transactions.map((tx) => (
                            <TransactionComponent key={tx.id} tx={tx} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecentTransactions