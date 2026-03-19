import Link from "next/link";
import { ArrowUpRight, FileText, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-stone-50 text-black">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-16">
        <section className="enter-fade space-y-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            Knowledge Chat Workspace
          </p>
          <h1 className="max-w-xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Think faster with your own context.
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
            One place for chat and document retrieval.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              <MessageCircle className="h-4 w-4" />
              Open Chat
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-stone-100"
            >
              <FileText className="h-4 w-4" />
              Add PDFs
            </Link>
          </div>
        </section>

        <section className="enter-fade-delay relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-200/50 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <p className="text-sm font-medium text-stone-700">Workspace</p>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Live
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-stone-600">Upload complete</p>
              <div className="h-2 rounded-full bg-stone-100">
                <div className="h-full w-10/12 rounded-full bg-black" />
              </div>
            </div>

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm font-medium text-black"
            >
              Start asking
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
