import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ status: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads");

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const ext = file.name.split(".").pop();
  const uniqueName = crypto.randomUUID() + "." + ext;
  const filePath = join(uploadDir, uniqueName);
  const publicPath = `/uploads/${uniqueName}`;

  return NextResponse.json({ sucess: true, path: publicPath });
}
