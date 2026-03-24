import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  Heart,
  History,
  Target,
  Trophy,
} from "lucide-react";
import { createCheckoutSession, recordScore, saveCharityPreference, saveSubscription } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUserProfile } from "@/lib/users";

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTodayDateInput() {
  return new Date().toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    return null;
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: appUser.id },
    include: {
      subscription: true,
      scores: {
        orderBy: {
          date: "desc",
        },
        take: 5,
      },
      charities: {
        include: {
          charity: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
      winnings: true,
    },
  });

  const featuredCharity = await prisma.charity.findFirst({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
  });
  const availableCharities = await prisma.charity.findMany({
    orderBy: [
      { featured: "desc" },
      { name: "asc" },
    ],
    take: 6,
  });

  const upcomingDraw = await prisma.draw.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const member = {
    ...appUser,
    subscription: fullUser?.subscription ?? null,
    scores: fullUser?.scores ?? [],
    charities: fullUser?.charities ?? [],
    winnings: fullUser?.winnings ?? [],
  };

  const latestScore = member.scores[0] ?? null;
  const selectedCharity = member.charities[0] ?? null;
  const spotlightCharity = selectedCharity?.charity ?? featuredCharity ?? null;
  const contributionPercentage = selectedCharity?.percentage ?? member.subscription?.charityPercentage ?? 10;

  const stats = [
    {
      label: "Subscription",
      value: member.subscription?.plan ?? "Not subscribed",
      sub: member.subscription
        ? `Renews ${member.subscription.currentPeriodEnd ? formatLongDate(member.subscription.currentPeriodEnd) : "soon"}`
        : "Choose a plan to unlock paid draws",
      icon: <CreditCard className="w-5 h-5 text-primary-400" />,
    },
    {
      label: "Latest Score",
      value: latestScore ? `${latestScore.value} pts` : "No scores yet",
      sub: latestScore ? `${formatShortDate(latestScore.date)} • Stableford` : "Record your first round below",
      icon: <Target className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: "Charity Share",
      value: `${contributionPercentage}%`,
      sub: spotlightCharity?.name ?? "No charity selected yet",
      icon: <Heart className="w-5 h-5 text-accent-400" />,
    },
    {
      label: "Draw Entries",
      value: String(member.scores.length),
      sub: member.scores.length
        ? "Recent verified rounds in your rolling set"
        : "Add scores to start building entries",
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-display text-white mb-2 tracking-tight">
            Welcome back, <span className="text-primary-500">{member.name ?? member.email.split("@")[0]}</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Your dashboard is now connected to Supabase Auth and Prisma.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                {stat.sub}
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl -mr-16 -mt-16" />

              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Enter Score</h2>
                  <p className="text-slate-400 text-sm">Save your Stableford result to your live member record.</p>
                </div>
              </div>

              <form action={recordScore} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="score">
                    Score Value
                  </label>
                  <input
                    id="score"
                    name="score"
                    type="number"
                    min="1"
                    max="45"
                    placeholder="e.g. 36"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="date">
                    Play Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={getTodayDateInput()}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 shadow-xl shadow-primary-500/10">
                  Record Score
                </button>
              </form>

              <div className="mt-8 flex items-center space-x-3 text-amber-500 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>Scores are now stored in your real Prisma database and reflected in the history panel below.</p>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
              <div className="mb-8 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Membership Plan</h2>
                  <p className="text-slate-400 text-sm">Create or update your membership record in Prisma.</p>
                </div>
              </div>

              <form action={saveSubscription} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="plan">
                    Plan
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    defaultValue={member.subscription?.plan ?? "MONTHLY"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    <option value="MONTHLY" className="bg-slate-950 text-white">
                      MONTHLY
                    </option>
                    <option value="YEARLY" className="bg-slate-950 text-white">
                      YEARLY
                    </option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-4 sm:w-auto sm:px-8">
                  {member.subscription ? "Update Plan" : "Activate Membership"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
                <p className="font-semibold text-white">
                  {member.subscription
                    ? `${member.subscription.plan} membership is ${member.subscription.status}.`
                    : "No active membership yet."}
                </p>
                <p className="mt-1 text-slate-400">
                  {member.subscription?.currentPeriodEnd
                    ? `Current billing period ends on ${formatLongDate(member.subscription.currentPeriodEnd)}.`
                    : "Activate a plan now so subscription status is driven from the database."}
                </p>
              </div>

              <form action={createCheckoutSession} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="stripePlan">
                    Stripe checkout plan
                  </label>
                  <select
                    id="stripePlan"
                    name="plan"
                    defaultValue={member.subscription?.plan ?? "MONTHLY"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    <option value="MONTHLY" className="bg-slate-950 text-white">
                      MONTHLY
                    </option>
                    <option value="YEARLY" className="bg-slate-950 text-white">
                      YEARLY
                    </option>
                  </select>
                </div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/5 sm:w-auto">
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Stripe Checkout</span>
                </button>
              </form>

              <p className="mt-3 text-xs text-slate-500">
                Requires `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, and `STRIPE_YEARLY_PRICE_ID` in `.env`.
              </p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                  <History className="w-5 h-5 text-slate-400" />
                  <span>Recent Performance</span>
                </h3>
                <span className="text-sm text-primary-400">{member.scores.length} recent rounds</span>
              </div>

              <div className="space-y-4">
                {member.scores.length ? (
                  member.scores.map((score) => (
                    <div
                      key={score.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-xl text-white">
                          {score.value}
                        </div>
                        <div>
                          <p className="text-white font-semibold">Stableford Points</p>
                          <p className="text-slate-500 text-xs tracking-wide uppercase font-bold">
                            {formatDisplayDate(score.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-emerald-500 text-xs font-bold uppercase tracking-[0.2em]">
                        Recorded
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-slate-400">
                    No scores yet. Record your first round above to populate your dashboard history.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-accent-600/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6">Charity Spotlight</h3>
              <div className="aspect-video rounded-2xl bg-slate-800 mb-6 relative overflow-hidden">
                <Image
                  src={
                    spotlightCharity?.imageUrl ??
                    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300&h=200"
                  }
                  alt={spotlightCharity?.name ?? "Charity spotlight"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-60 grayscale transition-all duration-700 hover:grayscale-0"
                />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                {spotlightCharity?.name ?? "No featured charity yet"}
              </h4>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                {spotlightCharity?.description ??
                  "Once charities are seeded into the platform, members will be able to direct part of their subscription toward a chosen cause."}
              </p>
              <div className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">
                <span>Contribution</span>
                <span className="text-white">{contributionPercentage}%</span>
              </div>
              <form action={saveCharityPreference} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="charityId">
                    Choose charity
                  </label>
                  <select
                    id="charityId"
                    name="charityId"
                    defaultValue={selectedCharity?.charityId ?? ""}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    required
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-400">
                      Select a charity
                    </option>
                    {availableCharities.map((charity) => (
                      <option key={charity.id} value={charity.id} className="bg-slate-950 text-white">
                        {charity.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="percentage">
                    Contribution percentage
                  </label>
                  <input
                    id="percentage"
                    name="percentage"
                    type="number"
                    min="10"
                    max="100"
                    defaultValue={contributionPercentage}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    required
                  />
                </div>

                <button className="w-full rounded-2xl border border-white/10 py-4 text-sm font-bold text-white transition-all hover:bg-white/5">
                  Save charity preference
                </button>
              </form>

              {selectedCharity ? (
                <div className="mt-4 flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Current selection saved</span>
                </div>
              ) : null}
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary-600/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6">Draw Status</h3>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2 font-display">
                  {upcomingDraw ? `$${upcomingDraw.prizePool.toLocaleString()}` : "$0"}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {upcomingDraw ? "Current configured prize pool" : "Draw configuration pending"}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-slate-400">Cycle</span>
                  <span className="text-white font-medium">
                    {upcomingDraw ? `${upcomingDraw.month}/${upcomingDraw.year}` : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-slate-400">Status</span>
                  <span className="text-white font-medium">{upcomingDraw?.status ?? "Awaiting setup"}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-slate-400">Your wins</span>
                  <span className="text-white font-medium">{member.winnings.length}</span>
                </div>
              </div>
              <Link href="/how-it-works" className="mt-8 block text-center text-sm font-bold text-primary-400 hover:text-white transition-colors">
                How prizes are calculated →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
