import { prisma } from "@/lib/prisma";

export async function enforceRollingScores(userId: string) {
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
  });

  const scoresToDelete = scores.slice(5);

  if (!scoresToDelete.length) {
    return;
  }

  await prisma.score.deleteMany({
    where: {
      id: {
        in: scoresToDelete.map((score) => score.id),
      },
    },
  });
}
