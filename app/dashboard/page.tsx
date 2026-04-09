"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from 'next/dynamic';

// 🛰️ IMPORT DU RADAR (SÉCURISÉ)
const MapRadar = dynamic(() => import('@/app/dashboard/components/MapRadar'), {
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-white/5 animate-pulse rounded-[2.5rem]" />
});

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [planning, setPlanning] = useState<any[]>([]);
  const [leadsCount, setLeadsCount] = useState(0); // ✅ LOGIQUE 1 : État pour les leads
  const [viewFilter, setViewFilter] = useState<'ALL' | 'URGENT'>('ALL');
  
  const ENT_ID = "05054cca-d92c-4a14-a66b-08aef3835cc7";

  const loadData = async () => {
    const { data: r } = await supabase
      .from("rapports")
      .select("*")
      .eq("entreprise_id", ENT_ID)
      .order("created_at", { ascending: false });
    const { data: p } = await supabase
      .from("planning")
      .select("*")
      .eq("entreprise_id", ENT_ID)
      .eq("statut", "ATTENTE");

    const { data: countData, error: countErr } = await supabase.rpc(
      "agent_leads_count"
    );
    if (!countErr && countData != null) {
      const n = Number(countData);
      if (!Number.isNaN(n)) setLeadsCount(n);
    }

    if (r) setReports(r);
    if (p) setPlanning(p);
  };

  useEffect(() => {
    loadData();

    // Realtime : tout INSERT/UPDATE/DELETE sur `rapports` pour cette entreprise → recharge la liste
    // (nécessite Realtime activé sur la table `rapports` dans Supabase + RLS lecture OK pour anon)
    const channel = supabase
      .channel(`rapports-entreprise-${ENT_ID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rapports",
          filter: `entreprise_id=eq.${ENT_ID}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" && err) {
          console.error("[Dashboard] Realtime rapports:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // FILTRAGE DU TABLEAU
  const displayedReports = viewFilter === 'URGENT' 
    ? reports.filter(r => r.type === 'ALERTE URGENCE') 
    : reports;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-8 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">SECUPRO <span className="text-red-600">COMMAND</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Secteur : PROTECT OPS</p>
        </div>
        {viewFilter === 'URGENT' && (
          <button onClick={() => setViewFilter('ALL')} className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-xl hover:bg-cyan-500 transition-all">
            Réinitialiser
          </button>
        )}
      </header>

      {/* 🟢 LES BOUTONS DE COMMANDE (PASSAGE À 3 COLONNES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* BOUTON 1 : TOTAL */}
        <button 
          onClick={() => setViewFilter('ALL')}
          className={`p-10 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
            viewFilter === 'ALL' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest relative z-10">Rapports Totaux</span>
          <div className="text-7xl font-black text-blue-500 leading-none mt-2 relative z-10">{reports.length}</div>
        </button>

        {/* BOUTON 2 : URGENT */}
        <button 
          onClick={() => setViewFilter('URGENT')}
          className={`p-10 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${
            viewFilter === 'URGENT' ? 'border-red-600 bg-red-600/20 shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest italic relative z-10 underline decoration-red-600/30">Alertes Critiques</span>
          <div className="text-7xl font-black text-red-600 leading-none mt-2 relative z-10">
            {reports.filter(r => r.type === 'ALERTE URGENCE').length}
          </div>
        </button>

        {/* ✅ BLOC 3 : PROSPECTS (LA MACHINE À CASH) */}
        <div className="p-10 rounded-[2.5rem] border-2 border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_40px_rgba(34,211,238,0.05)] text-left transition-all">
          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest relative z-10">Prospects Agents</span>
          <div className="text-7xl font-black text-white leading-none mt-2 relative z-10">{leadsCount}</div>
          <div className="text-[9px] font-bold text-cyan-400/50 mt-2 uppercase tracking-tighter italic">Inscriptions via secupro.app</div>
        </div>
      </div>

      {/* RADAR */}
      <div className="mb-10 rounded-[2.5rem] overflow-hidden border border-white/10">
        <MapRadar />
      </div>

      {/* TABLEAU FILTRÉ */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Flux de données : {viewFilter}</h2>
            <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full">{displayedReports.length} ENTITÉS</span>
        </div>
        <table className="w-full text-left">
          <tbody>
            {displayedReports.map((report) => (
              <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                <td className="p-8">
                  <div className="text-white font-black text-sm uppercase italic">"{report.agent_name}"</div>
                  <div className="text-slate-600 font-bold text-[9px] mt-1">{new Date(report.created_at).toLocaleTimeString()}</div>
                </td>
                <td className="p-8">
                  <span className={`px-4 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                    report.type === 'ALERTE URGENCE' ? 'border-red-600 text-red-500 bg-red-600/10' : 'border-cyan-600/30 text-cyan-500'
                  }`}>
                    {report.type}
                  </span>
                </td>
                <td className="p-8 text-[11px] text-slate-400 font-medium italic opacity-80 max-w-xs">
                  "{report.description}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}