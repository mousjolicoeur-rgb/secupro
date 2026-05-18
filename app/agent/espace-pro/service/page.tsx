'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  Shield, ArrowLeft, Clock, MapPin, Send, AlertTriangle,
  MessageSquare, Package, CheckSquare, Square, CheckCircle2,
  FileText, LogOut, X,
} from 'lucide-react';

// ── Palette ──────────────────────────────────────────────────────────────────
const CY    = '#00d1ff';
const GR    = '#00FFCC';
const RED   = '#f87171';
const ORA   = '#FF8C00';
const YEL   = '#FFCC00';
const VIO   = '#a78bfa';
const CARD  = 'rgba(10,20,44,0.88)';
const CYA   = 'rgba(0,209,255,0.14)';
const INP   = 'rgba(5,12,30,0.75)';
const MUTED = 'rgba(148,163,184,0.45)';
const LBL   = 'rgba(0,209,255,0.45)';

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'materiels' | 'rapport' | 'messages' | 'fin';
type RapportType = 'ras' | 'incident' | 'anomalie' | 'urgence';

interface PriseService {
  id:             string;
  agent_id:       string;
  societe_id:     string;
  site:           string | null;
  vacation_debut: string | null;
  vacation_fin:   string | null;
  heure_debut:    string;
  heure_fin:      string | null;
  materiels:      Materiel[];
}

interface Materiel { nom: string; recu: boolean; }

interface RapportVacation {
  id:         string;
  type:       RapportType;
  contenu:    string | null;
  created_at: string;
}

interface MessageVacation {
  id:         string;
  expediteur: 'agent' | 'societe';
  contenu:    string;
  created_at: string;
}

const MATERIELS_INIT: Materiel[] = [
  { nom:'Radio / Talkie-walkie', recu:false },
  { nom:'Badge d\'accès',        recu:false },
  { nom:'Matraque tonfa',        recu:false },
  { nom:'Gilet pare-balles',     recu:false },
  { nom:'Lampe torche',          recu:false },
  { nom:'Menottes',              recu:false },
];

const RAPPORT_META: Record<RapportType, { label:string; color:string }> = {
  ras:      { label:'RAS',      color:GR  },
  incident: { label:'Incident', color:ORA },
  anomalie: { label:'Anomalie', color:YEL },
  urgence:  { label:'Urgence',  color:RED },
};

