import { Product } from '@/type';
import React from 'react'
import ProducImage from './ProducImage';
import { Plus } from 'lucide-react';

interface ProductComponentProps {
    product?: Product | null;
    add?: boolean;
    handleAddToCart?: (product: Product, quantity: number) => void;
}

const ProductComponent: React.FC<ProductComponentProps> = ({ product, add, handleAddToCart }: ProductComponentProps) => {
    if (!product) {
        return <div className='border-2 p-4 border-base-200 rounded-3xl w-full flex items-center'>Aucun produit sélectionné</div>;
    }

    return (
        <div className='border-2 p-4 border-base-300 rounded-3xl w-full flex items-center'>

            <div className='border-secondary border-2 rounded-2xl p-4 '>
                <ProducImage
                    src={product.imageUrl}
                    alt={product.imageUrl}
                    heightClass="h-30"
                    widthClass="w-30"
                />
            </div>

            <div className="ml-4 space-y-2 flex flex-col">
                <h2 className="text-lg font-bold">{product.name}</h2>
                <div className="badge badge-secondary">
                    <p className="text-sm text-gray-500">{product.categoryName}</p>
                </div>

                <div className="badge badge-secondary">
                    <p className="text-sm text-gray-500">{product.quantity} {product.unit}</p>
                </div>

                {add && handleAddToCart && (
                    <button
                        className="btn btn-secondary btn-circle btn-sm mt-2"
                        onClick={() => handleAddToCart(product, 1)}
                    >
                       <Plus  className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default ProductComponent