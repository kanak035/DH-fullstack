import { prisma } from "@/lib/prisma";

export async function getDashboardWinnings(userId: string) {
  return prisma.winner.findMany({
    where: { userId },
    include: {
      draw: true,
    },
    orderBy: [
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ],
  });
}
