import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { buildDemoPlan, fetchKakaoPlaces, fetchOpenAIRecommendation } from '../lib/recommendEngine.js'

dotenv.config()

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())

app.get('/api/version', (_req, res) => {
  res.json({
    version: pkg.version,
    name: pkg.name
  })
})

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    mode: process.env.OPENAI_API_KEY && process.env.KAKAO_REST_API_KEY ? 'live' : 'demo',
    version: pkg.version
  })
})

app.post('/api/recommend', async (req, res) => {
  try {
    const payload = req.body || {}
    const places = await fetchKakaoPlaces()

    const result = await fetchOpenAIRecommendation({
      ...payload,
      placeCandidates: places
    })

    res.json(result)
  } catch (error) {
    res.json(buildDemoPlan(req.body || {}))
  }
})

app.listen(port, () => {
  console.log(`AI Dining Plan server running on http://localhost:${port}`)
})
