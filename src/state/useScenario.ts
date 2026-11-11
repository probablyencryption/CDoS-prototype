import { useCallback, useEffect, useState } from 'react'
import type { Scenario, TileState } from './types'
import { LAYER_COUNT, TIMING } from './config'
import verifiedBoardroom from '../scenarios/verified-boardroom.json'
import arupReplay from '../scenarios/arup-replay.json'
import partialVerification from '../scenarios/partial-verification.json'
import townHall from '../scenarios/town-hall.json'

export const SCENARIOS = [
  verifiedBoardroom,
  arupReplay,
  partialVerification,
  townHall,
] as unknown as Scenario[]

export interface ScenarioController {
  scenario: Scenario
  scenarioIndex: number
  tiles: Record<string, TileState>
  selectScenario: (index: number) => void
  replay: () => void
}

// Per-tile verification state machine: waiting → idle → checking(layerIndex) → resolved.
// The whole timeline (joins, stagger, per-bar pacing) is scheduled up front from
// the scenario data and torn down on scenario change or replay.
export function useScenario(): ScenarioController {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [runId, setRunId] = useState(0)
  const [tiles, setTiles] = useState<Record<string, TileState>>({})
  const scenario = SCENARIOS[scenarioIndex]

  useEffect(() => {
    const initial: Record<string, TileState> = {}
    for (const p of scenario.participants) {
      initial[p.id] = { phase: p.joinAtMs > 0 ? 'waiting' : 'idle', layerIndex: -1 }
    }
    setTiles(initial)

    const timeouts: number[] = []
    const schedule = (ms: number, fn: () => void) => {
      timeouts.push(window.setTimeout(fn, ms))
    }
    const setTile = (id: string, next: TileState) => {
      setTiles((prev) => ({ ...prev, [id]: next }))
    }

    // Stagger runs within each join cohort so simultaneous joiners cascade
    // one after another instead of in lockstep.
    const cohortCounters = new Map<number, number>()
    for (const p of scenario.participants) {
      const cohortIndex = cohortCounters.get(p.joinAtMs) ?? 0
      cohortCounters.set(p.joinAtMs, cohortIndex + 1)

      if (p.joinAtMs > 0) {
        schedule(p.joinAtMs, () => setTile(p.id, { phase: 'idle', layerIndex: -1 }))
      }

      const cascadeStart =
        p.joinAtMs +
        (p.joinAtMs > 0 ? TIMING.joinSettleMs : TIMING.initialDelayMs) +
        cohortIndex * TIMING.participantStaggerMs

      for (let layer = 0; layer < LAYER_COUNT; layer++) {
        schedule(cascadeStart + layer * TIMING.layerMs, () =>
          setTile(p.id, { phase: 'checking', layerIndex: layer }),
        )
      }
      schedule(cascadeStart + LAYER_COUNT * TIMING.layerMs, () =>
        setTile(p.id, { phase: 'resolved', layerIndex: LAYER_COUNT }),
      )
    }

    return () => timeouts.forEach((t) => window.clearTimeout(t))
  }, [scenario, runId])

  const selectScenario = useCallback((index: number) => {
    if (index < 0 || index >= SCENARIOS.length) return
    setScenarioIndex(index)
    setRunId((r) => r + 1)
  }, [])

  const replay = useCallback(() => setRunId((r) => r + 1), [])

  return { scenario, scenarioIndex, tiles, selectScenario, replay }
}
