import type { ReactNode } from 'react'
import type { Scenario } from '../state/types'

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-edge bg-black/40 px-1 font-mono text-[10px] text-ink-muted">
      {children}
    </kbd>
  )
}

interface Props {
  scenarios: Scenario[]
  activeIndex: number
  realityCheck: boolean
  onSelectScenario: (index: number) => void
  onReplay: () => void
  onToggleRealityCheck: () => void
  onEnterScreenshot: () => void
}

export default function PresenterPanel({
  scenarios,
  activeIndex,
  realityCheck,
  onSelectScenario,
  onReplay,
  onToggleRealityCheck,
  onEnterScreenshot,
}: Props) {
  return (
    <aside
      aria-label="Presenter controls"
      className="fixed bottom-4 left-4 z-40 w-72 rounded-xl border border-edge bg-[#0E1526]/95 p-3 text-xs shadow-2xl backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold tracking-wide">Presenter</span>
        <span className="text-[10px] text-ink-muted">
          <Kbd>P</Kbd> to hide
        </span>
      </div>

      <div className="space-y-1">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectScenario(i)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-checking ${
              i === activeIndex
                ? 'bg-checking/15 text-checking'
                : 'text-ink-muted hover:bg-white/5 hover:text-ink'
            }`}
          >
            <Kbd>{i + 1}</Kbd>
            <span className="truncate">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 space-y-1 border-t border-edge/70 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ink-muted outline-none transition-colors hover:bg-white/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-checking"
        >
          <Kbd>R</Kbd>
          <span>Replay verification</span>
        </button>
        <button
          type="button"
          onClick={onToggleRealityCheck}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ink-muted outline-none transition-colors hover:bg-white/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-checking"
        >
          <Kbd>B</Kbd>
          <span>RealityCheck (binary)</span>
          <span
            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              realityCheck ? 'bg-checking/20 text-checking' : 'bg-white/5 text-ink-muted'
            }`}
          >
            {realityCheck ? 'ON' : 'OFF'}
          </span>
        </button>
        <button
          type="button"
          onClick={onEnterScreenshot}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-ink-muted outline-none transition-colors hover:bg-white/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-checking"
        >
          <Kbd>S</Kbd>
          <span>Screenshot mode</span>
          <span className="ml-auto text-[10px] text-ink-muted/70">S again to exit</span>
        </button>
      </div>
    </aside>
  )
}
