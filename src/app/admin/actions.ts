'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildDrawPreview, publishDraw } from "@/lib/draws";
import { sendEmail } from "@/lib/email";
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

  const { draw, preview } = await publishDraw(year, month, logicType);

  const winners = await prisma.winner.findMany({
    where: { drawId: draw.id },
    include: {
      user: true,
      draw: true,
    },
  });

  await Promise.all(
    winners.map((winner) =>
      sendEmail({
        to: winner.user.email,
        subject: `You have a ${winner.matchType}-match win in ${winner.draw.month}/${winner.draw.year}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #111;">
            <h1>Your draw result is in</h1>
            <p>You matched ${winner.matchType} numbers in the ${winner.draw.month}/${winner.draw.year} draw.</p>
            <p>Prize amount: ${winner.prizeAmount.toFixed(2)}</p>
            <p>Winning numbers: ${preview.winningNumbers.join(", ")}</p>
          </div>
        `,
      }),
    ),
  );

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function notifyWinnerDecision({
  winnerId,
  status,
}: {
  winnerId: string;
  status: "APPROVED" | "REJECTED" | "PAID";
}) {
  const winner = await prisma.winner.findUnique({
    where: { id: winnerId },
    include: {
      user: true,
      draw: true,
    },
  });

  if (!winner) {
    return;
  }

  const subjectMap = {
    APPROVED: "Your winner submission has been approved",
    REJECTED: "Your winner submission needs attention",
    PAID: "Your prize payout has been marked complete",
  } as const;

  const bodyMap = {
    APPROVED: "An admin has approved your proof submission. Your payout remains pending until marked complete.",
    REJECTED: "An admin has rejected your proof submission. Please review your uploaded proof and resubmit if needed.",
    PAID: "Your payout has been marked as paid in the admin panel.",
  } as const;

  await sendEmail({
    to: winner.user.email,
    subject: subjectMap[status],
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
        <h1 style="margin: 0 0 16px;">${subjectMap[status]}</h1>
        <p>${bodyMap[status]}</p>
        <p><strong>Draw:</strong> ${winner.draw.month}/${winner.draw.year}</p>
        <p><strong>Match type:</strong> ${winner.matchType}</p>
        <p><strong>Prize amount:</strong> ${winner.prizeAmount.toFixed(2)}</p>
      </div>
    `,
  });
}
