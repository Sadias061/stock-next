"use server";

import prisma from "@/lib/prisma";

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
  } catch (error) {}
}
