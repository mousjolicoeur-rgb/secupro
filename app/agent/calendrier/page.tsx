'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar as CalendarIcon, CalendarDays, 
  Plus, ChevronLeft, ChevronRight, Briefcase, User, 
  MapPin, Clock, X, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type EventAgent = {
  id: string;
  agent_id: string;
  titre: string;
  date_debut: string;
  date_fin?: string;
  note?: string;
  couleur?: string;
};

type PlanningRow = {
  id: string;
  site?: string;
  lieu?: string;
  nom_site?: string;
  date?: string;
  shift_date?: string;
  date_debut?: string;
  horaires?: string;
  creneau?: string;
  plage_horaire?: string;
  societes?: { nom: string };
};

type ViewMode = 'semaine' | 'mois';
type TabMode = 'perso' | 'pro';

// Helpers de dates
function getWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
  );
}

function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Pad with previous month days
  const startOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
  const days = [];
  
  for (let i = startOffset; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  // Pad end
  const endOffset = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  for (let i = 1; i <= endOffset; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendrierPage() {
  const router = useRouter();
  
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabMode>('pro');
  const [view, setView] = useState<ViewMode>('semaine');
  
  // Dates
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Data
  const [persoEvents, setPersoEvents] = useState<EventAgent[]>([]);
  const [proEvents, setProEvents] = useState<PlanningRow[]>([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventAgent | PlanningRow | null>(null);
  
  // Add Form
  const [formTitre, setFormTitre] = useState('');
  const [formDate, setFormDate] = useState(toISO(new Date()));
  const [formHeure, setFormHeure] = useState('08:00');
  const [formNote, setFormNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      
      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('email', session.user.email)
        .single();
        
      if (agentData) {
        setAgentId(agentData.id);
        await loadData(agentData.id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const loadData = async (uid: string) => {
    // Fetch Perso
    const { data: persoData } = await supabase
      .from('evenements_agent')
      .select('*')
      .eq('agent_id', uid);
    
    // Fetch Pro (via auth RLS or direct relation, actually plannings table might just use agent_id or user_id)
    // Assuming 'agent_id' maps to agents(id) or 'user_id' maps to auth.uid(). Since the user said "joindre avec agents via agent_id", we use agent_id.
    const { data: proData } = await supabase
      .from('plannings')
      .select('*, societes(nom)')
      .eq('agent_id', uid);

    if (persoData) setPersoEvents(persoData as EventAgent[]);
    if (proData) setProEvents(proData as PlanningRow[]);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'semaine') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'semaine') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId || !formTitre || !formDate) return;
    setSaving(true);
    
    const combinedStart = new Date(`${formDate}T${formHeure}:00`);
    
    const { error } = await supabase
      .from('evenements_agent')
      .insert({
        agent_id: agentId,
        titre: formTitre,
        date_debut: combinedStart.toISOString(),
        note: formNote,
        couleur: 'blue'
      });
      
    if (!error) {
      await loadData(agentId);
      setShowAddModal(false);
      setFormTitre('');
      setFormNote('');
    } else {
      alert("Erreur lors de la création de l'événement.");
    }
    setSaving(false);
  };

  // Rendering logic
  const daysToRender = useMemo(() => {
    if (view === 'semaine') return getWeekDays(getWeekMonday(currentDate));
    return getMonthDays(currentDate);
  }, [currentDate, view]);

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#060D18] text-white flex flex-col pb-24 font-sans">
      
      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6 border-b border-white/5 bg-gradient-to-b from-[#0a1426] to-transparent sticky top-0 z-20 backdrop-blur-md">
        <button
          onClick={() => router.push('/agent/hub')}
          className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-widest mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> Hub
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-[#3B82F6] uppercase tracking-[0.3em] font-bold mb-1">
              Gestion du Temps
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
              CALEN<span className="text-[#3B82F6]">DRIER</span>
            </h1>
          </div>
          {tab === 'perso' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {/* ── Tabs Perso / Pro ── */}
        <div className="flex bg-white/5 rounded-2xl p-1 mt-6 border border-white/10">
          <button
            onClick={() => setTab('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              tab === 'pro' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={14} /> Pro (Shifts)
          </button>
          <button
            onClick={() => setTab('perso')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              tab === 'perso' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={14} /> Personnel
          </button>
        </div>

        {/* ── Controls (Mois/Semaine & Navigation) ── */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
            <button
              onClick={() => setView('semaine')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                view === 'semaine' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView('mois')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                view === 'mois' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Mois
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handlePrev} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button onClick={handleNext} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="px-4 mt-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="text-[#3B82F6] animate-spin" size={32} />
          </div>
        ) : (
          <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${view === 'mois' ? 'auto-rows-fr' : ''}`}>
            {/* Jours de la semaine en-tête */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest pb-2">
                {d}
              </div>
            ))}
            
            {/* Cellules */}
            {daysToRender.map((day, i) => {
              const iso = toISO(day);
              const isToday = iso === toISO(new Date());
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              // Get events for this day
              let dayEvents: any[] = [];
              if (tab === 'perso') {
                dayEvents = persoEvents.filter(e => e.date_debut.startsWith(iso));
              } else {
                dayEvents = proEvents.filter(e => {
                  const raw = e.date ?? e.shift_date ?? e.date_debut;
                  return typeof raw === 'string' && raw.startsWith(iso);
                });
              }

              return (
                <div 
                  key={i} 
                  className={`flex flex-col rounded-xl border border-white/5 p-1 sm:p-2 min-h-[80px] sm:min-h-[100px] transition-colors ${
                    isToday ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30' : 
                    isCurrentMonth ? 'bg-white/[0.02]' : 'bg-transparent opacity-40'
                  }`}
                >
                  <span className={`text-xs font-black ${isToday ? 'text-[#3B82F6]' : 'text-slate-400'} text-right mb-1`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                    {dayEvents.map(ev => {
                      const isPro = tab === 'pro';
                      const title = isPro ? (ev.site ?? ev.nom_site ?? 'Vacation') : ev.titre;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent({ ...ev, _isPro: isPro })}
                          className={`text-[9px] sm:text-xs font-bold px-1.5 py-1 rounded cursor-pointer truncate ${
                            isPro ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30'
                          }`}
                        >
                          {title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Add Event (Perso) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#060D18]/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <form 
            onSubmit={handleAddSubmit}
            className="relative w-full max-w-sm bg-[#0b1426] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
          >
            <h3 className="text-xl font-black text-white mb-6">Ajouter un événement</h3>
            
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">Titre</label>
            <input 
              type="text" required value={formTitre} onChange={e => setFormTitre(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-4 focus:outline-none focus:border-[#3B82F6]/50"
              placeholder="Ex: Rendez-vous médical"
            />
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Date</label>
                <input 
                  type="date" required value={formDate} onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 [color-scheme:dark]"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Heure</label>
                <input 
                  type="time" required value={formHeure} onChange={e => setFormHeure(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 [color-scheme:dark]"
                />
              </div>
            </div>
            
            <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Note (optionnelle)</label>
            <textarea 
              value={formNote} onChange={e => setFormNote(e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-6 focus:outline-none focus:border-[#3B82F6]/50 resize-none"
              placeholder="Détails de l'événement..."
            />
            
            <div className="flex gap-3">
              <button 
                type="button" onClick={() => setShowAddModal(false)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-[#3B82F6] text-white text-xs font-black uppercase tracking-widest hover:bg-[#3B82F6]/80 transition-colors disabled:opacity-50"
              >
                {saving ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Detail Event ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#060D18]/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full sm:max-w-sm bg-[#0b1426] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            
            {(selectedEvent as any)._isPro ? (
              <>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Briefcase size={12} /> Shift Professionnel
                </div>
                <h3 className="text-2xl font-black text-white mb-6 leading-tight">
                  {(selectedEvent as PlanningRow).site ?? (selectedEvent as PlanningRow).nom_site ?? 'Vacation'}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Horaires</p>
                      <p className="text-sm text-white font-semibold">
                        {(selectedEvent as PlanningRow).horaires ?? (selectedEvent as PlanningRow).creneau ?? (selectedEvent as PlanningRow).plage_horaire ?? 'Non défini'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Employeur</p>
                      <p className="text-sm text-white font-semibold">
                        {(selectedEvent as PlanningRow).societes?.nom ?? 'Société Inconnue'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest mb-2">
                  <User size={12} /> Événement Personnel
                </div>
                <h3 className="text-2xl font-black text-white mb-6 leading-tight">
                  {(selectedEvent as EventAgent).titre}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Début</p>
                      <p className="text-sm text-white font-semibold">
                        {new Date((selectedEvent as EventAgent).date_debut).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {(selectedEvent as EventAgent).note && (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 whitespace-pre-wrap">
                      {(selectedEvent as EventAgent).note}
                    </div>
                  )}
                </div>
              </>
            )}
            
            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full py-4 rounded-xl bg-white/5 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Styles for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
