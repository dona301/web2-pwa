import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import webpush from 'web-push'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const vapidKeys = webpush.generateVAPIDKeys()
webpush.setVapidDetails('mailto:test@example.com', vapidKeys.publicKey, vapidKeys.privateKey)

let subscriptions = [] // In-memory storage for demo

const app = express()
app.use(express.json())

app.post('/tests', (req, res) => {
  console.log('Received test:', req.body)
  res.status(200).json({ success: true })
})

app.get('/vapid-public-key', (req, res) => {
  res.send(vapidKeys.publicKey)
})

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body)
  res.status(201).json({})
})

app.post('/push', async (req, res) => {
  console.log('Sending push notification:', req.body)
  const { title, body } = req.body
  try {
    await Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, JSON.stringify({ title, body }))))
    res.sendStatus(200)
  } catch (err) {
    console.error('Error sending push:', err)
    res.sendStatus(500)
  }
})

app.use(express.static(path.join(__dirname, '../dist')))

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
