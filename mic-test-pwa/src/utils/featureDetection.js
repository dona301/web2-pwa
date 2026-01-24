export function supportsMicrophone() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

export function supportsAudioContext() {
  return !!(window.AudioContext || window.webkitAudioContext)
}

export function supportsBackgroundSync() {
  return 'serviceWorker' in navigator && 'SyncManager' in window
}

export function supportsPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}
