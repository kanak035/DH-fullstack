'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/lib/users";
import { notifyWinnerDecision } from "@/app/admin/actions";

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
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await findUserByEmail(user.email);

  if (!appUser) {
    redirect("/dashboard");
  }

  return appUser;
}

export async function submitWinnerProof(formData: FormData) {
  const appUser = await requireAuthenticatedUser();
  const winnerId = formData.get("winnerId");
  const proofUrl = formData.get("proofUrl");

  if (typeof winnerId !== "string" || !winnerId) {
    throw new Error("Winner id is required.");
  }

  if (typeof proofUrl !== "string" || !proofUrl.trim()) {
    throw new Error("A proof URL is required.");
  }

  const winner = await prisma.winner.findFirst({
    where: {
      id: winnerId,
      userId: appUser.id,
    },
  });

  if (!winner) {
    throw new Error("Winner record was not found.");
  }

  await prisma.winner.update({
    where: { id: winnerId },
    data: {
      proofUrl: proofUrl.trim(),
      verificationStatus: "PENDING",
    },
  });

  revalidatePath("/dashboard");
}

export async function approveWinner(formData: FormData) {
  await requireAdminUser();
  const winnerId = formData.get("winnerId");

  if (typeof winnerId !== "string" || !winnerId) {
    throw new Error("Winner id is required.");
  }

  await prisma.winner.update({
    where: { id: winnerId },
    data: {
      verificationStatus: "APPROVED",
    },
  });

  await notifyWinnerDecision({
    winnerId,
    status: "APPROVED",
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function rejectWinner(formData: FormData) {
  await requireAdminUser();
  const winnerId = formData.get("winnerId");

  if (typeof winnerId !== "string" || !winnerId) {
    throw new Error("Winner id is required.");
  }

  await prisma.winner.update({
    where: { id: winnerId },
    data: {
      verificationStatus: "REJECTED",
    },
  });

  await notifyWinnerDecision({
    winnerId,
    status: "REJECTED",
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function markWinnerPaid(formData: FormData) {
  await requireAdminUser();
  const winnerId = formData.get("winnerId");

  if (typeof winnerId !== "string" || !winnerId) {
    throw new Error("Winner id is required.");
  }

  await prisma.winner.update({
    where: { id: winnerId },
    data: {
      payoutStatus: "PAID",
    },
  });

  await notifyWinnerDecision({
    winnerId,
    status: "PAID",
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
