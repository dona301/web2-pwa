function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function requestPushPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.')
    return
  }

  if (Notification.permission === 'granted') {
    console.log('Notifications already granted.')
    return
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('Notifications permission granted!')
      await subscribeToPush()
    } else {
      console.warn('Notifications permission denied.')
    }
  } catch (err) {
    console.error('Error requesting notifications permission:', err)
  }
}

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready
    const response = await fetch('/vapid-public-key')
    const vapidPublicKey = await response.text()
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    })

    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('Subscribed to push notifications')
  } catch (err) {
    console.error('Error subscribing to push:', err)
  }
}
