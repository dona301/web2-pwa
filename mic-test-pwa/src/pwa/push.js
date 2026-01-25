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
    } else {
      console.warn('Notifications permission denied.')
    }
  } catch (err) {
    console.error('Error requesting notifications permission:', err)
  }
}
