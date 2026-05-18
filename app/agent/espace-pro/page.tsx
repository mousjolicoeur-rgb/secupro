'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Shield, ArrowLeft, Zap, Clock, MapPin, Lock, Hash,
  CheckCircle2, ChevronRight, Building2,
} from 'lucide-react';

// ── Palette ──────────────────────────────────────────────────────────────────
const CY   = '#00d1ff';
const CYA  = 'rgba(0,209,255,0.14)';
const CYB  = 'rgba(0,209,255,0.40)';
const GR   = '#00FFCC';
const RED  = '#f87171';
const BG   = '#050D1E';
const CARD = 'rgba(10,20,44,0.92)';
const LBL  = 'rgba(0,209,255,0.45)';
const INP  = 'rgba(5,12,30,0.75)';

type Phase = 'loading' | 'code' | 'identite' | 'sending';
type Scan  = 'idle' | 'scanning' | 'success' | 'error';
interface SocieteInfo { id: string; nom: string; }

// ── Empreinte digitale ───────────────────────────────────────────────────────
function Fingerprint({ scan }: { scan: Scan }) {
  const color = scan === 'success' ? GR : scan === 'error' ? RED : CY;
  return (
    <div style={{ position:'relative', width:96, height:96, display:'flex', alignItems:'center', justifyContent:'center' }}>
      {(scan === 'scanning' || scan === 'success') && <>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1px solid ${color}30`, animation:'fp-ping 1.2s infinite' }} />
        <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:`1px solid ${color}18`, animation:'fp-ping 1.8s 0.4s infinite' }} />
      </>}
      <div style={{
        width:80, height:80, borderRadius:'50%', position:'relative', overflow:'hidden',
        background:`${color}08`, border:`1.5px solid ${color}${scan==='idle'?'22':'45'}`,
        boxShadow: scan!=='idle'?`0 0 28px ${color}30`:'none',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 500ms',
      }}>
        {scan === 'scanning' && (
          <div className="fp-scan" style={{ position:'absolute', left:0, right:0, height:2, top:0,
            background:`linear-gradient(90deg,transparent,${color},transparent)`, boxShadow:`0 0 8px ${color}` }} />
        )}
        <svg width="44" height="44" viewBox="0 0 100 110" fill="none"
          style={{ color, filter:scan!=='idle'?`drop-shadow(0 0 7px ${color})`:'none', opacity:scan==='idle'?.4:1, transition:'all 400ms' }}>
          <path d="M50 12C26 12 8 30 8 54c0 20 10 34 24 42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M50 12c24 0 42 18 42 42 0 20-10 34-24 42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M22 45c0-18 12-27 28-27s28 9 28 27c0 18-10 31-20 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M30 50c0-15 8-24 20-24s20 9 20 24c0 13-7 23-15 29" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M38 54c0-12 5-18 12-18s12 6 12 18c0 9-4 15-8 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M46 58c0-8 1-13 4-13s4 4 4 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          {scan==='success' && <path d="M26 54l16 16 32-32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{filter:`drop-shadow(0 0 8px ${color})`}} />}
        </svg>
      </div>
    </div>
  );
}

// ── InputRow ─────────────────────────────────────────────────────────────────
function InputRow({
  icon, value, onChange, placeholder, type='text', disabled, mono, inputMode,
}: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; disabled?: boolean; mono?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, background:INP,
      border:`1px solid ${foc?CYB:CYA}`, borderRadius:12, padding:'0 14px',
      boxShadow:foc?'0 0 0 3px rgba(0,209,255,0.08)':'none', transition:'all 0.2s',
    }}>
      {icon}
      <input
        type={type} value={value} placeholder={placeholder}
        disabled={disabled} inputMode={inputMode}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{
          flex:1, background:'transparent', border:'none', outline:'none',
          padding:'12px 0', fontSize:13, fontWeight:600, color:'#f1f5f9', caretColor:CY,
          fontFamily: mono?"var(--font-geist-mono),'Courier New',monospace":undefined,
          letterSpacing: mono?'0.1em':undefined,
        }}
      />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.35em', color:LBL }}>{label}</label>
      {children}
    </div>
  );
}

// ── Spinner inline ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function EspaceProPage() {
  const router = useRouter();

  const [userId,    setUserId]    = useState('');
  const [phase,     setPhase]     = useState<Phase>('loading');
  const [scan,      setScan]      = useState<Scan>('idle');
  const [errMsg,    setErrMsg]    = useState('');

  // Code société
  const [codeInput, setCodeInput] = useState('');
  const [societe,   setSociete]   = useState<SocieteInfo | null>(null);

  // Identité
  const [cartePro,  setCartePro]  = useState('');
  const [matricule, setMatricule] = useState('');
  const [site,      setSite]      = useState('');
  const [vacDeb,    setVacDeb]    = useState('06:00');
  const [vacFin,    setVacFin]    = useState('14:00');

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/agent/login'); return; }
      setUserId(user.id);

      // Redirige si une prise de service est déjà active
      const { data: prise } = await supabase
        .from('prises_service')
        .select('id')
        .eq('agent_id', user.id)
        .is('heure_fin', null)
        .order('heure_debut', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prise?.id) {
        try { localStorage.setItem('sp_prise_id', prise.id); } catch {}
        router.replace('/agent/espace-pro/service');
        return;
      }

      // Pré-remplit depuis profiles
      const { data: prof } = await supabase
        .from('profiles')
        .select('carte_pro, matricule, site_affecte')
        .eq('id', user.id)
        .maybeSingle();

      if (prof?.carte_pro)    setCartePro(prof.carte_pro);
      if (prof?.matricule)    setMatricule(prof.matricule);
      if (prof?.site_affecte) setSite(prof.site_affecte);

      // Fallback user_metadata pour carte_pro
      const meta = user.user_metadata;
      if (!prof?.carte_pro && meta?.carte_pro) setCartePro(String(meta.carte_pro));

      setPhase('code');
    });
  }, [router]);

  // ── Validation du code société ───────────────────────────────────────────
  const handleValidateCode = useCallback(async () => {
    const code = codeInput.trim();
    if (!/^\d{6}$/.test(code)) {
      setErrMsg('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    setErrMsg('');
    setScan('scanning');

    // Cherche la société par son code_acces
    const { data: soc } = await supabase
      .from('societes')
      .select('id, nom_entreprise, nom')
      .eq('code_acces', code)
      .maybeSingle();

    if (!soc) {
      setScan('error');
      setErrMsg('Code société invalide. Vérifiez auprès de votre responsable.');
      setTimeout(() => { setScan('idle'); }, 2200);
      return;
    }

    // Vérifie le lien agent ↔ société
    const { data: lien } = await supabase
      .from('agent_societe')
      .select('status')
      .eq('agent_id', userId)
      .eq('societe_id', soc.id)
      .maybeSingle();

    if (!lien) {
      setScan('error');
      setErrMsg('Vous n\'êtes pas rattaché à cette société. Contactez votre responsable.');
      setTimeout(() => { setScan('idle'); }, 2200);
      return;
    }
    if (lien.status === 'pending') {
      setScan('error');
      setErrMsg('Votre rattachement est en attente de validation.');
      setTimeout(() => { setScan('idle'); }, 2200);
      return;
    }
    if (lien.status !== 'approved') {
      setScan('error');
      setErrMsg('Accès refusé par la société.');
      setTimeout(() => { setScan('idle'); }, 2200);
      return;
    }

    setScan('success');
    setSociete({ id: soc.id, nom: soc.nom_entreprise ?? soc.nom ?? 'Société' });
    setTimeout(() => { setScan('idle'); setPhase('identite'); }, 900);
  }, [codeInput, userId]);

  // ── Prise de service ─────────────────────────────────────────────────────
  const handlePrendreService = useCallback(async () => {
    if (!societe || !site.trim()) return;
    setErrMsg('');
    setPhase('sending');

    // Met à jour profiles
    await supabase
      .from('profiles')
      .update({ carte_pro: cartePro || null, matricule: matricule || null, site_affecte: site.trim() })
      .eq('id', userId);

    // Crée la prise de service
    const { data: ps, error } = await supabase
      .from('prises_service')
      .insert({
        agent_id:      userId,
        societe_id:    societe.id,
        site:          site.trim(),
        vacation_debut: vacDeb,
        vacation_fin:   vacFin,
        heure_debut:   new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !ps) {
      setErrMsg('Erreur lors de la prise de service. Réessayez.');
      setPhase('identite');
      return;
    }

    try { localStorage.setItem('sp_prise_id', ps.id); } catch {}
    router.replace('/agent/espace-pro/service');
  }, [societe, site, cartePro, matricule, vacDeb, vacFin, userId, router]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:BG }}>
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,209,255,0.4)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:'100vh', background:'radial-gradient(ellipse 160% 70% at 50% -10%, rgba(0,40,110,0.55) 0%, #050D1E 55%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'40px 20px', fontFamily:'var(--font-geist-sans),system-ui,sans-serif', color:'#f1f5f9',
      position:'relative',
    }}>
      {/* Grille */}
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(0,209,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.018) 1px,transparent 1px)',
        backgroundSize:'40px 40px' }} />

      {/* Retour hub */}
      <Link href="/agent/hub" style={{
        position:'fixed', top:16, left:16, zIndex:20,
        display:'flex', alignItems:'center', gap:6,
        fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.22em',
        color:'rgba(148,163,184,0.45)', textDecoration:'none',
      }}>
        <ArrowLeft size={11} /> Retour au Hub
      </Link>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400, display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>

        {/* ─── PHASE CODE ────────────────────────────────────────────────── */}
        {phase === 'code' && (<>
          {/* Branding */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(0,209,255,0.06)', border:'1px solid rgba(0,209,255,0.2)', boxShadow:'0 0 40px rgba(0,120,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={22} style={{ color:CY }} />
            </div>
            <p style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.5em', color:'rgba(0,209,255,0.4)', margin:0 }}>
              Zone Sécurisée · Accès Restreint
            </p>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#fff', margin:0 }}>Espace PRO</h1>
          </div>

          <Fingerprint scan={scan} />

          <p style={{
            fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.35em', margin:'-12px 0 0',
            color: scan==='scanning'?CY : scan==='success'?GR : scan==='error'?RED : 'rgba(148,163,184,0.3)',
            transition:'color 300ms', minHeight:16, textAlign:'center',
          }}>
            {scan==='idle'     && "En attente d'authentification"}
            {scan==='scanning' && 'Vérification en cours…'}
            {scan==='success'  && 'Code valide · Accès autorisé'}
            {scan==='error'    && 'Code refusé — Accès bloqué'}
          </p>

          <div style={{ width:'100%', background:CARD, backdropFilter:'blur(28px)', border:`1px solid ${scan==='success'?'rgba(0,255,204,0.35)':CYA}`, borderRadius:20, padding:'24px 20px', boxShadow:'0 0 60px rgba(0,0,0,0.5)', transition:'border 400ms' }}>
            <Field label="Code Société (6 chiffres)">
              <InputRow
                icon={<Zap size={14} style={{ color:CY, flexShrink:0 }} />}
                value={codeInput}
                onChange={v => setCodeInput(v.replace(/\D/g,'').slice(0,6))}
                placeholder="• • • • • •"
                inputMode="numeric"
                disabled={scan==='scanning' || scan==='success'}
                mono
              />
            </Field>

            {errMsg && <p style={{ margin:'12px 0 0', fontSize:11, fontWeight:600, color:'rgba(248,113,113,0.85)', textAlign:'center' }}>{errMsg}</p>}

            <button
              onClick={handleValidateCode}
              disabled={scan==='scanning' || scan==='success'}
              onKeyDown={e => e.key==='Enter' && handleValidateCode()}
              style={{
                marginTop:16, width:'100%', padding:'14px', borderRadius:14,
                border:`1px solid ${scan==='success'?'rgba(0,255,204,0.45)':'rgba(0,209,255,0.35)'}`,
                background: scan==='success'
                  ? 'linear-gradient(135deg,#005c3f,#00cc88,#00FFCC)'
                  : 'linear-gradient(135deg,#003878,#0066cc,#00a0e8)',
                color:'#fff', fontSize:11, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase',
                cursor: scan==='scanning'||scan==='success'?'not-allowed':'pointer',
                boxShadow:'0 0 28px rgba(0,119,204,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: scan==='scanning'?.7:1, transition:'all 300ms',
              }}>
              {scan==='scanning' ? <><Spinner/>Vérification…</> :
               scan==='success'  ? <><CheckCircle2 size={14}/>Accès autorisé</> :
                                   <><Shield size={14}/>ÉTABLIR LA CONNEXION SÉCURISÉE</>}
            </button>
          </div>

          <p style={{ fontSize:7, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(148,163,184,0.2)', textAlign:'center' }}>
            CONNEXION CHIFFRÉE · SESSION 8H · USAGE EXCLUSIF AGENTS ACCRÉDITÉS
          </p>
        </>)}

        {/* ─── PHASE IDENTITÉ ────────────────────────────────────────────── */}
        {(phase==='identite' || phase==='sending') && societe && (<>
          {/* Société validée */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(0,255,204,0.08)', border:'1px solid rgba(0,255,204,0.3)', boxShadow:'0 0 24px rgba(0,255,204,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Building2 size={20} style={{ color:GR }} />
            </div>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.4em', color:'rgba(0,255,204,0.5)', margin:0 }}>Société vérifiée ✓</p>
              <h2 style={{ fontSize:17, fontWeight:900, color:'#fff', margin:'4px 0 0' }}>{societe.nom}</h2>
            </div>
          </div>

          <div style={{ position:'relative', width:'100%', background:CARD, backdropFilter:'blur(28px)', border:`1px solid ${CYA}`, borderRadius:20, padding:'24px 20px', boxShadow:'0 0 60px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', gap:18 }}>
            {/* Liseré */}
            <div aria-hidden style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg,transparent,rgba(0,209,255,0.55),transparent)', borderRadius:4 }} />

            <div>
              <p style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.35em', color:'rgba(0,209,255,0.4)', margin:'0 0 4px' }}>Identité professionnelle</p>
              <h3 style={{ fontSize:14, fontWeight:900, color:'#fff', margin:0 }}>Prise de service</h3>
            </div>

            <Field label="N° Carte professionnelle (optionnel)">
              <InputRow icon={<Lock size={14} style={{color:CY,flexShrink:0}} />} value={cartePro} onChange={v=>setCartePro(v.toUpperCase())} placeholder="APS-XXXX-XXXXXXXXX" disabled={phase==='sending'} mono />
            </Field>

            <Field label="N° Matricule (optionnel)">
              <InputRow icon={<Hash size={14} style={{color:CY,flexShrink:0}} />} value={matricule} onChange={v=>setMatricule(v.toUpperCase())} placeholder="SP-2026-0001" disabled={phase==='sending'} mono />
            </Field>

            <Field label="Site affecté *">
              <InputRow icon={<MapPin size={14} style={{color:CY,flexShrink:0}} />} value={site} onChange={setSite} placeholder="Ex : Site Auchan, Hall A" disabled={phase==='sending'} />
            </Field>

            <Field label="Vacation du jour">
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:INP, border:`1px solid ${CYA}`, borderRadius:12, padding:'0 12px' }}>
                  <Clock size={13} style={{color:CY,flexShrink:0}} />
                  <input type="time" value={vacDeb} onChange={e=>setVacDeb(e.target.value)} disabled={phase==='sending'}
                    style={{ flex:1, background:'transparent', border:'none', outline:'none', padding:'11px 0', fontSize:13, fontWeight:700, color:'#f1f5f9', colorScheme:'dark' }} />
                </div>
                <ChevronRight size={14} style={{color:'rgba(0,209,255,0.3)',flexShrink:0}} />
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:INP, border:`1px solid ${CYA}`, borderRadius:12, padding:'0 12px' }}>
                  <Clock size={13} style={{color:CY,flexShrink:0}} />
                  <input type="time" value={vacFin} onChange={e=>setVacFin(e.target.value)} disabled={phase==='sending'}
                    style={{ flex:1, background:'transparent', border:'none', outline:'none', padding:'11px 0', fontSize:13, fontWeight:700, color:'#f1f5f9', colorScheme:'dark' }} />
                </div>
              </div>
            </Field>

            {errMsg && <p style={{ margin:0, fontSize:11, fontWeight:600, color:'rgba(248,113,113,0.85)', textAlign:'center' }}>{errMsg}</p>}

            <button
              onClick={handlePrendreService}
              disabled={phase==='sending' || !site.trim()}
              style={{
                width:'100%', padding:'15px', borderRadius:14,
                border:'1px solid rgba(0,255,204,0.45)',
                background: phase==='sending'?'#1a3060':'linear-gradient(135deg,#005c3f 0%,#00cc88 55%,#00FFCC 100%)',
                color:'#fff', fontSize:12, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase',
                cursor: phase==='sending'||!site.trim()?'not-allowed':'pointer',
                boxShadow:'0 0 30px rgba(0,255,204,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4,
              }}>
              {phase==='sending' ? <><Spinner/>Prise de service…</> : <><Shield size={14}/>PRENDRE MON SERVICE</>}
            </button>
          </div>
        </>)}
      </div>

      <style>{`
        @keyframes fp-ping { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fp-scan  { 0%{top:-4px;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
        .fp-scan { animation: fp-scan 2.4s linear infinite; }
        input[type='time']::-webkit-calendar-picker-indicator { filter:invert(.5) sepia(1) hue-rotate(180deg); }
      `}</style>
    </div>
  );
}
