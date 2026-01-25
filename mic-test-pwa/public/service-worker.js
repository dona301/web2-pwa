const CACHE_NAME = 'mic-test-shell-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/microphone192.png',
  '/icons/microphone.png',
  '/screenshots/desktop.png',
  '/screenshots/mobile.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      for (const url of APP_SHELL) {
        try {
          await cache.add(url)
        } catch (err) {
          console.warn('Failed to cache', url, err)
        }
      }
    })()
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
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/src')) {
    return
  }
event.respondWith(handleRequest(request))
})


self.addEventListener('sync', event => {
  if (event.tag === 'sync-mic-tests') {
    event.waitUntil(syncMicrophoneTests())
  }
})

async function handleRequest(request) {
  try {
    return await fetch(request)
  } catch (err) {
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html')
      return offline
    }
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return Response.error()
  }
}
async function syncMicrophoneTests() {
  const db = await openDB('mic-test-db', 1)
  const tests = await db.getAll('tests')

  for (const test of tests.filter(t => !t.synced)) {
    await fetch('/tests', {
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
