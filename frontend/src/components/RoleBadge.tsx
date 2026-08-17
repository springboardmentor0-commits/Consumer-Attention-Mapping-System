import { roleLabel } from "@/lib/permissions";

export function RoleBadge({ role }: { role: string }) {
  if (!role) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {roleLabel(role)}
    </span>
  );
}
