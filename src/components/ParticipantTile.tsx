import { useEffect, useState, type CSSProperties } from 'react'
import { availableVideoIds } from 'virtual:participant-media'
import type { Participant, TileState } from '../state/types'
import { aggregateStatus } from '../state/config'
import { getSelfCamera } from '../state/media'
import ZrsGlyph from './ZrsGlyph'

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function hashOf(text: string): number {
  let h = 7
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// Animated stand-in that reads as a live feed: drifting gradient keyed off the
// participant id, faint scanlines, noise shimmer, and an initials avatar.
function PlaceholderMedia({ participant }: { participant: Participant }) {
  const hue = hashOf(participant.id) % 360
  const scanSeconds = 6 + (hashOf(participant.id) % 5)
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="tile-drift absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${hue} 40% 13%) 0%, hsl(${(hue + 45) % 360} 35% 8%) 45%, hsl(${(hue + 310) % 360} 45% 15%) 100%)`,
        }}
      />
      <div className="tile-scanlines absolute inset-0" />
      <div className="tile-noise absolute inset-0 opacity-[0.06]" />
      <div className="tile-scanband" style={{ animationDuration: `${scanSeconds}s` }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="avatar-float flex aspect-square h-[28%] min-h-10 items-center justify-center rounded-full text-lg font-medium text-ink/90 ring-1 ring-white/10"
          style={{ backgroundColor: `hsl(${hue} 35% 24%)` }}
        >
          {initialsOf(participant.name)}
        </div>
      </div>
    </div>
  )
}

// The "self" tile: local webcam if granted, placeholder otherwise.
function SelfMedia({ participant }: { participant: Participant }) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  useEffect(() => {
    let alive = true
    getSelfCamera().then((s) => {
      if (alive) setStream(s)
    })
    return () => {
      alive = false
    }
  }, [])
  if (!stream) return <PlaceholderMedia participant={participant} />
  return (
    <video
      autoPlay
      muted
      playsInline
      ref={(el) => {
        if (el && el.srcObject !== stream) el.srcObject = stream
      }}
      className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
    />
  )
}

function FileMedia({ participant }: { participant: Participant }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      src={`/participants/${participant.id}.mp4`}
      ref={(el) => {
        if (el) el.muted = true
      }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

function MicMutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Microphone muted"
      className="h-3 w-3 shrink-0 text-failed"
    >
      <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-.44 1.56M9 9.5V11a3 3 0 0 0 3.9 2.86" />
      <path d="M5 11a7 7 0 0 0 11.6 5.27M19 11a7 7 0 0 1-.42 2.4" />
      <path d="M12 18v3" />
      <path d="m4 4 16 16" />
    </svg>
  )
}

interface Props {
  participant: Participant
  tile: TileState
  realityCheck: boolean
  screenshotMode: boolean
  onInspect: (id: string) => void
  style?: CSSProperties
}

export default function ParticipantTile({
  participant: p,
  tile,
  realityCheck,
  screenshotMode,
  onInspect,
  style,
}: Props) {
  const isSelf = p.kind === 'self'
  const resolved = tile.phase === 'resolved'
  const status = aggregateStatus(p)
  const showBanner = resolved && status === 'incomplete' && !realityCheck
  const showVerifiedLabel = resolved && status === 'verified' && !realityCheck

  const media = isSelf ? (
    <SelfMedia participant={p} />
  ) : availableVideoIds.includes(p.id) ? (
    <FileMedia participant={p} />
  ) : (
    <PlaceholderMedia participant={p} />
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${isSelf ? 'You' : p.name} — open provenance details`}
      onClick={() => onInspect(p.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onInspect(p.id)
        }
      }}
      style={style}
      className={`tile-enter relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-tile outline-none focus-visible:ring-2 focus-visible:ring-checking ${
        isSelf ? 'border-accent/80' : 'border-edge'
      }`}
    >
      {media}

      <ZrsGlyph
        participant={p}
        tile={tile}
        realityCheck={realityCheck}
        screenshotMode={screenshotMode}
      />

      {/* Name plate */}
      <div
        className={`absolute left-2 z-10 flex max-w-[85%] items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-xs backdrop-blur-sm transition-all duration-200 ${
          showBanner ? 'bottom-8' : 'bottom-2'
        }`}
      >
        {p.micMuted && <MicMutedIcon />}
        <span className="truncate font-medium">{isSelf ? 'YOU' : p.name}</span>
        {showVerifiedLabel && (
          <span className="label-fade shrink-0 text-[10px] font-medium text-verified">
            ✓ Stream Verified
          </span>
        )}
      </div>

      {/* Aggregate warning banner — absence of verification is the warning */}
      {showBanner && (
        <div className="banner-enter absolute inset-x-0 bottom-0 z-10 border-t border-failed/60 bg-warn-fill/95 px-2 py-1 text-center text-[9px] font-semibold tracking-wider text-failed">
          ⚠ PROVENANCE INCOMPLETE — STREAM CANNOT BE FULLY VERIFIED
        </div>
      )}
    </div>
  )
}
