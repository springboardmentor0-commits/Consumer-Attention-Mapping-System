import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, logout } from "../lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [meRes, storesRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/stores"),
        ]);
        setUser(meRes.data);
        setStores(storesRes.data);
      } catch (err) {
        setError("Session expired or backend unreachable. Please sign in again.");
        router.push("/login");
      }
    }
    load();
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 px-6 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-signal">CAMS</p>
          <h1 className="text-lg font-semibold">Retail Attention Dashboard</h1>
        </div>
        <div className="text-right text-sm">
          {user && (
            <>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-ink/60 capitalize">{user.role.replaceAll("_", " ")}</p>
            </>
          )}
          <button onClick={handleLogout} className="text-signal underline text-xs mt-1">
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <h2 className="text-base font-medium mb-3">Stores</h2>
        {stores.length === 0 ? (
          <p className="text-sm text-ink/60">
            No stores registered yet. Use the API (POST /api/v1/stores) or an
            upcoming admin form to add your first store.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div key={store.id} className="border border-ink/10 rounded-lg p-4 bg-white">
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-ink/60">{store.location}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
