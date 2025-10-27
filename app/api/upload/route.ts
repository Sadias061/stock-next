import { existsSync } from "fs";
import { mkdir, writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    console.log("Requête POST reçue pour /api/upload");
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      console.error("Aucun fichier fourni dans la requête");
      return NextResponse.json({ success: false, message: "Aucun fichier fourni" }, { status: 400 });
    }

    console.log("Fichier reçu :", file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      console.log("Le répertoire d'upload n'existe pas, création en cours...");
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = file.name.split(".").pop();
    const uniqueName = crypto.randomUUID() + "." + ext;
    const filePath = join(uploadDir, uniqueName);
    console.log("Chemin complet du fichier :", filePath);

    await writeFile(filePath, buffer);
    const publicPath = `/uploads/${uniqueName}`;
    console.log("Fichier sauvegardé avec succès à :", publicPath);

    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error("Erreur dans POST:", error);
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("Requête DELETE reçue pour /api/upload");
    const { path } = await request.json();
    if (!path) {
      console.error("Chemin invalide fourni dans la requête");
      return NextResponse.json({ success: false, message: "Chemin invalide" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "public", path);
    console.log("Chemin complet du fichier à supprimer :", filePath);

    if (!existsSync(filePath)) {
      console.error("Fichier non retrouvé :", filePath);
      return NextResponse.json({ success: false, message: "Fichier non retrouvé" }, { status: 404 });
    }

    await unlink(filePath);
    console.log("Fichier supprimé avec succès :", filePath);
    return NextResponse.json({ success: true, message: "Fichier supprimé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur dans DELETE:", error);
    return NextResponse.json({ success: false, message: "Erreur interne du serveur" }, { status: 500 });
  }
}