// Single shared webcam request for the "self" tile — the one deliberate
// exception to the no-camera rule. The promise is cached so the browser
// permission prompt appears at most once per session, and the stream is
// reused across scenario switches. A denial resolves to null (placeholder).
let cameraPromise: Promise<MediaStream | null> | null = null

export function getSelfCamera(): Promise<MediaStream | null> {
  if (!cameraPromise) {
    cameraPromise =
      typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia
        ? navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .catch(() => null)
        : Promise.resolve(null)
  }
  return cameraPromise
}
