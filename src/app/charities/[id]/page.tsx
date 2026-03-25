import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const charity = await prisma.charity.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!charity) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/charities" className="text-sm font-semibold text-primary-400 hover:text-primary-300">
          ← Back to charities
        </Link>

        <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">
          <div className="relative aspect-[21/9] bg-slate-900">
            <Image
              src={
                charity.imageUrl ??
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200&h=600"
              }
              alt={charity.name}
              fill
              sizes="100vw"
              className="object-cover opacity-80"
            />
          </div>
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl tracking-tight text-white">{charity.name}</h1>
              {charity.featured ? (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Featured
                </span>
              ) : null}
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
              {charity.description}
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Member support
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{charity.users.length}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Members currently linked to this charity.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Status
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {charity.featured ? "Spotlight" : "Listed"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Public directory entry ready for subscription selection.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Visibility
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {charity.featured ? "Featured" : "Listed"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {charity.featured
                    ? "Shown in the dashboard spotlight and on the public directory."
                    : "Available in the public directory and selection flow."}
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Upcoming events
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Golf day fundraiser</p>
                  <p className="mt-1 text-sm text-slate-400">Members can support the cause through seasonal charity golf events.</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Community outreach</p>
                  <p className="mt-1 text-sm text-slate-400">Public-facing events help members understand how their contribution is used.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
