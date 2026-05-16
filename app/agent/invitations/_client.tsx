'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { respondToInvitationAction } from './_actions'
import type { AgentSocieteWithSociete, AgentSocieteStatus } from '@/types/database.types'

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS: Record<AgentSocieteStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'En attente',  color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.28)'  },
  approved: { label: 'Approuvé',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.28)'   },
  rejected: { label: 'Refusé',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.28)'   },
}

const ROLE_LABELS: Record<string, string> = {
  agent: 'Agent',
  chef_de_poste: 'Chef de poste',
  superviseur: 'Superviseur',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(d))
}

function StatusBadge({ status }: { status: AgentSocieteStatus }) {
  const cfg = STATUS[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  )
}

// ── InvitationCard ─────────────────────────────────────────────────────────

function InvitationCard({
  liaison,
  onRespond,
  isProcessing,
}: {
  liaison: AgentSocieteWithSociete
  onRespond: (id: string, response: 'approved' | 'rejected') => void
  isProcessing: boolean
}) {
  const { societes: societe } = liaison
  const cfg = STATUS[liaison.status]

  return (
    <div style={{
      background: 'rgba(22,27,34,0.95)',
      border: `1px solid ${liaison.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(0,209,255,0.1)'}`,
      borderRadius: '16px',
      padding: '24px',
      transition: 'border-color 0.2s',
      opacity: isProcessing ? 0.6 : 1,
    }}>
      {/* Ligne supérieure : société + statut */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f1f5f9' }}>
            {societe.nom}
          </h3>
          {societe.email && (
            <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.6)' }}>{societe.email}</span>
          )}
        </div>
        <StatusBadge status={liaison.status} />
      </div>

      {/* Méta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: liaison.note || liaison.status === 'pending' || liaison.status === 'approved' ? '16px' : 0 }}>
        <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)' }}>
          <span style={{ color: 'rgba(0,209,255,0.5)', fontWeight: 700 }}>Rôle proposé :</span>{' '}
          {ROLE_LABELS[liaison.role] ?? liaison.role}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)' }}>
          <span style={{ color: 'rgba(0,209,255,0.5)', fontWeight: 700 }}>Invité le :</span>{' '}
          {formatDate(liaison.invited_at)}
        </span>
      </div>

      {/* Note */}
      {liaison.note && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(0,209,255,0.04)',
          border: '1px solid rgba(0,209,255,0.08)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(148,163,184,0.8)',
          fontStyle: 'italic',
          marginBottom: '16px',
        }}>
          « {liaison.note} »
        </div>
      )}

      {/* Actions selon le statut */}
      {liaison.status === 'pending' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onRespond(liaison.id, 'approved')}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 16px rgba(34,197,94,0.25)',
              transition: 'all 0.2s',
            }}
          >
            Accepter
          </button>
          <button
            onClick={() => onRespond(liaison.id, 'rejected')}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Refuser
          </button>
        </div>
      )}

      {liaison.status === 'approved' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'rgba(34,197,94,0.85)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)', display: 'inline-block', flexShrink: 0 }} />
          Vous travaillez pour cette société
        </div>
      )}
    </div>
  )
}

// ── InvitationsClient (export) ─────────────────────────────────────────────

type OptimisticAction = { id: string; status: AgentSocieteStatus }

export default function InvitationsClient({
  initialInvitations,
}: {
  initialInvitations: AgentSocieteWithSociete[]
}) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [optimisticInvitations, applyOptimistic] = useOptimistic(
    initialInvitations,
    (current, action: OptimisticAction) =>
      current.map((inv) =>
        inv.id === action.id ? { ...inv, status: action.status } : inv,
      ),
  )

  function handleRespond(liaisonId: string, response: 'approved' | 'rejected') {
    setErrors((prev) => { const next = { ...prev }; delete next[liaisonId]; return next })
    startTransition(async () => {
      applyOptimistic({ id: liaisonId, status: response })
      const result = await respondToInvitationAction(liaisonId, response)
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [liaisonId]: result.error }))
      }
    })
  }

  const pending = optimisticInvitations.filter((i) => i.status === 'pending')
  const others  = optimisticInvitations.filter((i) => i.status !== 'pending')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      color: '#f1f5f9',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <a
            href="/agent/hub"
            style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,209,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em' }}
          >
            ← Hub agent
          </a>
          <h1 style={{ margin: '10px 0 4px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
            Mes{' '}
            <span style={{ color: '#00d1ff', textShadow: '0 0 20px rgba(0,209,255,0.4)' }}>
              invitations
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.05em' }}>
            Gérez les demandes de collaboration des sociétés de sécurité.
          </p>
        </header>

        {optimisticInvitations.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            background: 'rgba(22,27,34,0.95)',
            border: '1px solid rgba(0,209,255,0.08)',
            borderRadius: '16px',
            color: 'rgba(148,163,184,0.5)',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            Aucune invitation reçue pour l'instant.
          </div>
        ) : (
          <>
            {/* En attente */}
            {pending.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#f97316' }}>
                  En attente ({pending.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pending.map((inv) => (
                    <div key={inv.id}>
                      <InvitationCard
                        liaison={inv}
                        onRespond={handleRespond}
                        isProcessing={isPending}
                      />
                      {errors[inv.id] && (
                        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#f87171', paddingLeft: '4px' }}>
                          Erreur : {errors[inv.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Autres (approved / rejected) */}
            {others.length > 0 && (
              <section>
                <h2 style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,209,255,0.5)' }}>
                  Historique ({others.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {others.map((inv) => (
                    <InvitationCard
                      key={inv.id}
                      liaison={inv}
                      onRespond={handleRespond}
                      isProcessing={isPending}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
