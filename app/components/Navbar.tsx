import { UserButton, useUser } from "@clerk/nextjs";
import { HandHeart, ListTree, Menu, PackagePlus, PackageSearch, ShoppingBasket, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddUser } from "../actions";
import Stock from "./Stock";

const Navbar = () => {
  // recuperation des infos de l'utilisateur connecté
  const { user } = useUser();

  // variable pour le lien actif
  const pathname = usePathname();

  // menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  // Une liste de liens dynamiques
  const navLinks = [
    { href: "/products", label: "Produits", icon: ShoppingBasket },
    { href: "/new-product", label: "Nouveaux produits", icon: PackageSearch },
    { href: "/category", label: "Catégories", icon: ListTree },
    { href: "/give", label: "Donner", icon: HandHeart },
  ];

  // fonction pour mapper les liens
  const renderLinks = (baseClass: string) => {
    return (
      <>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const activeClass = isActive ? "btn-primary" : "btn-ghost";
          return (
            <Link
              href={href}
              key={href}
              className={`${baseClass} ${activeClass} btn-sm flex gap-2 items-center rounded-lg`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}

        <button className="btn btn-sm rounded-lg" onClick={() => (document.getElementById('my_modal_stock') as HTMLDialogElement).showModal()}>
          <Warehouse className="w-4 h-4" /> Alimenter le stock
        </button>
      </>
    );
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
      checkAndAddUser(user?.primaryEmailAddress?.emailAddress, user.fullName);
    }
  }, [user]);

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center cursor-pointer">
          <div className="p-2">
            <PackagePlus className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg">SadiaStock</span>
        </div>
        {/* fin logo */}

        {/* Bouton menu sur mobile */}
        <button
          className="btn w-fit btn-sm sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4" />
        </button>
        {/* Fin bouton menu sur mobile */}

        {/* Appel de la fonction renderLinks */}
        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks("btn")}
          <div className="border-2 border-primary rounded-full p-1 flex items-center justify-center shadow-sm hover:shadow-md transition">
            <UserButton />
          </div>
        </div>
        {/* fin appel */}
      </div>
      {/* Menu responsive */}
      <div
        className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${
          menuOpen ? "left-0" : "-left-full"
        }`}
      >
        <div className="flex justify-between">
          <div className="border-2 border-primary rounded-full p-1 flex items-center justify-center shadow-sm hover:shadow-md transition">
            <UserButton />
          </div>

          <button
            className="btn w-fit btn-sm sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderLinks("btn")}
      </div>

      <Stock />
    </div>
  );
};

export default Navbar;
