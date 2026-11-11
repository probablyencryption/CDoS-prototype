import { useEffect, useRef } from 'react'

interface Props {
  onClose: () => void
}

export default function AboutModal({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About this proof of concept"
        onClick={(e) => e.stopPropagation()}
        className="modal-enter w-full max-w-lg rounded-2xl border border-edge bg-tile p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold">About this proof-of-concept</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close about dialog"
            className="rounded-md p-1.5 text-ink-muted outline-none hover:bg-white/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-checking"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          This interface is a deterministic visual simulation driven by static JSON scenario
          data. No live cryptographic verification, hardware attestation, C2PA manifest
          validation, or WebRTC stream-hash computation is performed. Those capabilities are
          specified architecturally in the accompanying report.
        </p>

        <p className="mt-4 text-sm leading-snug">
          Mitigating Cognitive Denial-of-Service (C-DoS) in Real-Time Video Communication: A
          Zero Reality Architecture Framework for Stream Provenance &amp; Verification
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Philips A., Adepoju · 2023/B/CYB/0230 · Miva Open University
        </p>
      </div>
    </div>
  )
}
