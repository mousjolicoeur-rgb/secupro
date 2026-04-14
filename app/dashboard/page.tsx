"use client";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0f18] flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          SECU<span className="text-cyan-400">PRO</span>
        </h1>
        <p className="mt-4 text-slate-400 text-sm font-medium">
          Futur Dashboard SecuPRO — En construction
        </p>
        <div className="mt-6 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-700">
          © 2026 SecuPRO Command System
        </p>
      </div>
    </div>
  );
}
