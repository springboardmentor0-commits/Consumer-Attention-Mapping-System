import Link from "next/link";
import { Radar, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Radar className="h-5 w-5" />
          </span>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Retail Intelligence Platform
          </p>

          <h1
            className="mt-4 text-5xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Consumer Attention Mapping System
          </h1>

          <div className="mt-6 h-px w-16 bg-emerald-200" />

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Gain real-time insights into how customers interact with your
            store. Analyze attention patterns, gaze direction, dwell time,
            movement paths, and product engagement to optimize shelf
            placement, improve product visibility, and increase sales
            through intelligent retail analytics.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.99]"
            >
              Login
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
