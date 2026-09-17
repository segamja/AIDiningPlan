import { buildDemoPlan, fetchKakaoPlaces, fetchOpenAIRecommendation } from '../lib/recommendEngine.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const places = await fetchKakaoPlaces()
    const result = await fetchOpenAIRecommendation({ ...payload, placeCandidates: places })
    return res.status(200).json(result)
  } catch {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    return res.status(200).json(buildDemoPlan(payload))
  }
}
