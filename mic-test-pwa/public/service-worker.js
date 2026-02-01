import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';
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
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })()
  );
  self.clients.claim();
});

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
    return await fetch(request);
  } catch (err) {
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      return cachedIndex || (await caches.match('/offline.html'));
    }

    const cached = await caches.match(request);
    if (cached) return cached;

    return Response.error();
  }
}

async function syncMicrophoneTests() {
  const db = await openDB('mic-test-db', 1)
  const tests = await db.getAll('tests')

  for (const test of tests.filter(t => !t.synced)) {
    try {
      const response = await fetch('/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test)
      })

      if (response.ok) {
        test.synced = true
        await db.put('tests', test)
      } else {
        console.error('Failed to sync test:', test.id, response.status)
      }
    } catch (error) {
      console.error('Error syncing test:', test.id, error)
    }
  }

  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'sync-complete' }))
  })

  // Send push notification via server
  fetch('/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Sync complete',
      body: 'Microphone tests uploaded successfully'
    })
  }).catch(err => console.error('Error sending push:', err))
}



self.addEventListener('push', event => {
  console.log('Push event received:', event)
  let data = {}
  try {
    data = event.data.json()
    console.log('Push data:', data)
  } catch (err) {
    console.error('Error parsing push data:', err)
    data = {
      title: 'Notification',
      body: event.data?.text() || 'You have a new update'
    }
  }

  if (Notification.permission === 'granted') {
    console.log('Showing notification:', data.title, data.body)
    self.registration.showNotification(data.title, {
      body: data.body
    });
  } else {
    console.warn('Notification permission not granted')
  }
})

