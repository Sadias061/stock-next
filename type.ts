import { Product as PrismaProduct } from "@prisma/client";

export interface Product extends PrismaProduct {
    categoryName: string;
}

// Données de Produit
export interface FormDataType {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  categoryId?: string;
  unit?: string;
   categoryName?: string;
  imageUrl?: string;
}
