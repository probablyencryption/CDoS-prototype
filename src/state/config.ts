import type {
  AggregateStatus,
  BarVisualState,
  LayerKey,
  LayerResult,
  Participant,
  TileState,
} from './types'

export interface ZrsLayerSpec {
  key: LayerKey
  label: string
  plain: string
}

// Fixed resolution order of the five ZRS layers, shortest bar to tallest.
export const ZRS_LAYERS: ZrsLayerSpec[] = [
  { key: 'device', label: 'Device Integrity', plain: 'Genuine sensor capture — not a virtual camera' },
  { key: 'identity', label: 'Identity Binding', plain: 'Cryptographic identity, AAL3-grade' },
  { key: 'stream', label: 'Stream Integrity', plain: 'Real-time hash of the capture source' },
  { key: 'c2pa', label: 'C2PA Manifest', plain: 'Content Credentials, verified live' },
  { key: 'history', label: 'Historical Trust', plain: 'Reputation across prior verified sessions' },
]

export const LAYER_COUNT = ZRS_LAYERS.length

// All verification pacing lives here.
export const TIMING = {
  layerMs: 500, // each bar pulses this long, then snaps to its resolved color
  participantStaggerMs: 300, // cascade offset between tiles in the same join cohort
  initialDelayMs: 450, // pause after scenario load before the first cascade starts
  joinSettleMs: 400, // pause between a mid-call join and that tile's cascade
}

export function layerResults(p: Participant): LayerResult[] {
  return ZRS_LAYERS.map((l) => p.layers[l.key].result)
}

// Aggregate rule: any failed layer, or a majority-unresolved signal (3+ of 5),
// marks the stream "provenance incomplete" (warning banner). Zero unresolved
// earns the quiet verified label; anything in between is the partial state —
// no banner, no positive badge, the bars speak for themselves.
export function aggregateStatus(p: Participant): AggregateStatus {
  const results = layerResults(p)
  const unresolvedCount = results.filter((r) => r === 'unresolved').length
  if (results.includes('failed') || unresolvedCount >= 3) return 'incomplete'
  return unresolvedCount === 0 ? 'verified' : 'partial'
}

// What a binary trust indicator would show: pass unless something loudly
// failed. Unresolved layers are invisible to it — that lossiness is the point
// of the RealityCheck comparison mode.
export function binaryVerdict(p: Participant): 'pass' | 'fail' {
  return layerResults(p).includes('failed') ? 'fail' : 'pass'
}

export function barVisualState(p: Participant, tile: TileState, layerIndex: number): BarVisualState {
  const result = p.layers[ZRS_LAYERS[layerIndex].key].result
  if (tile.phase === 'resolved') return result
  if (tile.phase === 'checking') {
    if (layerIndex < tile.layerIndex) return result
    if (layerIndex === tile.layerIndex) return 'checking'
  }
  return 'unresolved'
}
