"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategoryModal from "../components/CategoryModal";
import { useUser } from "@clerk/nextjs";
import {
  createCategory,
  deleteCategory,
  readCategories,
  updateCategory,
} from "../actions";
import { toast } from "react-toastify";
import { Category } from "@prisma/client";
import EmptyState from "../components/EmptyState";
import { Pencil, Trash } from "lucide-react";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [categories, setcategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    if (email) {
      const data = await readCategories(email);
      if (data) {
        setcategories(data);
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, [email]);

  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (
      document.getElementById("category-modal") as HTMLDialogElement
    )?.showModal();
  };

  const closeModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById("category-modal") as HTMLDialogElement)?.close();
  };

  // creation de la catégorie via le modal
  const handleCreateCategory = async () => {
    setLoading(true);
    if (email) {
      await createCategory(name, email, description);
    }
    await loadCategories();
    closeModal();
    setLoading(false);
    toast.success("Catégorie ajoutée avec succès");
  };

  // mise à jour de la catégorie via le modal
  const handleUpadateCategory = async () => {
    if (!editingCategoryId) return;
    setLoading(true);
    try {
      if (email) {
        await updateCategory(editingCategoryId, name, email, description);
      }
      await loadCategories();
      closeModal();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      toast.success("Catégorie été mise à jour avec succès");
    }
  };

  // suppression de la catégorie via le moda
  const handleDeleteCategory = async (categoryId: string) => {
    const confirmDelete = confirm(
      "Êtes-vous sûr de vouloir supprimer cette catégorie ? Tout les produits associés seront également supprimés"
    );
    if (!confirmDelete) return;

    await deleteCategory(categoryId, email);
    await loadCategories();
    toast.success("Catégorie supprimée avec succès");
  };

  // ouverture du modal avec les champ déjà remplir
  const openEditModal = (category: Category) => {
    setName(category.name);
    setDescription(category.description || " ");
    setEditMode(true);
    setEditingCategoryId(category.id);
    (
      document.getElementById("category-modal") as HTMLDialogElement
    )?.showModal();
  };

  return (
    <Wrapper>
      <div className="flex justify-end">
        <div className="mb-4">
          <button
            className="btn btn-primary rounded-lg"
            onClick={openCreateModal}
          >
            Ajouter une catégorie
          </button>
        </div>
      </div>

      {/* Listes des catégories */}
      {categories.length > 0 ? (
        <div className="">
          {categories.map((category) => (
            <div
              key={category.id}
              className="mb-2 p-5 border-2 border-base-300 rounded-lg flex justify-between items-center"
            >
              <div>
                <strong className="text-lg">{category.name}</strong>
                <div className="text-sm">{category.description}</div>
              </div>
              <div className="flex gap-2 ">
                <button
                  className="btn btn-sm rounded-lg btn-accent "
                  onClick={() => openEditModal(category)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm rounded-lg btn-secondary"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          message={"Aucune catégorie disponible"}
          IconComponent="Group"
        />
      )}

      <CategoryModal
        name={name}
        description={description}
        loading={loading}
        onclose={closeModal}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onSubmit={editMode ? handleUpadateCategory : handleCreateCategory}
        editMode={editMode}
      />
    </Wrapper>
  );
};

export default Page;
