"use client";

import { useCallback, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  created_at: string;
};

export default function BossAdminPortalPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setLoadError("");
    const res = await fetch("/api/admin/leads", { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        setAuthed(false);
        setLeads(null);
        setLoadError("");
      } else {
        setLoadError(json.error ?? "Failed to load leads");
      }
      setLoadingLeads(false);
      return;
    }
    setLeads(json.leads ?? []);
    setLoadingLeads(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    setLoginLoading(false);
    if (!res.ok) {
      setLoginError("Invalid password.");
      return;
    }
    setPassword("");
    setAuthed(true);
    await fetchLeads();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthed(false);
    setLeads(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#00D1FF]">
              Agent leads
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-1">
              Private admin
            </p>
          </div>
          {authed && (
            <button
              type="button"
              onClick={handleLogout}
              className="self-start px-4 py-2 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5"
            >
              Log out
            </button>
          )}
        </header>

        {!authed && (
          <form
            onSubmit={handleLogin}
            className="max-w-sm space-y-4 p-8 rounded-3xl border border-white/10 bg-white/[0.03]"
          >
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00D1FF]"
              placeholder="••••••••"
            />
            {loginError && (
              <p className="text-red-400 text-xs font-bold">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl bg-[#00D1FF] text-[#0a0f18] font-black text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {loginLoading ? "Checking…" : "Unlock"}
            </button>
          </form>
        )}

        {authed && (
          <>
            {loadingLeads && !leads && (
              <p className="text-slate-500 text-sm animate-pulse">Loading…</p>
            )}
            {loadError && (
              <p className="text-red-400 text-sm mb-4">{loadError}</p>
            )}
            {leads && (
              <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="p-4 font-black">Name</th>
                        <th className="p-4 font-black">Email</th>
                        <th className="p-4 font-black">Company</th>
                        <th className="p-4 font-black">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-slate-500"
                          >
                            No leads yet.
                          </td>
                        </tr>
                      ) : (
                        leads.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-white/5 hover:bg-white/[0.02]"
                          >
                            <td className="p-4 font-medium">{row.name}</td>
                            <td className="p-4 text-slate-300">{row.email}</td>
                            <td className="p-4 text-slate-300">{row.company}</td>
                            <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                              {new Date(row.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => fetchLeads()}
              className="mt-6 px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/10"
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}
