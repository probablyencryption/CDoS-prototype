import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Exposes the list of participant ids that have a video file in
// public/participants/, resolved at dev/build time. Tiles consult this list
// instead of probing URLs, so a fresh clone with no videos makes zero
// speculative network requests at runtime.
function participantMedia(): Plugin {
  const virtualId = 'virtual:participant-media'
  const resolvedId = '\0' + virtualId
  return {
    name: 'zrs-participant-media',
    resolveId(id) {
      return id === virtualId ? resolvedId : undefined
    },
    load(id) {
      if (id !== resolvedId) return undefined
      const dir = path.join(rootDir, 'public', 'participants')
      let ids: string[] = []
      try {
        ids = fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.mp4'))
          .map((f) => f.slice(0, -'.mp4'.length))
      } catch {
        ids = []
      }
      return `export const availableVideoIds = ${JSON.stringify(ids)};`
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), participantMedia()],
})
