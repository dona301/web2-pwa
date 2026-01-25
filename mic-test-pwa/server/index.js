import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

app.post('/tests', (req, res) => {
  console.log('Received test:', req.body)
  res.status(200).json({ success: true })
})

app.use(express.static(path.join(__dirname, '../dist')))

app.get(/.*/, (req, res) => {
  res.sendFile(
    new URL('../dist/index.html', import.meta.url).pathname
  )
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
