import { useState } from 'react'
import type { BarVisualState, Participant, TileState } from '../state/types'
import { ZRS_LAYERS, barVisualState, binaryVerdict } from '../state/config'

const BAR_CLASS: Record<BarVisualState, string> = {
  verified: 'bg-verified',
  failed: 'bg-failed',
  unresolved: 'bg-unresolved',
  checking: 'bg-checking zrs-checking',
}

interface Props {
  participant: Participant
  tile: TileState
  realityCheck: boolean
  screenshotMode: boolean
}

export default function ZrsGlyph({ participant, tile, realityCheck, screenshotMode }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)
  const verdict = binaryVerdict(participant)

  return (
    <div className="absolute left-2 top-2 z-10">
      {/* Five-bar glyph */}
      <div
        role="group"
        aria-label={`Zero Reality Signal for ${participant.name}`}
        aria-hidden={realityCheck}
        className={`flex items-end gap-[3px] rounded-md bg-black/50 px-1.5 py-1.5 backdrop-blur-sm transition-opacity duration-300 ${
          realityCheck ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        {ZRS_LAYERS.map((layer, i) => {
          const state = barVisualState(participant, tile, i)
          return (
            <span
              key={layer.key}
              role="img"
              aria-label={`${layer.label}: ${state}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              className={`w-1 rounded-[1px] transition-colors duration-150 ${BAR_CLASS[state]}`}
              style={{ height: `${7 + i * 3}px` }}
            />
          )
        })}
      </div>

      {/* Binary badge — RealityCheck comparison mode */}
      <div
        aria-hidden={!realityCheck}
        className={`absolute left-0 top-0 transition-opacity duration-300 ${
          realityCheck ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span
          role="img"
          aria-label={verdict === 'pass' ? 'Verified (binary indicator)' : 'Not verified (binary indicator)'}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
            verdict === 'pass' ? 'bg-verified text-canvas' : 'bg-failed text-white'
          }`}
        >
          {verdict === 'pass' ? '✓' : '✗'}
        </span>
      </div>

      {/* Hover tooltip: layer name + current state */}
      {hovered !== null && !realityCheck && !screenshotMode && (
        <div className="absolute left-0 top-full z-20 mt-1 whitespace-nowrap rounded bg-black/85 px-2 py-1 text-[10px] text-ink shadow-lg">
          {ZRS_LAYERS[hovered].label} — {barVisualState(participant, tile, hovered)}
        </div>
      )}
    </div>
  )
}
