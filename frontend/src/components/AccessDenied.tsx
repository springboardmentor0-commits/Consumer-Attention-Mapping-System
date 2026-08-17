"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { roleLabel } from "@/lib/permissions";

export function AccessDenied({ role }: { role?: string }) {
  return (
    <>
      <PageHeader
        title="Access Denied"
        subtitle="You don't have permission to view this page."
      />

      <Card className="p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Your role{role ? ` (${roleLabel(role)})` : ""} does not have access
          to this section.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Contact a SuperAdmin if you believe you need access.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          Back to Dashboard
        </Link>
      </Card>
    </>
  );
}
