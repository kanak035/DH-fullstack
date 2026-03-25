import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  featured?: string;
};

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, featured } = await searchParams;
  const query = q?.trim() ?? "";
  const featuredOnly = featured === "1";

  const charities = await prisma.charity.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [
      { featured: "desc" },
      { updatedAt: "desc" },
    ],
  });
  const filteredCharities = featuredOnly
    ? charities.filter((charity) => charity.featured)
    : charities;

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-400">
            Charity directory
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-white">
            Explore verified charities and choose the cause behind your membership.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Search the directory, review spotlight organizations, and visit
            each charity profile before you subscribe.
          </p>
        </div>

        <form className="mt-10 max-w-xl" action="/charities">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Search charities
          </label>
          <div className="flex gap-3">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name or description"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <input type="hidden" name="featured" value={featuredOnly ? "1" : "0"} />
            <button className="rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-500">
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/charities${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              featuredOnly
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-primary-500/30 bg-primary-500/10 text-primary-200"
            }`}
          >
            All charities
          </Link>
          <Link
            href={`/charities?featured=1${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              featuredOnly
                ? "border-primary-500/30 bg-primary-500/10 text-primary-200"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Featured only
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCharities.length ? (
            filteredCharities.map((charity) => (
              <article
                key={charity.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur"
              >
                <div className="relative aspect-[16/10] bg-slate-900">
                  <Image
                    src={
                      charity.imageUrl ??
                      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800&h=500"
                    }
                    alt={charity.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover opacity-75"
                  />
                  {charity.featured ? (
                    <div className="absolute left-4 top-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Featured
                    </div>
                  ) : null}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-white">{charity.name}</h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-400">
                    {charity.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <span className="rounded-full border border-white/10 px-3 py-2 text-center">
                      Public profile
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-2 text-center">
                      Featured {charity.featured ? "yes" : "no"}
                    </span>
                  </div>
                  <Link
                    href={`/charities/${charity.id}`}
                    className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    View profile
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-slate-400">
              No charities found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
