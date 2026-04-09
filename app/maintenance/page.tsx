export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#050A12] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-10">
          <div className="text-[#00D1FF] text-5xl font-black tracking-tighter">
            SECUPRO <span className="text-white">PRO</span>
          </div>
          <div className="mt-3 text-[10px] font-black uppercase tracking-[0.45em] text-slate-500">
            Centre de commandement
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            CENTRE DE COMMANDEMENT EN CONSTRUCTION
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Nos systèmes sont en cours de déploiement tactique. Ouverture
            imminente.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#00D1FF] animate-pulse shadow-[0_0_20px_rgba(0,209,255,0.55)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200/80">
              Initialisation…
            </span>
          </div>
        </div>

        <div className="mt-8 text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">
          © 2026 SECUPRO COMMAND SYSTEM
        </div>
      </div>
    </div>
  );
}

