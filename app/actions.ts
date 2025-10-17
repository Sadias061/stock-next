"use server";

import prisma from "@/lib/prisma";
import { Category } from "@prisma/client";

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
