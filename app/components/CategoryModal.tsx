import React from "react";

interface Props {
  name: string;
  description: string;
  loading: boolean;
  onclose: () => void;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: () => void;
  editMode?: boolean;
}

const CategoryModal: React.FC<Props> = ({
  name,
  description,
  loading,
  onclose,
  onChangeName,
  onChangeDescription,
  onSubmit,
  editMode,
}) => {
  return (
    <dialog id="category-modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onclose}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">
          {editMode ? "Modifier" : "Nouvelle catégorie"}
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Description de la catégorie"
          className="input input-bordered rounded-lg w-full focus:outline-none focus:ring-0 mb-4"
        />
        <button
          className="btn btn-primary rounded-lg"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? editMode
              ? "Modification..."
              : "Ajout..."
            : editMode
            ? "Modifier"
            : "Ajouter"}
        </button>
      </div>
    </dialog>
  );
};

export default CategoryModal;
