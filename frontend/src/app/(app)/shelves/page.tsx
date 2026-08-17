"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createShelf,
  getShelves,
  getStores,
  updateShelf,
  deleteShelf,
} from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/SearchInput";
import { Pagination } from "@/components/Pagination";
import { TableState } from "@/components/TableState";
import { AccessDenied } from "@/components/AccessDenied";
import { can } from "@/lib/permissions";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";

type Store = {
  id: number;
  name: string;
  location: string;
};

type Shelf = {
  id: number;
  shelf_name: string;
  zone_coordinates: string;
  store_id: number;
};

const PAGE_SIZE = 8;

export default function ShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [storeId, setStoreId] = useState<number>(1);
  const [shelfName, setShelfName] = useState("");
  const [zoneCoordinates, setZoneCoordinates] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  // null until the stored role has been read, so the guard below never flashes
  // Access Denied at a user who is actually permitted.
  const [role, setRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingShelves, setLoadingShelves] = useState(true);

  async function loadStores() {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const data = await getStores(token);
    setStores(data);

    if (data.length > 0) {
      setStoreId(data[0].id);
      loadShelves(data[0].id);
    } else {
      setLoadingShelves(false);
    }
  }

  async function loadShelves(id: number) {
    const token = localStorage.getItem("token");

    if (!token) return;

    setLoadingShelves(true);

    try {
      const data = await getShelves(id, token);
      setShelves(data);
    } finally {
      setLoadingShelves(false);
    }
  }

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
  }, []);

  useEffect(() => {
    if (role === null) return;

    // Don't call the shelf endpoints at all for a role the API would reject.
    if (!can(role, "viewShelves")) {
      setLoadingShelves(false);
      return;
    }

    loadStores();
  }, [role]);

  const filteredShelves = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return shelves;

    return shelves.filter((shelf) =>
      shelf.shelf_name.toLowerCase().includes(query)
    );
  }, [shelves, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredShelves.length / PAGE_SIZE)
  );

  const paginatedShelves = filteredShelves.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  function handleStoreChange(id: number) {
    setStoreId(id);
    setSearch("");
    setEditingId(null);
    setShelfName("");
    setZoneCoordinates("");
    loadShelves(id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) return;

    if (editingId === null) {
      await createShelf(storeId, shelfName, zoneCoordinates, token);
    } else {
      await updateShelf(editingId, shelfName, zoneCoordinates, token);
      setEditingId(null);
    }

    setShelfName("");
    setZoneCoordinates("");

    await loadShelves(storeId);
  }

  function handleEdit(shelf: Shelf) {
    setEditingId(shelf.id);
    setShelfName(shelf.shelf_name);
    setZoneCoordinates(shelf.zone_coordinates);
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");

    if (!token) return;

    if (!confirm("Delete this shelf?")) return;

    await deleteShelf(id, token);

    await loadShelves(storeId);
  }

  const selectedStoreName = stores.find((s) => s.id === storeId)?.name;

  if (role === null) {
    return null;
  }

  if (!can(role, "viewShelves")) {
    return <AccessDenied role={role} />;
  }

  const canManage = can(role, "manageShelves");

  return (
    <>
      <PageHeader
        title="Shelf Management"
        subtitle="Browse shelf zones and coordinates for any store."
      />

      <Card className="mb-6 p-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Store
        </label>

        <div className="relative max-w-sm">
          <select
            value={storeId}
            onChange={(e) => handleStoreChange(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white p-3 pr-10 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Select a store to view its shelves.
        </p>
      </Card>

      {canManage && (
        <Card className="mb-6 p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-900">
            {editingId === null
              ? `Add New Shelf${selectedStoreName ? ` — ${selectedStoreName}` : ""}`
              : "Edit Shelf"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <input
              value={shelfName}
              onChange={(e) => setShelfName(e.target.value)}
              placeholder="Shelf Name"
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <div className="md:col-span-2">
              <input
                value={zoneCoordinates}
                onChange={(e) => setZoneCoordinates(e.target.value)}
                placeholder="[(100,50),(250,50),(250,200),(100,200)]"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Format: a list of (x, y) polygon points defining the shelf zone.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 md:w-48"
            >
              <Plus className="h-4 w-4" />
              {editingId === null ? "Add Shelf" : "Update Shelf"}
            </button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {filteredShelves.length}{" "}
          {filteredShelves.length === 1 ? "shelf" : "shelves"}
          {selectedStoreName ? ` in ${selectedStoreName}` : ""}
        </p>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search shelves..."
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
                Shelf
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Zone Coordinates
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loadingShelves ? (
              <TableState
                colSpan={5}
                loading
                icon={LayoutGrid}
                message=""
              />
            ) : paginatedShelves.length === 0 ? (
              <TableState
                colSpan={5}
                loading={false}
                icon={LayoutGrid}
                message="No shelves found."
              />
            ) : (
              paginatedShelves.map((shelf) => (
                <tr
                  key={shelf.id}
                  className="border-t border-slate-100 transition-colors duration-150 odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/40"
                >
                  <td className="px-6 py-4 text-slate-500">{shelf.id}</td>

                  <td className="px-6 py-4 font-medium text-slate-900">
                    {shelf.shelf_name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {stores.find((s) => s.id === shelf.store_id)?.name}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-slate-500 break-all">
                    {shelf.zone_coordinates}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {canManage && (
                        <button
                          onClick={() => handleEdit(shelf)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                          aria-label="Edit shelf"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {canManage && (
                        <button
                          onClick={() => handleDelete(shelf.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                          aria-label="Delete shelf"
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
