const { openDB } = idb
const CACHE_NAME = 'mic-test-shell-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('sync', event => {
  if (event.tag === 'sync-mic-tests') {
    event.waitUntil(syncMicrophoneTests())
  }
})

async function syncMicrophoneTests() {
  const db = await openDB('mic-test-db', 1)
  const tests = await db.getAll('tests')

  for (const test of tests.filter(t => !t.synced)) {
    await fetch('http://localhost:5173/tests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(test)
    })

    test.synced = true
    await db.put('tests', test)
  }

  self.registration.showNotification('Sync complete', {
    body: 'Microphone tests uploaded successfully'
  })
}


self.addEventListener('push', event => {
  const data = event.data?.json() || {}

  self.registration.showNotification(data.title || 'Notification', {
    body: data.body || 'You have a new update'
  })
})
