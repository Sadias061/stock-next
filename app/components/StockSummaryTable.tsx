import { StockSummary } from '@/type';
import React, { useCallback, useEffect, useState } from 'react'
import { getStockSummary } from '../actions';
import ProducImage from './ProductImage';
import EmptyState from './EmptyState';

const StockSummaryTable = ({ email }: { email: string }) => {

  const [data, setData] = useState<StockSummary | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      if (email) {
        const data = await getStockSummary(email);
        if (data) {
          setData(data);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [email]);

  useEffect(() => {
    if (email)
      fetchSummary();
  }, [email, fetchSummary]);


  if (!data) {
    return (
      <div className='flex justify-center items-center w-full'>
        <span className="loading loading-dots loading-xl"></span>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <ul className="steps steps-vertical w-full border-2 border-secondary p-5 rounded-3xl">
        <li
          className="step step-primary"
        >
          <div>
            <span className='text-sm mr-4 font-bold'>Stock normal</span>
            <div className='badge badge-success p-3 rounded-lg'>{data.inStockCount}</div>
          </div>
        </li>

        <li
          className="step step-primary"
        >
          <div>
            <span className='text-sm mr-4 font-bold'>Stock faible (≤ 2)</span>
            <div className='badge badge-warning p-3 rounded-lg'>{data.lowStockCount}</div>
          </div>
        </li>

        <li
          className="step step-primary"
        >
          <div>
            <span className='text-sm mr-4 font-bold'>Rupture de stock</span>
            <div className='badge badge-error p-3 rounded-lg'>{data.outOfStockCount}</div>
          </div>
        </li>

      </ul>

      <div className='border-2 border-primary w-full p-5 rounded-3xl mt-4'>
        <h2 className='text-xl font-bold mb-4'>Produits critiques</h2>
        {data.cristalProducts.length > 0 ? (
         // min-w-full bg-white border border-gray-200
          <table className="table">
            <thead>
              <tr>
                <th className=""></th>
                <th>Image</th>
                <th>Nom</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              {data.cristalProducts.map((product, index) => (
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
                  <td className="capitalize">
                    {product.quantity} {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <EmptyState
          message={"Aucune produit critique pour le moment"}
          IconComponent="PackageX"
        />
          </div>
        )}
      </div>
    </div>
  )
}

export default StockSummaryTable