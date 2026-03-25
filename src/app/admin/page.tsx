import { redirect } from "next/navigation";
import { Check, Sparkles, Star, Trophy } from "lucide-react";
import {
  createCharity,
  deleteCharity,
  publishDrawAction,
  runDrawSimulation,
  setFeaturedCharity,
  updateCharity,
  updateUserScore,
  updateUserSubscription,
} from "@/app/admin/actions";
import { approveWinner, markWinnerPaid, rejectWinner } from "@/app/winners/actions";
import { buildDrawPreview } from "@/lib/draws";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { findUserByEmail } from "@/lib/users";

export default async function AdminPage() {
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

  const charities = await prisma.charity.findMany({
    orderBy: [
      { featured: "desc" },
      { updatedAt: "desc" },
    ],
  });
  const recentScores = await prisma.score.findMany({
    include: {
      user: true,
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
    take: 10,
  });
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();
  const drawPreview = await buildDrawPreview(currentYear, currentMonth, "RANDOM");
  const draws = await prisma.draw.findMany({
    include: {
      winners: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
    take: 6,
  });
  const winners = await prisma.winner.findMany({
    include: {
      user: true,
      draw: true,
    },
    orderBy: [
      { verificationStatus: "asc" },
      { payoutStatus: "asc" },
      { updatedAt: "desc" },
    ],
    take: 12,
  });
  const analytics = {
    totalUsers: await prisma.user.count(),
    activeSubscriptions: await prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
    totalPrizePool: await prisma.draw.aggregate({
      _sum: {
        prizePool: true,
      },
    }),
    charityContributions: await prisma.userCharity.aggregate({
      _sum: {
        percentage: true,
      },
    }),
  };

  function formatDateInput(date: Date) {
    return date.toISOString().split("T")[0];
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-400">
          Admin control room
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-white">
          Charity content management for the live member dashboard.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Create charities here, choose which one is featured, and those changes
          will appear immediately in the member dashboard charity panel.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-primary-500/15 p-3">
                <Sparkles className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Create charity</h2>
                <p className="text-sm text-slate-400">
                  Add a new organization to the member selection list.
                </p>
              </div>
            </div>

            <form action={createCharity} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Doctors Without Borders"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Describe what this charity does and why members might support it."
                  required
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" name="featured" className="h-4 w-4 accent-violet-500" />
                Mark as featured charity
              </label>

              <button className="w-full rounded-2xl bg-primary-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-primary-500">
                Save charity
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/15 p-3">
                <Star className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Existing charities</h2>
                <p className="text-sm text-slate-400">
                  Promote one charity to the featured slot used on the dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {charities.length ? (
                charities.map((charity) => (
                  <article
                    key={charity.id}
                    className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{charity.name}</h3>
                          {charity.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                              <Check className="h-3 w-3" />
                              Featured
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {charity.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!charity.featured ? (
                          <form action={setFeaturedCharity}>
                            <input type="hidden" name="charityId" value={charity.id} />
                            <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/5">
                              Feature
                            </button>
                          </form>
                        ) : null}
                        <form action={deleteCharity}>
                          <input type="hidden" name="charityId" value={charity.id} />
                          <button className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-200 transition hover:bg-red-500/20">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                    <form action={updateCharity} className="mt-4 grid gap-3 md:grid-cols-4">
                      <input type="hidden" name="charityId" value={charity.id} />
                      <input
                        name="name"
                        defaultValue={charity.name}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                      />
                      <input
                        name="imageUrl"
                        defaultValue={charity.imageUrl ?? ""}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                        placeholder="Image URL"
                      />
                      <input
                        name="description"
                        defaultValue={charity.description}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white md:col-span-2"
                      />
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                        <input type="checkbox" name="featured" defaultChecked={charity.featured} className="h-4 w-4 accent-violet-500" />
                        Featured
                      </label>
                      <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5 md:col-span-4">
                        Save changes
                      </button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-slate-400">
                  No charities yet. Create your first one using the form.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Recent score management</h2>
            <p className="mt-2 text-sm text-slate-400">
              Review and edit recent member scores. The rolling 5-score rule is enforced automatically after updates.
            </p>
          </div>

          <div className="space-y-4">
            {recentScores.length ? (
              recentScores.map((score) => (
                <form
                  key={score.id}
                  action={updateUserScore}
                  className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 lg:grid-cols-[1.4fr_120px_180px_auto]"
                >
                  <input type="hidden" name="scoreId" value={score.id} />
                  <div>
                    <p className="text-sm font-semibold text-white">{score.user.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      User score record
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Score
                    </label>
                    <input
                      name="value"
                      type="number"
                      min="1"
                      max="45"
                      defaultValue={score.value}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Date
                    </label>
                    <input
                      name="date"
                      type="date"
                      defaultValue={formatDateInput(score.date)}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/5">
                      Save
                    </button>
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-slate-400">
                No score records yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Reports and analytics</h2>
            <p className="mt-2 text-sm text-slate-400">
              Core counts and totals surfaced for the PRD reporting requirement.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Total users</p>
              <p className="mt-3 text-4xl font-semibold text-white">{analytics.totalUsers}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Active subscriptions</p>
              <p className="mt-3 text-4xl font-semibold text-white">{analytics.activeSubscriptions}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Prize pool total</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                ${(analytics.totalPrizePool._sum.prizePool ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Charity contribution sum</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                {analytics.charityContributions._sum.percentage ?? 0}%
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">User management</h2>
            <p className="mt-2 text-sm text-slate-400">
              View users, edit subscription state, and keep the access model aligned with the subscription engine.
            </p>
          </div>

          <div className="space-y-4">
            {users.length ? (
              users.map((member) => (
                <article key={member.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
                    <div>
                      <p className="text-lg font-semibold text-white">{member.email}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {member.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Current subscription</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {member.subscription ? `${member.subscription.plan} / ${member.subscription.status}` : "No subscription"}
                      </p>
                    </div>
                    <form action={updateUserSubscription} className="grid gap-3 md:grid-cols-[140px_140px_auto]">
                      <input type="hidden" name="userId" value={member.id} />
                      <select name="plan" defaultValue={member.subscription?.plan ?? "MONTHLY"} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
                        <option value="MONTHLY" className="bg-slate-950 text-white">MONTHLY</option>
                        <option value="YEARLY" className="bg-slate-950 text-white">YEARLY</option>
                      </select>
                      <select name="status" defaultValue={member.subscription?.status ?? "ACTIVE"} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
                        <option value="ACTIVE" className="bg-slate-950 text-white">ACTIVE</option>
                        <option value="INACTIVE" className="bg-slate-950 text-white">INACTIVE</option>
                        <option value="CANCELED" className="bg-slate-950 text-white">CANCELED</option>
                      </select>
                      <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5">
                        Save subscription
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-slate-400">
                No users found.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-primary-500/15 p-3">
                <Trophy className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Draw operations</h2>
                <p className="text-sm text-slate-400">
                  Simulate or publish the monthly draw with random or algorithmic logic.
                </p>
              </div>
            </div>

            <div className="mb-8 grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 md:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Active subscribers</p>
                <p className="mt-2 text-3xl font-semibold text-white">{drawPreview.activeSubscriberCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Current prize pool</p>
                <p className="mt-2 text-3xl font-semibold text-white">${drawPreview.prizePool.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Jackpot rollover</p>
                <p className="mt-2 text-3xl font-semibold text-white">${drawPreview.jackpotRollover.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Preview numbers</p>
                <p className="mt-2 text-lg font-semibold text-white">{drawPreview.winningNumbers.join(" • ")}</p>
              </div>
            </div>

            <form action={runDrawSimulation} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 md:grid-cols-[100px_120px_1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Month
                </label>
                <input
                  name="month"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue={currentMonth}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Year
                </label>
                <input
                  name="year"
                  type="number"
                  min="2024"
                  defaultValue={currentYear}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Logic
                </label>
                <select
                  name="logicType"
                  defaultValue="RANDOM"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="RANDOM" className="bg-slate-950 text-white">RANDOM</option>
                  <option value="ALGORITHMIC" className="bg-slate-950 text-white">ALGORITHMIC</option>
                </select>
              </div>
              <button className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/5">
                Run simulation
              </button>
            </form>

            <form action={publishDrawAction} className="mt-4 grid gap-4 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-5 md:grid-cols-[100px_120px_1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Month
                </label>
                <input
                  name="month"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue={currentMonth}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Year
                </label>
                <input
                  name="year"
                  type="number"
                  min="2024"
                  defaultValue={currentYear}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Logic
                </label>
                <select
                  name="logicType"
                  defaultValue="RANDOM"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="RANDOM" className="bg-slate-950 text-white">RANDOM</option>
                  <option value="ALGORITHMIC" className="bg-slate-950 text-white">ALGORITHMIC</option>
                </select>
              </div>
              <button className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
                Publish draw
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Recent draws</h2>
            <p className="mt-2 text-sm text-slate-400">
              Published and draft draw cycles with winner counts and prize pool totals.
            </p>

            <div className="mt-8 space-y-4">
              {draws.length ? (
                draws.map((draw) => (
                  <article key={draw.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {draw.month}/{draw.year}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                          {draw.logicType} • {draw.status}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                        {draw.winners.length} winners
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Prize pool</p>
                        <p className="mt-1 text-white">${draw.prizePool.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Winning numbers</p>
                        <p className="mt-1 text-white">
                          {Array.isArray(draw.winningNums) ? draw.winningNums.join(" • ") : "Not simulated"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tier spread</p>
                        <p className="mt-1 text-white">
                          {draw.winners.filter((winner) => winner.matchType === "THREE").length}/
                          {draw.winners.filter((winner) => winner.matchType === "FOUR").length}/
                          {draw.winners.filter((winner) => winner.matchType === "FIVE").length}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-slate-400">
                  No draws yet. Run a simulation or publish the current month.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Winner verification</h2>
            <p className="mt-2 text-sm text-slate-400">
              Review submitted proofs, approve or reject winner claims, and mark payouts complete.
            </p>
          </div>

          <div className="space-y-4">
            {winners.length ? (
              winners.map((winner) => (
                <article key={winner.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {winner.user.email} • {winner.draw.month}/{winner.draw.year} • {winner.matchType}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {winner.verificationStatus} • {winner.payoutStatus} • ${winner.prizeAmount.toFixed(2)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Proof: {winner.proofUrl ?? "Not submitted yet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <form action={approveWinner}>
                        <input type="hidden" name="winnerId" value={winner.id} />
                        <button className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                          Approve
                        </button>
                      </form>
                      <form action={rejectWinner}>
                        <input type="hidden" name="winnerId" value={winner.id} />
                        <button className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                          Reject
                        </button>
                      </form>
                      <form action={markWinnerPaid}>
                        <input type="hidden" name="winnerId" value={winner.id} />
                        <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5">
                          Mark paid
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-slate-400">
                No winners yet. Publish a draw to create winner records.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
