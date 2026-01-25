importScripts('https://cdn.jsdelivr.net/npm/idb@8/build/index.min.js');

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
  let data = {}
  try {
    data = event.data.json()
  } catch (err) {
    data = {
      title: 'Notification',
      body: event.data?.text() || 'You have a new update'
    }
  }

  if (Notification.permission === 'granted') {
    self.registration.showNotification(data.title, {
      body: data.body
    });
  }
})

