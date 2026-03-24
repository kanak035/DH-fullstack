import { redirect } from "next/navigation";
import { Check, Sparkles, Star } from "lucide-react";
import { createCharity, setFeaturedCharity } from "@/app/admin/actions";
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
                      {!charity.featured ? (
                        <form action={setFeaturedCharity}>
                          <input type="hidden" name="charityId" value={charity.id} />
                          <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/5">
                            Feature
                          </button>
                        </form>
                      ) : null}
                    </div>
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
      </div>
    </main>
  );
}
