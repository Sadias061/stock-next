"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/type";
import { createProduct, readCategories } from "../actions";
import { FileImage } from "lucide-react";
import ProducImage from "../components/ProducImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  // redirection
  const router = useRouter();
  // fin de redirection
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setcategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
  });

  const handleChange = (
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (email) {
          const data = await readCategories(email);
          if (data) {
            setcategories(data);
          }
        }
      } catch (error) {
        console.log("Erreur lors de la récupération des catégories", error);
      }
    };
    fetchCategories();
  }, [email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Veuillez selectionner une image");
      return;
    }
    try {
      console.log("Envoi du fichier :", file.name);
      const imageData = new FormData();
      imageData.append("file", file);

      const req = await fetch("/api/upload", {
        method: "POST",
        body: imageData,
      });

      const data = await req.json();
      console.log("Réponse de l'API /api/upload :", data);

      if (!data.success) {
        throw new Error("Erreur lors du téléchargement de l'image");
      } else {
        formData.imageUrl = data.path;
        console.log("URL de l'image téléchargée :", formData.imageUrl);
        await createProduct(formData, email);
        toast.success("Produit créé avec succès");
        router.push("/products");
      }
    } catch (error) {
      console.error("Erreur dans handleSubmit :", error);
      toast.error(" il y a eu une erreur lors de la création du produit");
    }
  };

  return (
    <Wrapper>
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Créer un <span className="text-primary">produit</span>
          </h1>
          <section className="flex md:flex-row flex-col">
            <div className="space-y-4 md:w-[450px]">
              {/* nom produit */}
              <input
                type="text"
                placeholder="Nom du produit"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-primary border-2"
              />
              {/* description */}
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => {
                  handleChange(e);
                  e.target.style.height = "auto"; // réinitialise la hauteur
                  e.target.style.height = e.target.scrollHeight + "px"; // ajuste selon le contenu
                }}
                placeholder="Description du produit"
                className="textarea textarea-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 overflow-hidden resize-none focus:border-primary"
                rows={1}
              />
              {/* prix */}
              <input
                type="number"
                placeholder="Prix du produit"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4 focus:border-primary border-2"
              />

              {/* Catégorie associée */}
              <select
                value={formData.categoryId}
                onChange={handleChange}
                name="categoryId"
                className="select select-bordered w-full border-2 rounded-lg
           focus:outline-none focus:ring-0 
           focus:border-primary transition-colors duration-300 pl-2"
              >
                <option>Selectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Unité de mesure */}
              <select
                value={formData.unit}
                onChange={handleChange}
                name="unit"
                className="select select-bordered w-full border-2 rounded-lg
           focus:outline-none focus:ring-0 
           focus:border-primary transition-colors duration-300 pl-2"
              >
                <option>Selectionnez une unité de mesure</option>
                <option value="g">Gramme</option>
                <option value="kg">Kilogramme</option>
                <option value="l">Littre</option>
                <option value="m">Mètre</option>
                <option value="cm">Centimètre</option>
                <option value="h">Heure</option>
                <option value="pcs">Pièces</option>
                <option value="pcs">XOF</option>
              </select>

              {/* Image du produit */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered rounded-lg w-full 
           border-2 focus:outline-none focus:ring-0 
           focus:border-primary transition-colors duration-300
           file:rounded-lg file:border-none file:bg-primary file:text-white file:w-40"
              />

              <button
                onClick={handleSubmit}
                className="btn btn-primary rounded-lg w-full"
              >
                Créer le produit
              </button>
            </div>
          </section>
        </div>

        <div className="md:ml-5 md:w-[300px] md:h-[300px] mt-4 border-2 border-primary rounded-3xl p-5 flex justify-center items-center">
          {previewUrl && previewUrl !== "" ? (
            <div className="text-center">
              <ProducImage
                src={previewUrl}
                alt="Preview"
                heightClass="h-50"
                widthClass="w-50"
              />
            </div>
          ) : (
            <div className="wiggle-animation">
              <FileImage strokeWidth={1} className="w-15 h-15 text-primary" />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
