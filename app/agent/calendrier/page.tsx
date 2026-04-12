'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from 'lucide-react';

type RDV = {
  id: string;
  titre: string;
  date: string;       // YYYY-MM-DD
  heure: string;      // HH:MM
  lieu: string;
  type: 'mission' | 'formation' | 'medical' | 'admin' | 'autre';
};

const TYPE_CONFIG = {
  mission:    { label: 'Mission',    color: '#00d1ff', bg: 'bg-[#00d1ff]/10',    border: 'border-[#00d1ff]/25'    },
  formation:  { label: 'Formation',  color: '#34d399', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25'  },
  medical:    { label: 'Médical',    color: '#f87171', bg: 'bg-red-500/10',       border: 'border-red-500/25'      },
  admin:      { label: 'Admin',      color: '#fbbf24', bg: 'bg-amber-500/10',    border: 'border-amber-500/25'    },
  autre:      { label: 'Autre',      color: '#818cf8', bg: 'bg-indigo-500/10',   border: 'border-indigo-500/25'   },
};

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['L','M','M','J','V','S','D'];

const EMPTY_FORM = { titre: '', date: '', heure: '', lieu: '', type: 'autre' as RDV['type'] };

export default function CalendrierPage() {
  const router = useRouter();

  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [rdvs, setRdvs] = useState<RDV[]>([]);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [saving, setSaving]     = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // ── Calendar grid ────────────────────────────────────────────────────────────
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Shift so week starts Monday (0=Mon … 6=Sun)
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const rdvsForDay = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return rdvs.filter(r => r.date === key);
  };

  // ── Add RDV ──────────────────────────────────────────────────────────────────
  const openAdd = (day?: number) => {
    const dateStr = day
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : '';
    setForm({ ...EMPTY_FORM, date: dateStr });
    setShowAdd(true);
  };

  const saveRdv = async () => {
    if (!form.titre || !form.date) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300)); // visual feedback
    const newRdv: RDV = { ...form, id: `${Date.now()}` };
    setRdvs(prev => [...prev, newRdv].sort((a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure)));
    setSaving(false);
    setShowAdd(false);
    setForm({ ...EMPTY_FORM });
  };

  const deleteRdv = (id: string) => setRdvs(prev => prev.filter(r => r.id !== id));

  // ── Selected day RDVs ────────────────────────────────────────────────────────
  const selectedDayRdvs = selectedDay ? rdvs.filter(r => r.date === selectedDay) : [];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const upcomingRdvs = rdvs.filter(r => r.date >= todayStr).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#060D18] text-white flex flex-col pb-16">

      {/* Header */}
      <div className="px-5 pt-10 pb-5">
        <button onClick={() => router.push('/agent/hub')}
          className="text-slate-500 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1 hover:text-indigo-400 transition-colors">
          ← Hub
        </button>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Agenda professionnel</p>
        <h1 className="text-indigo-400 text-3xl font-black tracking-tighter"
          style={{ textShadow: '0 0 20px rgba(129,140,248,0.5)' }}>
          MES RENDEZ-VOUS PRO
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(129,140,248,0.85)' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {rdvs.length} rendez-vous enregistré{rdvs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── CALENDAR ─────────────────────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95">
              <ChevronLeft size={16} />
            </button>
            <p className="text-white font-black text-sm uppercase tracking-widest">
              {MONTHS_FR[month]} {year}
            </p>
            <button onClick={nextMonth}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map((d, i) => (
              <div key={i} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-600">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells before first day */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e${i}`} className="aspect-square" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayRdvs = rdvsForDay(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;

              return (
                <button key={day}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={[
                    'aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all active:scale-95',
                    isToday    ? 'bg-indigo-500/20 border border-indigo-400/50' :
                    isSelected ? 'bg-white/[0.08] border border-white/20' :
                                 'border border-transparent hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <span className={`text-[11px] font-bold ${isToday ? 'text-indigo-300' : 'text-white/70'}`}>{day}</span>
                  {dayRdvs.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayRdvs.slice(0, 3).map(r => (
                        <span key={r.id} className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: TYPE_CONFIG[r.type].color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add button */}
          <button onClick={() => openAdd()}
            className="mt-4 w-full py-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/25 transition-all active:scale-95"
            style={{ boxShadow: '0 0 16px rgba(129,140,248,0.1)' }}>
            <Plus size={14} />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {/* ── SELECTED DAY PANEL ───────────────────────────────────────────────── */}
      {selectedDay && (
        <div className="px-4 mb-5">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-3">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {selectedDayRdvs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-600 text-xs">Aucun rendez-vous ce jour</p>
                <button onClick={() => openAdd(parseInt(selectedDay.split('-')[2]))}
                  className="mt-2 text-indigo-400 text-xs font-bold hover:underline">
                  + Ajouter un RDV
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayRdvs.map(rdv => (
                  <RdvCard key={rdv.id} rdv={rdv} onDelete={deleteRdv} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── UPCOMING RDVs ────────────────────────────────────────────────────── */}
      <div className="px-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">À venir</p>
        {upcomingRdvs.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
            <CalendarDays className="mx-auto mb-3 text-indigo-400/30" size={36} />
            <p className="text-slate-600 text-sm">Aucun rendez-vous planifié</p>
            <p className="text-slate-700 text-xs mt-1">Appuyez sur &quot;Nouveau rendez-vous&quot; pour commencer</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingRdvs.map(rdv => (
              <RdvCard key={rdv.id} rdv={rdv} onDelete={deleteRdv} />
            ))}
          </div>
        )}
      </div>

      {/* ── ADD MODAL ───────────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#080F1C] border border-indigo-500/20 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Agenda Pro</p>
                <h2 className="text-white font-black text-base uppercase tracking-wide">Nouveau RDV</h2>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors text-xl font-bold">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Titre *</label>
                <input type="text" placeholder="Ex: Visite médicale, Formation SST..."
                  value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-indigo-400/50 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-indigo-400/50 transition-colors" />
                </div>
                <div>
                  <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Heure</label>
                  <input type="time" value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-indigo-400/50 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Lieu</label>
                <input type="text" placeholder="Adresse ou lieu..."
                  value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-indigo-400/50 transition-colors" />
              </div>

              <div>
                <label className="text-slate-500 text-[9px] uppercase tracking-widest font-bold block mb-1">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TYPE_CONFIG) as RDV['type'][]).map(t => (
                    <button key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${form.type === t ? `${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].border}` : 'border-white/10 text-slate-500'}`}
                      style={form.type === t ? { color: TYPE_CONFIG[t].color } : {}}>
                      {TYPE_CONFIG[t].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wider active:scale-95 transition-all">
                Annuler
              </button>
              <button onClick={saveRdv} disabled={saving || !form.titre || !form.date}
                className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-black uppercase tracking-wider disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ boxShadow: '0 0 20px rgba(129,140,248,0.3)' }}>
                {saving ? <><Loader2 size={13} className="animate-spin" />Enreg...</> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RDV Card ──────────────────────────────────────────────────────────────────
function RdvCard({ rdv, onDelete }: { rdv: RDV; onDelete: (id: string) => void }) {
  const cfg = TYPE_CONFIG[rdv.type];
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-sm truncate">{rdv.titre}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {rdv.heure && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock size={9} />{rdv.heure}
            </span>
          )}
          {rdv.lieu && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
              <MapPin size={9} />{rdv.lieu}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 inline-block" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      <button onClick={() => onDelete(rdv.id)}
        className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
        ×
      </button>
    </div>
  );
}