// ── Chronomètre ──────────────────────────────────────────────────────────────
function useChrono(start: string | null): string {
  const [disp, setDisp] = useState('00:00:00');
  useEffect(() => {
    if (!start) return;
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000));
      const h = Math.floor(s / 3600).toString().padStart(2,'0');
      const m = Math.floor((s % 3600) / 60).toString().padStart(2,'0');
      const sec = (s % 60).toString().padStart(2,'0');
      setDisp(`${h}:${m}:${sec}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);
  return disp;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size=13 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, accent=CY, style={} }: {
  children: React.ReactNode; accent?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: CARD, backdropFilter:'blur(16px)',
      border:`1px solid ${accent}18`, borderRadius:16,
      boxShadow:`0 0 24px ${accent}06`, ...style,
    }}>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU 1 — MATÉRIELS
// ════════════════════════════════════════════════════════════════════════════
function PanelMateriels({ prise, agentId }: { prise: PriseService; agentId: string }) {
  const [items,    setItems]    = useState<Materiel[]>(
    prise.materiels?.length ? prise.materiels : MATERIELS_INIT
  );
  const [saved,   setSaved]   = useState(prise.materiels?.length > 0);
  const [saving,  setSaving]  = useState(false);

  const toggle = (i: number) =>
    setItems(prev => prev.map((m, j) => j===i ? { ...m, recu:!m.recu } : m));

  const handleConfirm = async () => {
    setSaving(true);
    await supabase
      .from('prises_service')
      .update({ materiels: items })
      .eq('id', prise.id)
      .eq('agent_id', agentId);
    setSaving(false);
    setSaved(true);
  };

  const allChecked = items.every(m => m.recu);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <Card accent={CY} style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, borderBottom:`1px solid ${CYA}`, paddingBottom:12 }}>
          <Package size={14} style={{ color:CY }} />
          <span style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:CY }}>
            Prise en compte matériels
          </span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {items.map((m, i) => (
            <button
              key={i}
              onClick={() => !saved && toggle(i)}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 10px',
                background: m.recu?'rgba(0,255,204,0.06)':'transparent',
                border:`1px solid ${m.recu?'rgba(0,255,204,0.2)':'rgba(255,255,255,0.04)'}`,
                borderRadius:10, cursor:saved?'default':'pointer', textAlign:'left',
                transition:'all 0.15s',
              }}>
              {m.recu
                ? <CheckSquare size={16} style={{ color:GR, flexShrink:0 }} />
                : <Square size={16} style={{ color:MUTED, flexShrink:0 }} />
              }
              <span style={{ fontSize:12, fontWeight:600, color: m.recu?'#f1f5f9':MUTED }}>
                {m.nom}
              </span>
              {m.recu && <span style={{ marginLeft:'auto', fontSize:9, fontWeight:900, color:GR, textTransform:'uppercase', letterSpacing:'0.2em' }}>Reçu</span>}
            </button>
          ))}
        </div>

        {saved ? (
          <div style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', background:'rgba(0,255,204,0.07)', border:'1px solid rgba(0,255,204,0.25)', borderRadius:10 }}>
            <CheckCircle2 size={14} style={{ color:GR }} />
            <span style={{ fontSize:11, fontWeight:700, color:GR }}>Réception confirmée</span>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={saving || !allChecked}
            style={{
              marginTop:14, width:'100%', padding:'13px',
              borderRadius:12, border:`1px solid ${allChecked?'rgba(0,255,204,0.4)':CYA}`,
              background: saving?'#1a3060' : allChecked?'linear-gradient(135deg,#005c3f,#00cc88,#00FFCC)':'rgba(0,255,204,0.04)',
              color: allChecked?'#fff':MUTED, fontSize:11, fontWeight:900,
              letterSpacing:'0.18em', textTransform:'uppercase',
              cursor: saving||!allChecked?'not-allowed':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
            {saving ? <><Spinner />Enregistrement…</> : <>Confirmer la réception</>}
          </button>
        )}

        {!allChecked && !saved && (
          <p style={{ textAlign:'center', marginTop:8, fontSize:10, color:MUTED }}>
            Cochez tous les équipements pour confirmer
          </p>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU 2 — RAPPORT D'ACTIVITÉ
// ════════════════════════════════════════════════════════════════════════════
function PanelRapport({ prise, agentId }: { prise: PriseService; agentId: string }) {
  const [type,     setType]     = useState<RapportType>('ras');
  const [contenu,  setContenu]  = useState('');
  const [sending,  setSending]  = useState(false);
  const [rapports, setRapports] = useState<RapportVacation[]>([]);

  useEffect(() => {
    supabase
      .from('rapports_vacation')
      .select('id, type, contenu, created_at')
      .eq('prise_service_id', prise.id)
      .order('created_at', { ascending:false })
      .then(({ data }) => setRapports((data ?? []) as RapportVacation[]));
  }, [prise.id]);

  const handleSend = async () => {
    setSending(true);
    const { data: r } = await supabase
      .from('rapports_vacation')
      .insert({ prise_service_id:prise.id, agent_id:agentId, type, contenu:contenu.trim()||null })
      .select('id, type, contenu, created_at')
      .single();
    setSending(false);
    if (r) {
      setRapports(prev => [r as RapportVacation, ...prev]);
      setContenu('');
      setType('ras');
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <Card accent={VIO} style={{ padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, borderBottom:`1px solid rgba(167,139,250,0.15)`, paddingBottom:12 }}>
          <FileText size={14} style={{ color:VIO }} />
          <span style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:VIO }}>
            Rapport d'activité
          </span>
        </div>

        {/* Type */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, marginBottom:12 }}>
          {(Object.entries(RAPPORT_META) as [RapportType, { label:string; color:string }][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setType(k)}
              style={{
                padding:'8px 4px', borderRadius:8, border:`1px solid ${type===k?v.color+'60':CYA}`,
                background: type===k?`${v.color}12`:'transparent',
                color: type===k?v.color:MUTED, fontSize:10, fontWeight:900,
                textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.15s',
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Observations */}
        <textarea
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          placeholder="Observations du poste (laisser vide pour RAS)…"
          rows={4}
          style={{
            width:'100%', background:INP, border:`1px solid ${CYA}`, borderRadius:12,
            padding:'12px', fontSize:12, fontWeight:500, color:'#f1f5f9',
            outline:'none', resize:'none', boxSizing:'border-box', caretColor:CY,
            lineHeight:1.6,
          }}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.border=`1px solid ${CY}60`; }}
          onBlur={e  => { (e.target as HTMLTextAreaElement).style.border=`1px solid ${CYA}`; }}
        />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6, marginBottom:10 }}>
          <span style={{ fontSize:9, color:MUTED }}>
            Heure auto : {new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
          </span>
          <span style={{ fontSize:9, fontWeight:700, color:RAPPORT_META[type].color, textTransform:'uppercase', letterSpacing:'0.15em' }}>
            {RAPPORT_META[type].label}
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          style={{
            width:'100%', padding:'13px', borderRadius:12,
            border:'1px solid rgba(167,139,250,0.4)',
            background: sending?'#1a3060':'linear-gradient(135deg,#3b1a8a,#6d28d9,#a78bfa)',
            color:'#fff', fontSize:11, fontWeight:900, letterSpacing:'0.18em', textTransform:'uppercase',
            cursor:sending?'not-allowed':'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          {sending ? <><Spinner/>Envoi…</> : <><Send size={13}/>Envoyer le rapport</>}
        </button>
      </Card>

      {/* Historique */}
      {rapports.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.3em', color:MUTED, margin:0 }}>
            Historique du jour
          </p>
          {rapports.map(r => {
            const meta = RAPPORT_META[r.type as RapportType] ?? RAPPORT_META.ras;
            return (
              <div key={r.id} style={{
                padding:'10px 12px', borderRadius:12,
                background:`${meta.color}08`, border:`1px solid ${meta.color}25`,
                display:'flex', flexDirection:'column', gap:4,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', color:meta.color }}>{meta.label}</span>
                  <span style={{ fontSize:9, color:MUTED }}>{fmt(r.created_at)}</span>
                </div>
                {r.contenu && <p style={{ fontSize:11, color:'rgba(241,245,249,0.75)', margin:0, lineHeight:1.5 }}>{r.contenu}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU 3 — MESSAGERIE
// ════════════════════════════════════════════════════════════════════════════
function PanelMessages({ prise, agentId }: { prise: PriseService; agentId: string }) {
  const [messages, setMessages] = useState<MessageVacation[]>([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    supabase
      .from('messages_vacation')
      .select('id, expediteur, contenu, created_at')
      .eq('agent_id', agentId)
      .eq('societe_id', prise.societe_id)
      .order('created_at')
      .then(({ data }) => setMessages((data ?? []) as MessageVacation[]));

    const ch = supabase
      .channel(`mv-${agentId}-${prise.societe_id}`)
      .on('postgres_changes', {
        event:'INSERT', schema:'public', table:'messages_vacation',
        filter:`agent_id=eq.${agentId}`,
      }, payload => {
        const m = payload.new as MessageVacation;
        if (m.expediteur === 'societe') {
          setMessages(prev => [...prev, m]);
        }
      })
      .subscribe();

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [agentId, prise.societe_id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const txt = input.trim();
    if (!txt || sending) return;
    setInput('');
    setSending(true);

    const optimistic: MessageVacation = {
      id: `opt-${Date.now()}`, expediteur:'agent', contenu:txt,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    await supabase.from('messages_vacation').insert({
      agent_id:  agentId,
      societe_id: prise.societe_id,
      expediteur: 'agent',
      contenu:    txt,
    });
    setSending(false);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 220px)', minHeight:300 }}>
      <Card accent={CY} style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderBottom:`1px solid ${CYA}` }}>
          <MessageSquare size={14} style={{ color:CY }} />
          <span style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:CY }}>
            Messagerie interne
          </span>
          <span style={{ marginLeft:'auto', fontSize:9, fontWeight:700, color:GR }}>● Live</span>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 4px', display:'flex', flexDirection:'column', gap:8 }}>
          {messages.length === 0 && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ fontSize:11, color:MUTED, textAlign:'center' }}>
                Aucun message.<br/>Commencez la conversation avec votre société.
              </p>
            </div>
          )}
          {messages.map(m => {
            const isAgent = m.expediteur === 'agent';
            return (
              <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: isAgent?'flex-end':'flex-start', gap:2 }}>
                <div style={{
                  maxWidth:'78%', padding:'9px 12px', borderRadius: isAgent?'14px 14px 4px 14px':'14px 14px 14px 4px',
                  background: isAgent?'linear-gradient(135deg,#004e9a,#0077cc)':'rgba(255,255,255,0.06)',
                  border: isAgent?'1px solid rgba(0,209,255,0.3)':'1px solid rgba(255,255,255,0.08)',
                  color:'#f1f5f9', fontSize:12, lineHeight:1.5,
                }}>
                  {m.contenu}
                </div>
                <span style={{ fontSize:9, color:MUTED }}>{fmt(m.created_at)}</span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'10px 12px', borderTop:`1px solid ${CYA}`, display:'flex', gap:8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSend()}
            placeholder="Votre message…"
            style={{
              flex:1, background:INP, border:`1px solid ${CYA}`, borderRadius:12,
              padding:'10px 12px', fontSize:12, fontWeight:500, color:'#f1f5f9',
              outline:'none', caretColor:CY,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              padding:'10px 14px', borderRadius:12,
              background:'linear-gradient(135deg,#004e9a,#0077cc)',
              border:'1px solid rgba(0,209,255,0.35)',
              color:'#fff', cursor:!input.trim()||sending?'not-allowed':'pointer',
              opacity:!input.trim()?0.5:1, display:'flex', alignItems:'center',
            }}>
            <Send size={14} />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PANNEAU 4 — FIN DE SERVICE + MODAL
// ════════════════════════════════════════════════════════════════════════════
function PanelFin({ prise, agentId, nbRapports }: {
  prise: PriseService; agentId: string; nbRapports: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const [ending,    setEnding]    = useState(false);
  const router = useRouter();

  const chrono = useChrono(prise.heure_debut);
  const heureDebut = new Date(prise.heure_debut).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const heureFin   = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

  const handleTerminer = async () => {
    setEnding(true);
    await supabase
      .from('prises_service')
      .update({ heure_fin: new Date().toISOString() })
      .eq('id', prise.id)
      .eq('agent_id', agentId);
    try { localStorage.removeItem('sp_prise_id'); } catch {}
    router.replace('/agent/hub');
  };

  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Résumé service */}
        <Card accent={GR} style={{ padding:16 }}>
          <p style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.3em', color:'rgba(0,255,204,0.5)', margin:'0 0 12px' }}>
            Résumé de la vacation
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Site',          val: prise.site ?? '—' },
              { label:'Vacation',      val: prise.vacation_debut&&prise.vacation_fin?`${prise.vacation_debut}–${prise.vacation_fin}`:'—' },
              { label:'Prise de poste', val: heureDebut },
              { label:'Durée écoulée', val: chrono },
              { label:'Rapports envoyés', val: String(nbRapports) },
            ].map(({ label, val }) => (
              <div key={label} style={{ padding:'10px 12px', background:'rgba(0,255,204,0.04)', border:'1px solid rgba(0,255,204,0.14)', borderRadius:10 }}>
                <p style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(0,255,204,0.4)', margin:'0 0 4px' }}>{label}</p>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', margin:0 }}>{val}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Bouton terminer */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width:'100%', padding:'16px',
            borderRadius:14, border:'1px solid rgba(248,113,113,0.5)',
            background:'linear-gradient(135deg,#7f1d1d,#b91c1c,#ef4444)',
            color:'#fff', fontSize:13, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase',
            cursor:'pointer', boxShadow:'0 0 30px rgba(248,113,113,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
          <LogOut size={16} />
          TERMINER MON SERVICE
        </button>
      </div>

      {/* ── Modal confirmation ──────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(5,13,30,0.92)', backdropFilter:'blur(12px)',
          display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'20px',
        }}>
          <div style={{
            width:'100%', maxWidth:440,
            background:'rgba(10,20,44,0.98)', border:'1px solid rgba(248,113,113,0.3)',
            borderRadius:'20px 20px 16px 16px', padding:24,
            boxShadow:'0 -20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(248,113,113,0.12)',
          }}>
            {/* En-tête modal */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={16} style={{ color:RED }} />
                <span style={{ fontSize:12, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', color:RED }}>
                  Fin de service
                </span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:4 }}>
                <X size={16} />
              </button>
            </div>

            {/* Résumé */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[
                { label:'Prise de poste', val: heureDebut },
                { label:'Fin de service', val: heureFin  },
                { label:'Durée totale',   val: chrono    },
                { label:'Rapports',       val: `${nbRapports} envoyé${nbRapports>1?'s':''}` },
              ].map(({ label, val }) => (
                <div key={label} style={{ padding:'10px', background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:10 }}>
                  <p style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', color:'rgba(248,113,113,0.5)', margin:'0 0 4px' }}>{label}</p>
                  <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', margin:0 }}>{val}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize:11, color:MUTED, textAlign:'center', marginBottom:20, lineHeight:1.6 }}>
              Confirmer la fin de vacation transmettra le résumé à l'exploitation.
            </p>

            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex:1, padding:'12px', borderRadius:12, border:`1px solid ${CYA}`, background:'transparent', color:MUTED, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                Annuler
              </button>
              <button
                onClick={handleTerminer}
                disabled={ending}
                style={{
                  flex:2, padding:'12px', borderRadius:12,
                  border:'1px solid rgba(248,113,113,0.5)',
                  background: ending?'#450a0a':'linear-gradient(135deg,#7f1d1d,#b91c1c,#ef4444)',
                  color:'#fff', fontSize:11, fontWeight:900, letterSpacing:'0.15em', textTransform:'uppercase',
                  cursor:ending?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                {ending ? <><span style={{fontSize:10}}>●</span>Transmission…</> : 'Valider et transmettre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — SERVICE
// ════════════════════════════════════════════════════════════════════════════
export default function ServicePage() {
  const router = useRouter();
  const [prise,      setPrise]      = useState<PriseService | null>(null);
  const [agentNom,   setAgentNom]   = useState('');
  const [agentId,    setAgentId]    = useState('');
  const [tab,        setTab]        = useState<Tab>('materiels');
  const [nbRapports, setNbRapports] = useState(0);
  const [ready,      setReady]      = useState(false);

  const chrono = useChrono(prise?.heure_debut ?? null);

  // ── Chargement ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/agent/login'); return; }
      setAgentId(user.id);

      const meta = user.user_metadata;
      setAgentNom(
        meta?.first_name
          ? String(meta.first_name)
          : (user.email?.split('@')[0] ?? 'Agent')
      );

      // ID depuis localStorage ou dernière session active
      let priseId: string | null = null;
      try { priseId = localStorage.getItem('sp_prise_id'); } catch {}

      let q = supabase.from('prises_service').select('*').eq('agent_id', user.id);
      if (priseId) {
        q = q.eq('id', priseId);
      } else {
        q = q.is('heure_fin', null).order('heure_debut', { ascending:false }).limit(1);
      }
      const { data: ps } = await q.maybeSingle();

      if (!ps) { router.replace('/agent/espace-pro'); return; }
      setPrise(ps as PriseService);

      // Compte les rapports du jour
      const { count } = await supabase
        .from('rapports_vacation')
        .select('id', { count:'exact', head:true })
        .eq('prise_service_id', ps.id);
      setNbRapports(count ?? 0);

      setReady(true);
    });
  }, [router]);

  // ── Synchro nb rapports ─────────────────────────────────────────────────
  useEffect(() => {
    if (!prise?.id) return;
    const ch = supabase
      .channel(`rv-count-${prise.id}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'rapports_vacation', filter:`prise_service_id=eq.${prise.id}` },
        () => setNbRapports(n => n + 1))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [prise?.id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!ready || !prise) {
    return (
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#050D1E' }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,209,255,0.4)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  const TAB_ITEMS: { id: Tab; label: string; Icon: React.ElementType; accent: string }[] = [
    { id:'materiels', label:'Matériels', Icon:Package,        accent:CY  },
    { id:'rapport',   label:'Rapport',   Icon:FileText,       accent:VIO },
    { id:'messages',  label:'Messages',  Icon:MessageSquare,  accent:CY  },
    { id:'fin',       label:'Fin',       Icon:LogOut,         accent:RED },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse 130% 55% at 50% 0%, rgba(0,35,90,0.38) 0%, #0B1426 50%)', fontFamily:'var(--font-geist-sans),system-ui,sans-serif', color:'#f1f5f9', display:'flex', flexDirection:'column' }}>

      {/* Grille */}
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(0,209,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.012) 1px,transparent 1px)',
        backgroundSize:'40px 40px', maskImage:'radial-gradient(ellipse 100% 70% at 50% 0%,black,transparent 70%)' }} />

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header style={{
        position:'sticky', top:0, zIndex:40,
        background:'rgba(11,20,38,0.95)', backdropFilter:'blur(18px)',
        borderBottom:`1px solid ${CYA}`, padding:'12px 16px',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:15, fontWeight:900, color:'#fff' }}>{agentNom}</span>
              <span style={{ fontSize:9, fontWeight:900, background:'rgba(0,255,204,0.1)', border:'1px solid rgba(0,255,204,0.3)', color:GR, padding:'2px 7px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.2em' }}>
                En poste
              </span>
            </div>
            {prise.site && (
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <MapPin size={10} style={{ color:CY }} />
                <span style={{ fontSize:11, color:MUTED }}>{prise.site}</span>
              </div>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(0,255,204,0.06)', border:'1px solid rgba(0,255,204,0.2)', borderRadius:8, padding:'4px 10px' }}>
              <Clock size={10} style={{ color:GR }} />
              <span style={{ fontSize:13, fontWeight:900, fontFamily:"var(--font-geist-mono),'Courier New',monospace", color:GR, letterSpacing:'0.08em' }}>
                {chrono}
              </span>
            </div>
            {prise.vacation_debut && prise.vacation_fin && (
              <span style={{ fontSize:9, color:MUTED }}>
                Vacation {prise.vacation_debut}–{prise.vacation_fin}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── CONTENU ─────────────────────────────────────────────────── */}
      <main style={{ flex:1, padding:'16px 16px 90px', maxWidth:640, width:'100%', margin:'0 auto', position:'relative', zIndex:1, overflowX:'hidden' }}>
        {tab==='materiels' && <PanelMateriels prise={prise} agentId={agentId} />}
        {tab==='rapport'   && <PanelRapport   prise={prise} agentId={agentId} />}
        {tab==='messages'  && <PanelMessages  prise={prise} agentId={agentId} />}
        {tab==='fin'       && <PanelFin prise={prise} agentId={agentId} nbRapports={nbRapports} />}
      </main>

      {/* ── NAV BAS ─────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:40,
        background:'rgba(11,20,38,0.97)', backdropFilter:'blur(24px)',
        borderTop:`1px solid ${CYA}`,
        paddingTop:8, paddingBottom:'env(safe-area-inset-bottom,12px)',
        display:'flex', justifyContent:'space-around',
      }}>
        {TAB_ITEMS.map(({ id, label, Icon, accent }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{
                position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                padding:'6px 16px', borderRadius:12, border:'none', background:'transparent', cursor:'pointer',
                color: active ? accent : MUTED,
              }}>
              <Icon size={20} style={{ filter: active?`drop-shadow(0 0 5px ${accent})`:undefined }} />
              <span style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.18em' }}>{label}</span>
              {active && <span style={{ position:'absolute', bottom:-2, left:'50%', transform:'translateX(-50%)', width:16, height:2, borderRadius:2, background:accent, boxShadow:`0 0 6px ${accent}` }} />}
              {id==='fin' && !active && (
                <span style={{ position:'absolute', top:4, right:12, width:6, height:6, borderRadius:'50%', background:RED, boxShadow:`0 0 6px ${RED}` }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
