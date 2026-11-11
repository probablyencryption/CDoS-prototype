export type LayerKey = 'device' | 'identity' | 'stream' | 'c2pa' | 'history'

export type LayerResult = 'verified' | 'failed' | 'unresolved'

export type BarVisualState = LayerResult | 'checking'

export type AggregateStatus = 'verified' | 'partial' | 'incomplete'

export interface LayerFinding {
  result: LayerResult
  detail: string
}

export interface Participant {
  id: string
  name: string
  subtitle?: string
  kind: 'remote' | 'self'
  joinAtMs: number
  micMuted?: boolean
  layers: Record<LayerKey, LayerFinding>
  historySparkline: number[]
}

export interface Scenario {
  id: string
  title: string
  gridLabel: string
  participants: Participant[]
}

export type TilePhase = 'waiting' | 'idle' | 'checking' | 'resolved'

export interface TileState {
  phase: TilePhase
  layerIndex: number
}
