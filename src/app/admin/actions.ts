'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/lib/users";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await findUserByEmail(user.email);

  if (!appUser || appUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return appUser;
}

export async function createCharity(formData: FormData) {
  await requireAdminUser();

  const name = formData.get("name");
  const description = formData.get("description");
  const imageUrl = formData.get("imageUrl");
  const featured = formData.get("featured") === "on";

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Charity name is required.");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Charity description is required.");
  }

  const normalizedImageUrl =
    typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;

  await prisma.$transaction(async (tx) => {
    if (featured) {
      await tx.charity.updateMany({
        data: { featured: false },
      });
    }

    await tx.charity.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        imageUrl: normalizedImageUrl,
        featured,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function setFeaturedCharity(formData: FormData) {
  await requireAdminUser();

  const charityId = formData.get("charityId");

  if (typeof charityId !== "string" || !charityId) {
    throw new Error("Charity selection is required.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.charity.updateMany({
      data: { featured: false },
    });

    await tx.charity.update({
      where: { id: charityId },
      data: { featured: true },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
