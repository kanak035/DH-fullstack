import Link from "next/link";

const steps = [
  {
    title: "Subscribe",
    body: "Choose a monthly or yearly plan and complete payment through Stripe.",
  },
  {
    title: "Track scores",
    body: "Enter your latest Stableford scores. The dashboard keeps only the latest five.",
  },
  {
    title: "Support a charity",
    body: "Select a charity and contribution percentage from the live directory.",
  },
  {
    title: "Enter monthly draws",
    body: "Your active subscription and rolling scores make you eligible for the monthly draw cycle.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-400">
          Draw mechanics
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl tracking-tight text-white">
          How the membership, scores, charity and monthly draw fit together.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
          The platform is built around a simple sequence: subscribe, log scores,
          choose a charity, and become eligible for the monthly draw engine.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Step {index + 1}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{step.body}</p>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-primary-900/30 to-accent-900/30 p-8">
          <h2 className="text-2xl font-semibold text-white">Prize structure</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">5-number match</p>
              <p className="mt-3 text-3xl font-semibold text-white">40%</p>
              <p className="mt-2 text-sm text-slate-400">Jackpot share, rolls over if unclaimed.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">4-number match</p>
              <p className="mt-3 text-3xl font-semibold text-white">35%</p>
              <p className="mt-2 text-sm text-slate-400">Paid from the monthly pool.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">3-number match</p>
              <p className="mt-3 text-3xl font-semibold text-white">25%</p>
              <p className="mt-2 text-sm text-slate-400">Smaller tier, split equally across winners.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Eligibility</p>
            <p className="mt-3 text-lg font-semibold text-white">Active subscription required</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Only members with an active plan and a rolling set of recent scores enter the monthly draw cycle.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Draw cadence</p>
            <p className="mt-3 text-lg font-semibold text-white">Executed once per month</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Admins can simulate before publish and then lock the draw result for the month.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Rollover</p>
            <p className="mt-3 text-lg font-semibold text-white">Jackpot carries forward</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              If nobody lands the top tier, that share rolls into the next month&apos;s prize pool.
            </p>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/subscribe" className="btn-primary inline-flex items-center justify-center px-8 py-3">
            Subscribe now
          </Link>
          <Link href="/charities" className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
            Explore charities
          </Link>
        </div>
      </div>
    </main>
  );
}
