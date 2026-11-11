import { useEffect, useState, type ReactNode } from 'react'
import type { Scenario, TileState } from '../state/types'
import { LAYER_COUNT } from '../state/config'
import ParticipantTile from './ParticipantTile'

const TIMER_BASE_SECONDS = 12 * 60 + 47 // "12:47", also the frozen screenshot value

function MeetingTimer({ frozen }: { frozen: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (frozen) return
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [frozen])
  const total = frozen ? TIMER_BASE_SECONDS : TIMER_BASE_SECONDS + elapsed
  const mm = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const ss = (total % 60).toString().padStart(2, '0')
  return (
    <span className="font-mono text-xs tabular-nums text-ink-muted">
      {mm}:{ss}
    </span>
  )
}

function Svg({ children, filled }: { children: ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {children}
    </svg>
  )
}

function ControlButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A2340] text-ink outline-none transition-colors hover:bg-[#25325A] focus-visible:ring-2 focus-visible:ring-checking"
    >
      {children}
    </button>
  )
}

// Deliberately mundane, non-functional call controls.
function ControlBar() {
  return (
    <footer className="flex h-[72px] shrink-0 items-center justify-center gap-3">
      <ControlButton label="Mute microphone">
        <Svg>
          <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </Svg>
      </ControlButton>
      <ControlButton label="Turn off camera">
        <Svg>
          <rect x="3" y="7" width="12" height="10" rx="2.5" />
          <path d="m15 11 5-2.8v7.6L15 13" />
        </Svg>
      </ControlButton>
      <ControlButton label="Share screen">
        <Svg>
          <rect x="3" y="5" width="18" height="12.5" rx="2" />
          <path d="M12 14V8.5m0 0L9.5 11m2.5-2.5L14.5 11" />
          <path d="M9 20.5h6" />
        </Svg>
      </ControlButton>
      <ControlButton label="More options">
        <Svg filled>
          <circle cx="5.5" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18.5" cy="12" r="1.4" />
        </Svg>
      </ControlButton>
      <button
        type="button"
        aria-label="Leave meeting"
        className="ml-2 flex h-11 w-14 items-center justify-center rounded-full bg-failed/90 text-white outline-none transition-colors hover:bg-failed focus-visible:ring-2 focus-visible:ring-checking"
      >
        <Svg filled>
          <path d="M4 14.2c4.6-4.2 11.4-4.2 16 0a1 1 0 0 1 .05 1.4l-1.9 2.1a1 1 0 0 1-1.3.13 10.4 10.4 0 0 0-2.6-1.36l-.36-2.5a11.6 11.6 0 0 0-3.78 0l-.36 2.5c-.92.3-1.8.76-2.6 1.36a1 1 0 0 1-1.3-.13l-1.9-2.1A1 1 0 0 1 4 14.2Z" />
        </Svg>
      </button>
    </footer>
  )
}

function LogoMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 text-accent">
      <rect x="2" y="9.5" width="2.4" height="4.5" rx="0.7" fill="currentColor" opacity="0.55" />
      <rect x="6" y="6.5" width="2.4" height="7.5" rx="0.7" fill="currentColor" opacity="0.8" />
      <rect x="10" y="3" width="2.4" height="11" rx="0.7" fill="currentColor" />
    </svg>
  )
}

interface Props {
  scenario: Scenario
  tiles: Record<string, TileState>
  realityCheck: boolean
  screenshotMode: boolean
  onInspect: (id: string) => void
}

export default function MeetingCanvas({
  scenario,
  tiles,
  realityCheck,
  screenshotMode,
  onInspect,
}: Props) {
  const RESOLVED_TILE: TileState = { phase: 'resolved', layerIndex: LAYER_COUNT }

  const tileFor = (id: string, joinAtMs: number): TileState =>
    tiles[id] ?? { phase: joinAtMs > 0 ? 'waiting' : 'idle', layerIndex: -1 }

  // Screenshot mode shows the fully-resolved end state of the scenario.
  const visible = scenario.participants.filter(
    (p) => screenshotMode || tileFor(p.id, p.joinAtMs).phase !== 'waiting',
  )
  const count = visible.length
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4
  const rows = Math.max(1, Math.ceil(count / cols))
  const gapPx = 12
  const chromePx = 176 + (rows - 1) * gapPx

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 font-semibold">
            <LogoMark />
            Horizon Meet
          </span>
          <span className="h-4 w-px bg-edge" aria-hidden="true" />
          <span className="text-ink-muted">{scenario.gridLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-failed">
            <span className="rec-dot h-2 w-2 rounded-full bg-failed" aria-hidden="true" />
            REC
          </span>
          <MeetingTimer frozen={screenshotMode} />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center px-5">
        <div
          className="flex w-full flex-wrap items-center justify-center"
          style={{
            gap: `${gapPx}px`,
            maxWidth: `min(1500px, 94vw, calc((100dvh - ${chromePx}px) * ${((16 / 9) * cols) / rows}))`,
          }}
        >
          {visible.map((p) => (
            <ParticipantTile
              key={p.id}
              participant={p}
              tile={screenshotMode ? RESOLVED_TILE : tileFor(p.id, p.joinAtMs)}
              realityCheck={realityCheck}
              screenshotMode={screenshotMode}
              onInspect={onInspect}
              style={{ width: `calc(${100 / cols}% - ${((cols - 1) * gapPx) / cols}px)` }}
            />
          ))}
        </div>
      </main>

      {/* Caption slot keeps its height so the grid doesn't jump on toggle */}
      <div className="flex h-7 shrink-0 items-center justify-center">
        <p
          aria-live="polite"
          className={`text-xs text-ink-muted transition-opacity duration-300 ${
            realityCheck ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {realityCheck ? 'Binary mode — signal granularity lost' : ''}
        </p>
      </div>

      <ControlBar />
    </div>
  )
}
