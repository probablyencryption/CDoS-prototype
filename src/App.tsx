import { useEffect, useState } from 'react'
import MeetingCanvas from './components/MeetingCanvas'
import ProvenanceDrawer from './components/ProvenanceDrawer'
import PresenterPanel from './components/PresenterPanel'
import AboutModal from './components/AboutModal'
import { SCENARIOS, useScenario } from './state/useScenario'

export default function App() {
  const { scenario, scenarioIndex, tiles, selectScenario, replay } = useScenario()
  const [inspectedId, setInspectedId] = useState<string | null>(null)
  const [presenterOpen, setPresenterOpen] = useState(false)
  const [realityCheck, setRealityCheck] = useState(false)
  const [screenshotMode, setScreenshotMode] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  useEffect(() => {
    setInspectedId(null)
  }, [scenario.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') {
        if (aboutOpen) setAboutOpen(false)
        else if (inspectedId) setInspectedId(null)
        else if (presenterOpen) setPresenterOpen(false)
        return
      }
      if (/^[1-4]$/.test(e.key)) {
        selectScenario(Number(e.key) - 1)
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'p') setPresenterOpen((v) => !v)
      else if (k === 'r') replay()
      else if (k === 'b') setRealityCheck((v) => !v)
      else if (k === 's') setScreenshotMode((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aboutOpen, inspectedId, presenterOpen, selectScenario, replay])

  const inspected = inspectedId
    ? scenario.participants.find((p) => p.id === inspectedId) ?? null
    : null

  return (
    <div
      className={`h-dvh w-full overflow-hidden bg-canvas text-ink ${
        screenshotMode ? 'screenshot-freeze' : ''
      }`}
    >
      <MeetingCanvas
        scenario={scenario}
        tiles={tiles}
        realityCheck={realityCheck}
        screenshotMode={screenshotMode}
        onInspect={setInspectedId}
      />

      <ProvenanceDrawer participant={inspected} onClose={() => setInspectedId(null)} />

      {presenterOpen && !screenshotMode && (
        <PresenterPanel
          scenarios={SCENARIOS}
          activeIndex={scenarioIndex}
          realityCheck={realityCheck}
          onSelectScenario={selectScenario}
          onReplay={replay}
          onToggleRealityCheck={() => setRealityCheck((v) => !v)}
          onEnterScreenshot={() => setScreenshotMode(true)}
        />
      )}

      {!screenshotMode && (
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="fixed bottom-4 right-4 z-30 text-[11px] text-ink-muted/80 underline-offset-2 outline-none hover:text-ink-muted hover:underline focus-visible:text-ink-muted focus-visible:underline"
        >
          About this PoC
        </button>
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
