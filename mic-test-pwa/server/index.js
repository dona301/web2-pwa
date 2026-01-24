import express from 'express'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Mic Test Server running')
})

app.post('/tests', (req, res) => {
  console.log('Received test:', req.body)
  res.status(200).json({ success: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
