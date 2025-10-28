"use server";

import prisma from "@/lib/prisma";
import { FormDataType } from "@/type";
import { Category, Product } from "@prisma/client";

type ProductWithCategoryName = Product & { categoryName?: string };

// functions de vérification de l'existance de l'utilisateur
export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.association.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser && name) {
      await prisma.association.create({
        data: {
          email,
          name,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

// get User
export async function getUser(email: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.association.findUnique({
      where: {
        email,
      },
    });
    return existingUser;
  } catch (error) {
    console.log(error);
  }
}

// C A T E G O R I E S

// Création de catégorie
export async function createCategory(
  name: string,
  email: string,
  description: string
) {
  if (!name) return;
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucune association trouvée avec cet email");
    }
    await prisma.category.create({
      data: {
        name,
        description: description || "",
        associationId: user.id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// functiond de mise à jour
export async function updateCategory(
  id: string,
  name: string,
  email: string,
  description: string
) {
  if (!id || !email || !name) {
    throw new Error("Données manquantes");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucune association trouvée avec cet email");
    }
    await prisma.category.update({
      where: {
        id: id, // on verifie si l'id qui veut modifier est la même que celui lors de la création de cette catégorie
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      }, // les éléments à mettre à jour
      data: {
        name,
        description: description || "",
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// function de suppression
export async function deleteCategory(id: string, email: string) {
  if (!id || !email) {
    throw new Error("L'id et l'email de l'utilisateur sont requis");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    await prisma.category.delete({
      where: {
        id: id, // on verifie si l'id qui veut modifier est la même que celui lors de la création de cette catégorie
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// affichage des Categories selon l'utilisateur
export async function readCategories(
  email: string
): Promise<Category[] | undefined> {
  // retourne une liste de catégories s'il y a sinon indefini
  if (!email) {
    throw new Error("L'email de l'utilisateur est requis");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    const categories = await prisma.category.findMany({
      where: {
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      },
    });
    return categories;
  } catch (error) {
    console.log(error);
  }
}

// P R O D U I T S

// Création de produit
export async function createProduct(formData: FormDataType, email: string) {
  try {
    // verification sur le renseignement des champs
    const { name, description, price, imageUrl, categoryId, unit } = formData;
    if (!email || !name || !categoryId || !email) {
      throw new Error(
        "Le nom, la catégorie et l'email sont requis pour la création du produit"
      );
    }
    const safeImageUrl = imageUrl || "";
    const safeUnit = unit || "";

    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: Number(price),
        imageUrl: safeImageUrl,
        categoryId,
        unit: safeUnit,
        associationId: user.id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// functiond de mise à jour
export async function updateProduct(formData: FormDataType, email: string) {
  try {
    // verification sur le renseignement des champs
    const { id, name, description, price, imageUrl } = formData;
    if (!email || !name || !id || !email) {
      throw new Error(
        "L'id le nom et l'email sont requis pour la mise à jour du produit"
      );
    }

    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }

    await prisma.product.update({
      where: {
        id: id,
        associationId: user.id,
      },
      data: {
        name,
        description: description || "",
        price: Number(price),
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// function de suppression
export async function deleteProduct(id: string, email: string) {
  try {
    // verification sur le renseignement des champs
    if (!email || !id) {
      throw new Error(
        "L'id et l'email sont requis pour la suppression du produit"
      );
    }
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    await prisma.product.delete({
      where: {
        id: id,
        associationId: user.id,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// affichage des Produits selon l'utilisateur
export async function readProducts(
  email: string
): Promise<ProductWithCategoryName[] | undefined> {
  // retourne une liste de catégories s'il y a sinon indefini
  if (!email) {
    throw new Error("L'email de l'utilisateur est requis");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    const products = await prisma.product.findMany({
      where: {
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      },
      include: {
        category: true,
      },
    });
    return products.map((product) => ({
      ...product,
      categoryName: product.category?.name,
    }));
  } catch (error) {
    console.log(error);
  }
}

// affichage chaque produit
export async function readProductsById(
  productId: string,
  email: string
): Promise<ProductWithCategoryName | undefined> {
  // retourne une liste de catégories s'il y a sinon indefini
  if (!email) {
    throw new Error("L'email de l'utilisateur est requis");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      },
      include: {
        category: true,
      },
    });
    if (!product) {
      return undefined;
    }

    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function replenIshStockWithTransaction(
  productId: string,
  quantityToAdd: number,
  email: string
) {
  if (quantityToAdd <= 0) {
    throw new Error("La quantité à ajouter doit être supérieure à 0");
  }

  if (!email) {
    throw new Error("L'email de l'utilisateur est requis");
  }
  try {
    const user = await getUser(email);
    if (!user) {
      throw new Error("Aucun utilisateur trouvé avec cet email");
    }
    await prisma.product.update({
      where: {
        id: productId,
        associationId: user.id, // seul l'utilisateur ayant créer la catégorie pourra modifier sa catégorie
      },
      data: {
        quantity: {
          increment: quantityToAdd,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        productId: productId,
        type: "IN",
        quantity: quantityToAdd,
        associationId: user.id,
      },
    });

  } catch (error) {
    console.log(error);
  }

}
