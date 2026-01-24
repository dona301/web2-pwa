import { supportsBackgroundSync } from '../utils/featureDetection'

export async function registerSync() {
  if (!supportsBackgroundSync()) return

  const registration = await navigator.serviceWorker.ready
  await registration.sync.register('sync-mic-tests')
}
