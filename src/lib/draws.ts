import { prisma } from "@/lib/prisma";

const MONTHLY_PLAN_AMOUNT = 19;
const YEARLY_PLAN_AMOUNT = 190;
const PRIZE_POOL_PERCENTAGE = 0.5;
const FIVE_MATCH_SHARE = 0.4;
const FOUR_MATCH_SHARE = 0.35;
const THREE_MATCH_SHARE = 0.25;

type DrawLogicType = "RANDOM" | "ALGORITHMIC";

function getMonthWindow(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return { start, end };
}

function getPlanContribution(plan: string) {
  if (plan === "YEARLY") {
    return (YEARLY_PLAN_AMOUNT / 12) * PRIZE_POOL_PERCENTAGE;
  }

  return MONTHLY_PLAN_AMOUNT * PRIZE_POOL_PERCENTAGE;
}

function countMatches(userNumbers: number[], winningNumbers: number[]) {
  const winningSet = new Set(winningNumbers);
  return userNumbers.filter((value) => winningSet.has(value)).length;
}

function pickUniqueRandomNumbers(pool: number[], count: number) {
  const values = [...pool];
  const selected: number[] = [];

  while (values.length && selected.length < count) {
    const index = Math.floor(Math.random() * values.length);
    selected.push(values[index]);
    values.splice(index, 1);
  }

  return selected.sort((a, b) => a - b);
}

function generateRandomWinningNumbers() {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  return pickUniqueRandomNumbers(pool, 5);
}

function generateAlgorithmicWinningNumbers(allScores: number[]) {
  if (!allScores.length) {
    return generateRandomWinningNumbers();
  }

  const frequencyMap = new Map<number, number>();

  for (const score of allScores) {
    frequencyMap.set(score, (frequencyMap.get(score) ?? 0) + 1);
  }

  const sortedByFrequency = [...frequencyMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([score]) => score);

  const selected = sortedByFrequency.slice(0, 5);

  if (selected.length < 5) {
    const filler = Array.from({ length: 45 }, (_, index) => index + 1).filter(
      (value) => !selected.includes(value),
    );
    selected.push(...pickUniqueRandomNumbers(filler, 5 - selected.length));
  }

  return selected.sort((a, b) => a - b);
}

async function getEligibleParticipants(year: number, month: number) {
  const { end } = getMonthWindow(year, month);

  return prisma.user.findMany({
    where: {
      subscription: {
        status: "ACTIVE",
        OR: [
          {
            currentPeriodEnd: null,
          },
          {
            currentPeriodEnd: {
              gte: end,
            },
          },
        ],
      },
    },
    include: {
      subscription: true,
      scores: {
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" },
        ],
        take: 5,
      },
    },
  });
}

async function getJackpotRollover(year: number, month: number) {
  const previousDraws = await prisma.draw.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { year: { lt: year } },
        {
          year,
          month: { lt: month },
        },
      ],
    },
    include: {
      winners: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
    take: 1,
  });

  const previousDraw = previousDraws[0];

  if (!previousDraw) {
    return 0;
  }

  const fiveMatchWinnerExists = previousDraw.winners.some(
    (winner) => winner.matchType === "FIVE",
  );

  if (fiveMatchWinnerExists) {
    return 0;
  }

  return previousDraw.prizePool * FIVE_MATCH_SHARE;
}

export async function buildDrawPreview(year: number, month: number, logicType: DrawLogicType) {
  const participants = await getEligibleParticipants(year, month);
  const allScores = participants.flatMap((participant) =>
    participant.scores.map((score) => score.value),
  );

  const activeSubscriberCount = participants.length;
  const basePrizePool = participants.reduce((total, participant) => {
    if (!participant.subscription) {
      return total;
    }

    return total + getPlanContribution(participant.subscription.plan);
  }, 0);
  const jackpotRollover = await getJackpotRollover(year, month);
  const prizePool = Number((basePrizePool + jackpotRollover).toFixed(2));
  const winningNumbers =
    logicType === "ALGORITHMIC"
      ? generateAlgorithmicWinningNumbers(allScores)
      : generateRandomWinningNumbers();

  const matchBuckets = {
    THREE: [] as { userId: string; userNumbers: number[] }[],
    FOUR: [] as { userId: string; userNumbers: number[] }[],
    FIVE: [] as { userId: string; userNumbers: number[] }[],
  };

  for (const participant of participants) {
    const userNumbers = participant.scores.map((score) => score.value);

    if (userNumbers.length < 5) {
      continue;
    }

    const matches = countMatches(userNumbers, winningNumbers);

    if (matches >= 3) {
      const key = matches === 5 ? "FIVE" : matches === 4 ? "FOUR" : "THREE";
      matchBuckets[key].push({
        userId: participant.id,
        userNumbers,
      });
    }
  }

  const tierPools = {
    FIVE: Number((prizePool * FIVE_MATCH_SHARE).toFixed(2)),
    FOUR: Number((prizePool * FOUR_MATCH_SHARE).toFixed(2)),
    THREE: Number((prizePool * THREE_MATCH_SHARE).toFixed(2)),
  };

  return {
    activeSubscriberCount,
    prizePool,
    jackpotRollover: Number(jackpotRollover.toFixed(2)),
    winningNumbers,
    logicType,
    matchBuckets,
    tierPools,
  };
}

export async function publishDraw(year: number, month: number, logicType: DrawLogicType) {
  const preview = await buildDrawPreview(year, month, logicType);

  const draw = await prisma.draw.upsert({
    where: {
      month_year: {
        month,
        year,
      },
    },
    update: {
      status: "PUBLISHED",
      logicType,
      winningNums: preview.winningNumbers,
      prizePool: preview.prizePool,
      winners: {
        deleteMany: {},
      },
    },
    create: {
      month,
      year,
      status: "PUBLISHED",
      logicType,
      winningNums: preview.winningNumbers,
      prizePool: preview.prizePool,
    },
  });

  const winnerCreates = [
    { type: "THREE", users: preview.matchBuckets.THREE, pool: preview.tierPools.THREE },
    { type: "FOUR", users: preview.matchBuckets.FOUR, pool: preview.tierPools.FOUR },
    { type: "FIVE", users: preview.matchBuckets.FIVE, pool: preview.tierPools.FIVE },
  ].flatMap(({ type, users, pool }) => {
    const individualPrize = users.length ? Number((pool / users.length).toFixed(2)) : 0;

    return users.map((winner) => ({
      drawId: draw.id,
      userId: winner.userId,
      matchType: type,
      prizeAmount: individualPrize,
    }));
  });

  if (winnerCreates.length) {
    await prisma.winner.createMany({
      data: winnerCreates,
    });
  }

  return { draw, preview };
}
