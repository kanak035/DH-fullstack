import { adminPanels } from "@/lib/site-data";

export default function AdminPage() {
  return (
    <main className="flex-1 px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
          Admin control room
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-brand-strong">
          Internal tools for draw operations, charities, winners, and reporting.
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          This route gives us a stable place to build the admin workflows
          required by the PRD without mixing them into the public marketing
          experience.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {adminPanels.map((panel) => (
            <article
              key={panel}
              className="card-shadow rounded-[1.75rem] border border-line bg-surface p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Planned module
              </p>
              <h2 className="mt-3 font-display text-2xl text-brand-strong">
                {panel}
              </h2>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
