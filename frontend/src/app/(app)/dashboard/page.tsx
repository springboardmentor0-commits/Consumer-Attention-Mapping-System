"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStores, getShelves } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/Card";
import { RoleBadge } from "@/components/RoleBadge";
import { OverviewItem } from "@/components/OverviewItem";
import {
  Store,
  LayoutGrid,
  ArrowRight,
  Mail,
  ShieldCheck,
  Camera,
  Activity,
} from "lucide-react";

type StoreRecord = {
  id: number;
  name: string;
  location: string;
};

export default function DashboardPage() {
  const [storeCount, setStoreCount] = useState(0);
  const [shelfCount, setShelfCount] = useState<number | null>(null);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    setEmail(localStorage.getItem("email") || "");

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const stores: StoreRecord[] = await getStores(token);

        if (Array.isArray(stores)) {
          setStoreCount(stores.length);

          const shelvesPerStore = await Promise.all(
            stores.map((store) =>
              getShelves(store.id, token).catch(() => [])
            )
          );

          const total = shelvesPerStore.reduce(
            (sum: number, shelves) =>
              sum + (Array.isArray(shelves) ? shelves.length : 0),
            0
          );

          setShelfCount(total);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadDashboard();
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of your retail intelligence platform."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Stores" value={storeCount} icon={Store} />

        <StatCard
          label="Total Shelves"
          value={shelfCount === null ? "—" : shelfCount}
          icon={LayoutGrid}
        />

        <Card className="p-6 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Current User
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Mail className="h-[18px] w-[18px]" />
            </div>
          </div>

          <p className="mt-3 truncate text-lg font-semibold text-slate-900">
            {email || "—"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RoleBadge role={role} />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active Session
            </span>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-900">
          Quick Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewItem label="Current Role" value={role || "—"} />

          <OverviewItem
            label="Total Stores"
            value={String(storeCount)}
            icon={Store}
          />

          <OverviewItem
            label="Total Shelves"
            value={shelfCount === null ? "Loading..." : String(shelfCount)}
            icon={LayoutGrid}
          />

          <OverviewItem
            label="Retail Analytics"
            value="Coming Soon"
            icon={Activity}
          />

          <OverviewItem
            label="Camera Integration"
            value="Not Configured"
            icon={Camera}
          />

          <OverviewItem
            label="Authentication"
            value="Secure (JWT)"
            icon={ShieldCheck}
          />
        </div>
      </Card>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Link href="/stores">
          <Card className="group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Store className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Manage Stores
                </p>
                <p className="text-sm text-slate-500">
                  View, add and edit store locations
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
          </Card>
        </Link>

        <Link href="/shelves">
          <Card className="group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <LayoutGrid className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Manage Shelves
                </p>
                <p className="text-sm text-slate-500">
                  Configure shelf zones per store
                </p>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
          </Card>
        </Link>
      </div>
    </>
  );
}
