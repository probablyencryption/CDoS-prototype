import { useEffect, useRef } from 'react'
import type { AggregateStatus, LayerResult, Participant } from '../state/types'
import { ZRS_LAYERS, aggregateStatus } from '../state/config'
import SparklineSvg from './SparklineSvg'

const PILL: Record<AggregateStatus, { label: string; cls: string }> = {
  verified: {
    label: 'VERIFIED',
    cls: 'border-verified/40 bg-verified/10 text-verified',
  },
  partial: {
    label: 'PARTIALLY VERIFIED',
    cls: 'border-edge bg-unresolved/30 text-ink-muted',
  },
  incomplete: {
    label: 'PROVENANCE INCOMPLETE',
    cls: 'border-failed/50 bg-warn-fill text-failed',
  },
}

const RESULT_TEXT: Record<LayerResult, string> = {
  verified: 'text-verified',
  failed: 'text-failed',
  unresolved: 'text-ink-muted',
}

function StatusIcon({ result }: { result: LayerResult }) {
  if (result === 'verified') {
    return (
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-verified/15 text-[10px] font-bold text-verified"
      >
        ✓
      </span>
    )
  }
  if (result === 'failed') {
    return (
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-failed/15 text-[10px] font-bold text-failed"
      >
        ✕
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-unresolved/40 text-[10px] font-bold text-ink-muted"
    >
      –
    </span>
  )
}

interface Props {
  participant: Participant | null
  onClose: () => void
}

export default function ProvenanceDrawer({ participant, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!participant) return
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    return () => previouslyFocused?.focus()
  }, [participant?.id])

  if (!participant) return null
  const pill = PILL[aggregateStatus(participant)]

  return (
    <>
      {/* Click-away layer */}
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Provenance details for ${participant.name}`}
        className="drawer-enter fixed right-0 top-0 z-40 flex h-full w-[380px] max-w-[92vw] flex-col border-l border-edge bg-tile shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-edge px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">
              {participant.kind === 'self' ? `${participant.name} (this device)` : participant.name}
            </h2>
            {participant.subtitle && (
              <p className="mt-0.5 text-xs text-ink-muted">{participant.subtitle}</p>
            )}
            <span
              className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${pill.cls}`}
            >
              {pill.label}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close provenance details"
            className="rounded-md p-1.5 text-ink-muted outline-none hover:bg-white/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-checking"
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {ZRS_LAYERS.map((layer) => {
            const finding = participant.layers[layer.key]
            return (
              <section key={layer.key} className="border-b border-edge/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <StatusIcon result={finding.result} />
                  <h3 className="text-sm font-medium">{layer.label}</h3>
                  <span
                    className={`ml-auto text-[10px] font-semibold uppercase tracking-wider ${RESULT_TEXT[finding.result]}`}
                  >
                    {finding.result}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{layer.plain}</p>
                <p className="mt-2 rounded bg-black/30 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-ink/85">
                  {finding.detail}
                </p>
                {layer.key === 'history' && participant.historySparkline.length >= 2 && (
                  <SparklineSvg values={participant.historySparkline} />
                )}
              </section>
            )
          })}
        </div>

        <footer className="px-5 py-3 text-[10px] text-ink-muted/70">
          Zero Reality Signal · deterministic PoC — all values from scenario data
        </footer>
      </aside>
    </>
  )
}
