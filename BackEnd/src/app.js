import express from 'express'

import { getRfr } from './services/DatabaseService.js'

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/rfr', (req, res) => {
  res.send(getRfr())
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
