import Link from "next/link";

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-400">
          Subscription
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-white">
          Select a membership plan and continue through Stripe.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
          This page is a public entry point for the subscription flow. Members
          complete billing on the dashboard checkout path after login.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Monthly</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Flexible access</h2>
            <p className="mt-4 text-slate-400">
              Best for trying the platform and joining the draw cycle month by month.
            </p>
            <Link href="/login" className="mt-8 inline-flex rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-500">
              Continue to login
            </Link>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Yearly</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Discounted annual plan</h2>
            <p className="mt-4 text-slate-400">
              Best for committed members who want uninterrupted participation and charity support.
            </p>
            <Link href="/login" className="mt-8 inline-flex rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/5">
              Continue to login
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}
