'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUserProfile } from "@/lib/users";

export async function recordScore(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const rawValue = formData.get("score");
  const rawDate = formData.get("date");

  const value = Number(rawValue);
  const dateValue = typeof rawDate === "string" ? new Date(rawDate) : null;

  if (!Number.isInteger(value) || value < 1 || value > 45) {
    throw new Error("Score must be a whole number between 1 and 45.");
  }

  if (!dateValue || Number.isNaN(dateValue.getTime())) {
    throw new Error("A valid play date is required.");
  }

  await prisma.score.create({
    data: {
      userId: appUser.id,
      value,
      date: dateValue,
    },
  });

  revalidatePath("/dashboard");
}

export async function saveCharityPreference(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const charityId = formData.get("charityId");
  const rawPercentage = formData.get("percentage");
  const percentage = Number(rawPercentage);

  if (typeof charityId !== "string" || !charityId) {
    throw new Error("A charity selection is required.");
  }

  if (!Number.isInteger(percentage) || percentage < 10 || percentage > 100) {
    throw new Error("Contribution must be a whole number between 10 and 100.");
  }

  const charity = await prisma.charity.findUnique({
    where: { id: charityId },
  });

  if (!charity) {
    throw new Error("Selected charity was not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.userCharity.deleteMany({
      where: { userId: appUser.id },
    });

    await tx.userCharity.create({
      data: {
        userId: appUser.id,
        charityId,
        percentage,
      },
    });

    if (await tx.subscription.findUnique({ where: { userId: appUser.id } })) {
      await tx.subscription.update({
        where: { userId: appUser.id },
        data: {
          charityPercentage: percentage,
        },
      });
    }
  });

  revalidatePath("/dashboard");
}

export async function saveSubscription(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const plan = formData.get("plan");
  const validPlans = new Set(["MONTHLY", "YEARLY"]);

  if (typeof plan !== "string" || !validPlans.has(plan)) {
    throw new Error("A valid subscription plan is required.");
  }

  const existingCharitySelection = await prisma.userCharity.findFirst({
    where: { userId: appUser.id },
    orderBy: { updatedAt: "desc" },
  });

  const charityPercentage = existingCharitySelection?.percentage ?? 10;
  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (plan === "YEARLY" ? 12 : 1));

  await prisma.subscription.upsert({
    where: { userId: appUser.id },
    update: {
      plan,
      status: "ACTIVE",
      charityPercentage,
      currentPeriodStart: now,
      currentPeriodEnd,
    },
    create: {
      userId: appUser.id,
      plan,
      status: "ACTIVE",
      charityPercentage,
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  revalidatePath("/dashboard");
}
