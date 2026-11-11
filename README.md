# Zero Reality Signal — Proof-of-Concept Demo

A deterministic visual simulation of a mainstream video-conference interface with an
embedded stream-provenance trust signal (the **ZRS**, a five-bar glyph on every
participant tile). Built for the final-year project *"Mitigating Cognitive
Denial-of-Service (C-DoS) in Real-Time Video Communication: A Zero Reality
Architecture Framework for Stream Provenance & Verification."*

Every rendered state derives from static JSON in `src/scenarios/`. There is no
backend, no real cryptography, no WebRTC, and no runtime network access. The one
deliberate exception: the **YOU** tile asks for local webcam access once (deny it and
an animated placeholder is used instead).

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
```

## Presenter hotkeys (hidden from the audience)

| Key | Action |
| --- | --- |
| `P` | Toggle presenter panel |
| `1`–`4` | Switch scenario |
| `R` | Replay the verification cascade (re-runs joins too) |
| `B` | RealityCheck: collapse ZRS to a binary ✓/✗ badge |
| `S` | Screenshot mode: freeze animations, hide presenter chrome |

Click any tile (or press Enter on a focused tile) to open the provenance drawer.
Escape closes it.

## Scenarios

1. **Verified Boardroom** — 6 participants, everything green. The boring baseline.
2. **Executive Deepfake (Arup-class)** — 5 verified at load; at t≈5s a "Chief
   Financial Officer" joins and resolves live to red/grey/red/red/grey.
3. **Partial Verification** — one participant on legacy hardware: device, identity,
   and stream verified, but C2PA and history unresolved. No banner, no green check —
   the middle state a binary system cannot express (press `B` to prove it).
4. **Company Town Hall** — 12 tiles, 7 synthetic patterns among 5 verified.
   Aggregate legibility: the fakes are obvious at a glance.

## Optional media

Drop `<participant-id>.mp4` files into `public/participants/` (e.g. `amara.mp4`)
and restart the dev server; matching tiles will play the file as their video.
The file list is resolved at dev/build time, so a clone with no videos makes zero
speculative network requests.

## Design note

The aggregate banner rule implemented is: **any failed layer, or three or more
unresolved layers → "PROVENANCE INCOMPLETE" banner**. The original brief said "two
or more unresolved," but that clause would contradict its own acceptance criterion
for the partial-verification participant (exactly two unresolved layers, explicitly
*no* banner). The 3-of-5 threshold satisfies every specified scenario. A fully
verified participant gets a quiet "✓ Stream Verified" micro-label; partial states
get bars only — absence of verification is the warning.

---

Philips A., Adepoju · 2023/B/CYB/0230 · Miva Open University
