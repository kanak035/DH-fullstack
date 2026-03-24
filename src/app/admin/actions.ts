'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildDrawPreview, publishDraw } from "@/lib/draws";
import { prisma } from "@/lib/prisma";
import { enforceRollingScores } from "@/lib/scores";
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

export async function updateUserScore(formData: FormData) {
  await requireAdminUser();

  const scoreId = formData.get("scoreId");
  const rawValue = formData.get("value");
  const rawDate = formData.get("date");

  if (typeof scoreId !== "string" || !scoreId) {
    throw new Error("Score id is required.");
  }

  const value = Number(rawValue);
  const date = typeof rawDate === "string" ? new Date(rawDate) : null;

  if (!Number.isInteger(value) || value < 1 || value > 45) {
    throw new Error("Score must be a whole number between 1 and 45.");
  }

  if (!date || Number.isNaN(date.getTime())) {
    throw new Error("A valid score date is required.");
  }

  const existingScore = await prisma.score.findUnique({
    where: { id: scoreId },
  });

  if (!existingScore) {
    throw new Error("Score was not found.");
  }

  await prisma.score.update({
    where: { id: scoreId },
    data: {
      value,
      date,
    },
  });

  await enforceRollingScores(existingScore.userId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function runDrawSimulation(formData: FormData) {
  await requireAdminUser();

  const rawMonth = formData.get("month");
  const rawYear = formData.get("year");
  const logicType = formData.get("logicType");

  const month = Number(rawMonth);
  const year = Number(rawYear);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  if (!Number.isInteger(year) || year < 2024) {
    throw new Error("Year must be valid.");
  }

  if (logicType !== "RANDOM" && logicType !== "ALGORITHMIC") {
    throw new Error("Draw logic must be RANDOM or ALGORITHMIC.");
  }

  const preview = await buildDrawPreview(year, month, logicType);

  await prisma.draw.upsert({
    where: {
      month_year: {
        month,
        year,
      },
    },
    update: {
      status: "DRAFT",
      logicType,
      winningNums: preview.winningNumbers,
      prizePool: preview.prizePool,
    },
    create: {
      month,
      year,
      status: "DRAFT",
      logicType,
      winningNums: preview.winningNumbers,
      prizePool: preview.prizePool,
    },
  });

  revalidatePath("/admin");
}

export async function publishDrawAction(formData: FormData) {
  await requireAdminUser();

  const rawMonth = formData.get("month");
  const rawYear = formData.get("year");
  const logicType = formData.get("logicType");

  const month = Number(rawMonth);
  const year = Number(rawYear);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  if (!Number.isInteger(year) || year < 2024) {
    throw new Error("Year must be valid.");
  }

  if (logicType !== "RANDOM" && logicType !== "ALGORITHMIC") {
    throw new Error("Draw logic must be RANDOM or ALGORITHMIC.");
  }

  await publishDraw(year, month, logicType);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
