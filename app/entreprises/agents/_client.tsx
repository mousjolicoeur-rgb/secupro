'use client'

import { useOptimistic, useTransition, useState } from 'react'
import Link from 'next/link'
import { revokeAgentAction } from './_actions'
import type {
  AgentSocieteWithAgent,
  AgentSocieteStatus,
  AgentSocieteRole,
} from '@/types/database.types'

// ── Design tokens (Enterprise Slate — matches the exploitation dashboard) ─────

const P = {
  bg:     '#0F1117',
  card:   '#1A1D27',
  border: '#252836',
  text:   '#F1F5F9',
  sub:    '#94A3B8',
  muted:  '#64748B',
  blue:   '#3B82F6',
  green:  '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  purple: '#8B5CF6',
  cyan:   '#06B6D4',
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AgentSocieteStatus, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: P.amber },
  approved: { label: 'Approuvé',   color: P.green },
  rejected: { label: 'Refusé',     color: P.red   },
}

const ROLE_CFG: Record<AgentSocieteRole, { label: string; color: string }> = {
  agent:         { label: 'Agent',         color: P.blue   },
  chef_de_poste: { label: 'Chef de poste', color: P.purple },
  superviseur:   { label: 'Superviseur',   color: P.cyan   },
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(d))
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      color,
      background: color + '1A',
      border: `1px solid ${color}4D`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color, display: 'inline-block', flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

// ── Tab helpers ───────────────────────────────────────────────────────────────

type Tab = 'all' | AgentSocieteStatus

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',      label: 'Tous'       },
  { id: 'approved', label: 'Approuvés'  },
  { id: 'pending',  label: 'En attente' },
  { id: 'rejected', label: 'Refusés'    },
]

const TH_STYLE = {
  padding: '12px 16px', textAlign: 'left' as const,
  fontSize: '11px', fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  whiteSpace: 'nowrap' as const,
}

const TD_STYLE = {
  padding: '14px 16px', fontSize: '13px', whiteSpace: 'nowrap' as const,
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgentsListClient({
  initialAgents,
}: {
  initialAgents: AgentSocieteWithAgent[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [isPending, startTransition] = useTransition()
  const [revokeError, setRevokeError] = useState<string | null>(null)

  const [optimisticAgents, removeOptimistic] = useOptimistic(
    initialAgents,
    (current, liaisonId: string) => current.filter((a) => a.id !== liaisonId),
  )

  function handleRevoke(liaisonId: string) {
    setRevokeError(null)
    startTransition(async () => {
      removeOptimistic(liaisonId)
      const result = await revokeAgentAction(liaisonId)
      if (!result.success) setRevokeError(result.error)
    })
  }

  const filtered =
    activeTab === 'all'
      ? optimisticAgents
      : optimisticAgents.filter((a) => a.status === activeTab)

  const tabCount = (tab: Tab) =>
    tab === 'all'
      ? optimisticAgents.length
      : optimisticAgents.filter((a) => a.status === tab).length

  return (
    <div style={{
      background: P.bg, minHeight: '100vh',
      fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
      color: P.text, fontSize: '14px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px',
          }}>
            <div>
              <Link href="/espace-societe/dashboard" style={{
                fontSize: '11px', fontWeight: 700, color: P.muted,
                textDecoration: 'none', textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                ← Dashboard
              </Link>
              <h1 style={{
                margin: '8px 0 4px',
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 900, letterSpacing: '-0.02em',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                Mes agents
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 32, height: 28, padding: '0 8px',
                  borderRadius: '8px',
                  background: P.blue + '1A', border: `1px solid ${P.blue}4D`,
                  fontSize: '14px', fontWeight: 800, color: P.blue,
                }}>
                  {optimisticAgents.length}
                </span>
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: P.muted }}>
                Gérez les agents liés à votre société de sécurité.
              </p>
            </div>

            <Link href="/entreprises/agents/invite" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
              background: P.blue, color: '#fff',
              fontSize: '13px', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
            }}>
              + Inviter un agent
            </Link>
          </div>
        </header>

        {/* ── Error banner ── */}
        {revokeError && (
          <div style={{
            marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: P.red, fontSize: '13px', fontWeight: 500,
          }}>
            Erreur lors de la révocation : {revokeError}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: '2px',
          borderBottom: `1px solid ${P.border}`, marginBottom: '20px',
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px', border: 'none', background: 'transparent',
                  cursor: 'pointer', color: active ? P.blue : P.muted,
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  borderBottom: `2px solid ${active ? P.blue : 'transparent'}`,
                  marginBottom: '-1px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
              >
                {tab.label}
                <span style={{
                  padding: '1px 7px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                  background: active ? P.blue + '1A' : P.border,
                  color: active ? P.blue : P.muted,
                }}>
                  {tabCount(tab.id)}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 ? (
          <div style={{
            padding: '56px 40px', textAlign: 'center',
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: '16px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>👥</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: P.text, marginBottom: '8px' }}>
              {activeTab === 'all'
                ? 'Aucun agent lié pour l\'instant'
                : `Aucun agent dans l'onglet "${TABS.find((t) => t.id === activeTab)?.label}"`}
            </div>
            <p style={{ fontSize: '13px', color: P.muted, marginBottom: '24px' }}>
              Invitez des agents pour qu&apos;ils rejoignent votre société.
            </p>
            {activeTab === 'all' && (
              <Link href="/entreprises/agents/invite" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', textDecoration: 'none',
                background: P.blue + '1A', border: `1px solid ${P.blue}4D`,
                color: P.blue, fontSize: '13px', fontWeight: 700,
              }}>
                + Inviter un agent
              </Link>
            )}
          </div>
        ) : (

          /* ── Table ── */
          <div style={{
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    {['Nom', 'Email', 'Rôle', 'Statut', 'Invité le', 'Réponse le', ''].map((h) => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((liaison, i) => {
                    const profile = liaison.profiles
                    const name = profile.full_name ?? '—'
                    const email = profile.email ?? '—'
                    const roleCfg = ROLE_CFG[liaison.role]
                    const statusCfg = STATUS_CFG[liaison.status]
                    const canRevoke =
                      liaison.status === 'approved' || liaison.status === 'pending'

                    return (
                      <tr
                        key={liaison.id}
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? `1px solid ${P.border}`
                              : 'none',
                          opacity: isPending ? 0.6 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <td style={{ ...TD_STYLE, fontWeight: 600, color: P.text }}>
                          {name}
                        </td>
                        <td style={{ ...TD_STYLE, color: P.sub }}>
                          {email}
                        </td>
                        <td style={TD_STYLE}>
                          <Pill color={roleCfg.color} label={roleCfg.label} />
                        </td>
                        <td style={TD_STYLE}>
                          <Pill color={statusCfg.color} label={statusCfg.label} />
                        </td>
                        <td style={{ ...TD_STYLE, color: P.muted, fontSize: '12px' }}>
                          {formatDate(liaison.invited_at)}
                        </td>
                        <td style={{ ...TD_STYLE, color: P.muted, fontSize: '12px' }}>
                          {formatDate(liaison.responded_at)}
                        </td>
                        <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                          {canRevoke && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(liaison.id)}
                              disabled={isPending}
                              style={{
                                padding: '5px 14px', borderRadius: '7px',
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: P.red, fontSize: '11px', fontWeight: 700,
                                cursor: isPending ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Révoquer
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
