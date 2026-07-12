"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createStore,
  getStores,
  updateStore,
  deleteStore,
} from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/SearchInput";
import { Pagination } from "@/components/Pagination";
import { Pencil, Trash2, Plus, Store as StoreIcon } from "lucide-react";
import { TableState } from "@/components/TableState";

type Store = {
  id: number;
  name: string;
  location: string;
};

const PAGE_SIZE = 8;

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    const token = localStorage.getItem("token");
    setRole(localStorage.getItem("role") || "");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    try {
      const data = await getStores(token);
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return stores;

    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.location.toLowerCase().includes(query)
    );
  }, [stores, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStores.length / PAGE_SIZE)
  );

  const paginatedStores = filteredStores.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) return;

    if (editingId === null) {
      await createStore(name, location, token);
    } else {
      await updateStore(editingId, name, location, token);
      setEditingId(null);
    }

    setName("");
    setLocation("");

    await loadStores();
  }

  function handleEdit(store: Store) {
    setEditingId(store.id);
    setName(store.name);
    setLocation(store.location);
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");

    if (!token) return;

    if (!confirm("Delete this store?")) return;

    await deleteStore(id, token);
    await loadStores();
  }

  return (
    <>
      <PageHeader
        title="Store Management"
        subtitle="View and manage all retail store locations."
      />

      {role !== "Analyst" && (
        <Card className="mb-6 p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-900">
            {editingId === null ? "Add New Store" : "Edit Store"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3"
          >
            <input
              placeholder="Store Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <Plus className="h-4 w-4" />
              {editingId === null ? "Add Store" : "Update Store"}
            </button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {filteredStores.length}{" "}
          {filteredStores.length === 1 ? "store" : "stores"}
        </p>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search stores..."
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Store Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableState colSpan={4} loading icon={StoreIcon} message="" />
            ) : paginatedStores.length === 0 ? (
              <TableState
                colSpan={4}
                loading={false}
                icon={StoreIcon}
                message="No stores found."
              />
            ) : (
              paginatedStores.map((store) => (
                <tr
                  key={store.id}
                  className="border-t border-slate-100 transition-colors duration-150 odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/40"
                >
                  <td className="px-6 py-4 text-slate-500">{store.id}</td>

                  <td className="px-6 py-4 font-medium text-slate-900">
                    {store.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {store.location}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {role !== "Analyst" && (
                        <button
                          onClick={() => handleEdit(store)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                          aria-label="Edit store"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {role === "SuperAdmin" && (
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                          aria-label="Delete store"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>
    </>
  );
}
