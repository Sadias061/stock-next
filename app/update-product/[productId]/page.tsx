"use client";
import { readProductsById, updateProduct } from '@/app/actions';
import ProducImage from '@/app/components/ProductImage';
import Wrapper from '@/app/components/Wrapper';
import { FormDataType, Product } from '@/type';
import { useUser } from '@clerk/nextjs';
import { FileImage } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const Page = ({ params }: { params: Promise<{ productId: string }> }) => {

  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [product, setProduct] = React.useState<Product | null>(null);
  // recupération d'une image
  const [file, setFile] = useState<File | null>(null);
  // prévisualisation de l'image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryName: "",
  });

  const route = useRouter();

  const fetchProduct = useCallback(async () => {
    try {
      // Résolution de la promesse params pour obtenir productId
      const resolvedParams = await params;
      const { productId } = resolvedParams;

      // Vérification de l'email avant de continuer
      if (email) {
        const fetchedProduct = await readProductsById(productId, email);

        // Vérification si fetchedProduct est valide
        if (fetchedProduct && typeof fetchedProduct === 'object') {
          // Assurez-vous que categoryName est une chaîne valide
          const productToSet = {
            ...fetchedProduct,
            categoryName: fetchedProduct.categoryName || "",
          };

          setProduct(productToSet);

          // Met à jour le formData avec les données du produit récupéré
          setFormData({
            id: fetchedProduct.id,
            name: fetchedProduct.name,
            description: fetchedProduct.description,
            price: fetchedProduct.price,
            imageUrl: fetchedProduct.imageUrl,
            categoryName: fetchedProduct.categoryName || "",
          });
        } else {
          console.error("Le produit récupéré n'est pas valide", fetchedProduct);
        }
      }
    } catch (error) {
      console.log("Erreur lors de la récupération du produit", error);
    }
  }, [params, email]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData?.imageUrl; // Conserver l'ancienne URL de l'image par défaut

    try {
        if (file) {
            // Si une nouvelle image est fournie, supprimer l'ancienne et uploader la nouvelle
            const resDelete = await fetch("/api/upload", {
                method: "DELETE",
                body: JSON.stringify({ path: formData.imageUrl }),
                headers: { "Content-Type": "application/json" },
            });
            const dataDelete = await resDelete.json();
            if (!dataDelete.success) {
                throw new Error("Erreur lors de la suppression de l'image");
            }

            const imageData = new FormData();
            imageData.append("file", file);

            const req = await fetch("/api/upload", {
                method: "POST",
                body: imageData,
            });

            const data = await req.json();
            if (!data.success) {
                throw new Error("Erreur lors du téléchargement de l'image");
            }

            imageUrl = data.path; // Mettre à jour l'URL de l'image
        }

        // Mettre à jour les données du produit
        const updatedFormData = { ...formData, imageUrl };
        await updateProduct(updatedFormData, email);

        toast.success("Produit mis à jour avec succès");
        route.push("/products");
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit :", error);
        toast.error("Erreur lors de la mise à jour du produit");
    }
};

  return (
    <Wrapper>
      <div className="pb-4 md:pb-0">
        {product ? (
          <div>
            <h1 className='text-2xl font-bold mb-4'>Mise à jour du produit</h1>
            <div className="flex md:flex-row flex-col md:items-center gap-4">
              <form className="space-y-2" onSubmit={handleSubmit}>
                <div className="text-sm font-semibold mb-2">Nom</div>
                {/* nom produit */}
                <input
                  type="text"
                  placeholder="Nom du produit"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-primary border-2"
                />
                {/* description */}
                <div className="text-sm font-semibold mb-2">Description</div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    handleInputChange(e);
                    e.target.style.height = "auto"; // réinitialise la hauteur
                    e.target.style.height = e.target.scrollHeight + "px"; // ajuste selon le contenu
                  }}
                  placeholder="Description du produit"
                  className="textarea textarea-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 overflow-hidden resize-none focus:border-primary"
                  rows={1}
                />
                {/* catégorie produit */}

                <div className="text-sm font-semibold mb-2">Catégorie</div>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-primary border-2"
                  disabled
                />
                <div className="text-sm font-semibold mb-2">Image / Prix unitaire</div>
                <div className="flex gap-4">
                  {/* Image du produit */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered rounded-lg w-full 
                    border-2 focus:outline-none focus:ring-0 
                    focus:border-primary transition-colors duration-300
                    file:rounded-lg file:border-none file:bg-primary file:text-white file:w-25"
                  />
                  {/* prix */}
                  <input
                    type="number"
                    placeholder="Prix du produit"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-primary border-2"
                  />
                </div>
                <button
                  type='submit'
                  className="btn btn-primary rounded-lg w-full mt-2"
                >
                  Metter à jour
                </button>

              </form>

              <div className="flex md:flex-col flex-col md:ml-4 mt-4 md:mt-0">

                <div className="md:ml-4 md:w-[220px] md:h-[200px] mt-4 border-2 border-primary rounded-3xl p-5 flex justify-center items-center ">
                  {formData.imageUrl && formData.imageUrl !== "" ? (
                    <div className="text-center">
                      <ProducImage
                        src={formData.imageUrl}
                        alt={product.name}
                        heightClass="h-40"
                        widthClass="w-40"
                      />
                    </div>
                  ) : (
                    <div className="wiggle-animation">
                      <FileImage strokeWidth={1} className="w-15 h-15 text-primary" />
                    </div>
                  )}
                </div>

                <div className="md:ml-4 md:w-[220px] md:h-[200px] mt-4 border-2 border-primary rounded-3xl p-5 flex justify-center items-center">
                  {previewUrl && previewUrl !== "" ? (
                    <div className="text-center">
                      <ProducImage
                        src={previewUrl}
                        alt="Preview"
                        heightClass="h-40"
                        widthClass="w-40"
                      />
                    </div>
                  ) : (
                    <div className="wiggle-animation">
                      <FileImage strokeWidth={1} className="w-15 h-15 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <span className="loading loading-dots loading-xl"></span>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default Page