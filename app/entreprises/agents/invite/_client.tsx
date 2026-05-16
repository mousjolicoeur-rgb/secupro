'use client'

import { useActionState, useOptimistic, useTransition, useState } from 'react'
import { inviteAgentAction, revokeAgentAction, type ActionResult } from './_actions'
import type {
  AgentSocieteWithAgent,
  AgentSocieteRole,
  AgentSocieteStatus,
} from '@/types/database.types'

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<AgentSocieteRole, string> = {
  agent: 'Agent',
  chef_de_poste: 'Chef de poste',
  superviseur: 'Superviseur',
}

const STATUS: Record<AgentSocieteStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'En attente', color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.28)'  },
  approved: { label: 'Approuvé',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.28)'   },
  rejected: { label: 'Refusé',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.28)'   },
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d))
}

function errorMessage(error: string) {
  switch (error) {
    case 'agent_not_found': return "Cet agent n'a pas encore de compte SecuPRO."
    case 'already_invited': return 'Une invitation a déjà été envoyée à cet agent.'
    default: return error
  }
}

// ── StatusBadge ────────────────────────────────────────────────────────────

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

// ── InviteForm ─────────────────────────────────────────────────────────────

function InviteForm() {
  const [result, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    inviteAgentAction,
    null,
  )

  return (
    <div style={{
      background: 'rgba(22,27,34,0.95)',
      border: '1px solid rgba(0,209,255,0.12)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '32px',
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00d1ff' }}>
        Inviter un agent
      </h2>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.8)' }}>
            Email de l'agent *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="agent@exemple.fr"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,209,255,0.15)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f1f5f9',
              fontSize: '14px',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Rôle + Note sur la même ligne */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.8)' }}>
              Rôle
            </label>
            <select
              name="role"
              defaultValue="agent"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,209,255,0.15)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="agent" style={{ background: '#1a2030' }}>Agent</option>
              <option value="chef_de_poste" style={{ background: '#1a2030' }}>Chef de poste</option>
              <option value="superviseur" style={{ background: '#1a2030' }}>Superviseur</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.8)' }}>
              Note (optionnel)
            </label>
            <input
              name="note"
              type="text"
              placeholder="Message à l'agent..."
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,209,255,0.15)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 24px',
            borderRadius: '10px',
            background: isPending ? 'rgba(0,209,255,0.1)' : 'linear-gradient(135deg, #0369a1, #0ea5e9)',
            border: '1px solid rgba(0,209,255,0.3)',
            color: isPending ? 'rgba(0,209,255,0.5)' : '#fff',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isPending ? 'Envoi en cours…' : '+ Envoyer l'invitation'}
        </button>
      </form>

      {/* Feedback */}
      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          background: result.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${result.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: result.success ? '#22c55e' : '#f87171',
        }}>
          {result.success ? result.message : errorMessage(result.error)}
        </div>
      )}
    </div>
  )
}

// ── AgentsTable ────────────────────────────────────────────────────────────

function AgentsTable({ initialAgents }: { initialAgents: AgentSocieteWithAgent[] }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticAgents, removeOptimistic] = useOptimistic(
    initialAgents,
    (current, liaisonId: string) => current.filter((a) => a.id !== liaisonId),
  )
  const [revokeError, setRevokeError] = useState<string | null>(null)

  async function handleRevoke(liaisonId: string) {
    setRevokeError(null)
    startTransition(async () => {
      removeOptimistic(liaisonId)
      const result = await revokeAgentAction(liaisonId)
      if (!result.success) setRevokeError(result.error)
    })
  }

  if (optimisticAgents.length === 0) {
    return (
      <div style={{
        background: 'rgba(22,27,34,0.95)',
        border: '1px solid rgba(0,209,255,0.08)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(148,163,184,0.5)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em',
      }}>
        Aucun agent invité pour l'instant.
      </div>
    )
  }

  return (
    <div>
      {revokeError && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '12px' }}>
          Erreur : {revokeError}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
          <thead>
            <tr>
              {['Agent', 'Rôle', 'Statut', 'Invitation', ''].map((h) => (
                <th key={h} style={{
                  textAlign: 'left',
                  padding: '8px 14px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(0,209,255,0.5)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {optimisticAgents.map((liaison) => {
              const profile = liaison.profiles
              const name = profile.full_name ?? '—'
              const email = profile.email ?? '—'
              return (
                <tr key={liaison.id} style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  <td style={{
                    padding: '12px 14px',
                    background: 'rgba(22,27,34,0.95)',
                    borderRadius: '10px 0 0 10px',
                    border: '1px solid rgba(0,209,255,0.06)',
                    borderRight: 'none',
                  }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{name}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'rgba(148,163,184,0.6)', marginTop: '2px' }}>{email}</span>
                  </td>
                  <td style={{ padding: '12px 14px', background: 'rgba(22,27,34,0.95)', border: '1px solid rgba(0,209,255,0.06)', borderLeft: 'none', borderRight: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.8)' }}>
                      {ROLE_LABELS[liaison.role]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', background: 'rgba(22,27,34,0.95)', border: '1px solid rgba(0,209,255,0.06)', borderLeft: 'none', borderRight: 'none', whiteSpace: 'nowrap' }}>
                    <StatusBadge status={liaison.status} />
                  </td>
                  <td style={{ padding: '12px 14px', background: 'rgba(22,27,34,0.95)', border: '1px solid rgba(0,209,255,0.06)', borderLeft: 'none', borderRight: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.6)' }}>
                      {formatDate(liaison.invited_at)}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 14px',
                    background: 'rgba(22,27,34,0.95)',
                    borderRadius: '0 10px 10px 0',
                    border: '1px solid rgba(0,209,255,0.06)',
                    borderLeft: 'none',
                    textAlign: 'right',
                  }}>
                    <button
                      onClick={() => handleRevoke(liaison.id)}
                      disabled={isPending}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '7px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Révoquer
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── InvitePageClient (export) ──────────────────────────────────────────────

export default function InvitePageClient({
  initialAgents,
}: {
  initialAgents: AgentSocieteWithAgent[]
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      color: '#f1f5f9',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <a
            href="/espace-societe/dashboard"
            style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,209,255,0.5)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em' }}
          >
            ← Dashboard
          </a>
          <h1 style={{ margin: '10px 0 4px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
            Gestion des{' '}
            <span style={{ color: '#00d1ff', textShadow: '0 0 20px rgba(0,209,255,0.4)' }}>
              agents
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.05em' }}>
            Invitez des agents et gérez leurs accès à votre espace société.
          </p>
        </header>

        {/* Formulaire */}
        <InviteForm />

        {/* Table des agents */}
        <section>
          <h2 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,209,255,0.6)' }}>
            Agents invités ({initialAgents.length})
          </h2>
          <AgentsTable initialAgents={initialAgents} />
        </section>
      </div>
    </div>
  )
}
