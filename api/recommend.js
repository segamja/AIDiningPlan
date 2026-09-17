const defaultPlan = {
  title: '청라 로맨틱 디너 & 캔들라이트 카페 데이트',
  score: 94,
  totalTime: '약 2.5시간',
  walk: '도보 4분',
  stages: [
    {
      name: '식당',
      rating: 4.85,
      time: '18:30 - 21:00',
      place: '청라 비스트로 무드',
      distance: '650m',
      tag: '한식'
    },
    {
      name: '카페',
      rating: 4.91,
      time: '21:00 - 22:00',
      place: '카페 엠비엔트',
      distance: '280m',
      tag: '브런치카페'
    }
  ]
}

function buildDemoPlan(payload = {}) {
  const prompt = String(payload.prompt || '')
  const intent = Array.isArray(payload.intent) ? payload.intent : []
  const conditions = Array.isArray(payload.conditions) ? payload.conditions : []
  const budget = payload.budget || '7만원 이내'

  const title = prompt.includes('데이트')
    ? '청라 로맨틱 디너 & 캔들라이트 카페 데이트'
    : '청라 힐링 저녁 + 가벼운 카페 타임'

  return {
    title,
    score: 94,
    totalTime: '약 2.5시간',
    walk: budget === '4만원 이내' ? '도보 6분' : '도보 4분',
    stages: [
      {
        name: '식당',
        rating: 4.85,
        time: '18:30 - 21:00',
        place: intent.includes('술') ? '청라 야간 바 테라스' : '청라 비스트로 무드',
        distance: '650m',
        tag: intent.includes('카페') ? '퓨전 한식' : '한식'
      },
      {
        name: '카페',
        rating: 4.91,
        time: '21:00 - 22:00',
        place: conditions.includes('조용한 곳') ? '카페 엠비엔트' : '청라 다크브루',
        distance: '280m',
        tag: '브런치카페'
      }
    ]
  }
}

async function fetchKakaoPlaces() {
  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!kakaoKey) return []

  try {
    const response = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?query=청라%20맛집&category_group_code=FD6&radius=2000&sort=distance', {
      headers: {
        Authorization: `KakaoAK ${kakaoKey}`
      }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Array.isArray(data.documents) ? data.documents.slice(0, 5) : []
  } catch {
    return []
  }
}

async function fetchOpenAIRecommendation(payload) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return buildDemoPlan(payload)
  }

  const systemPrompt = `
    당신은 맛집 추천 도우미입니다.
    주의: 주어진 실제 데이터만 사용하세요.
    추정 정보는 생성하지 마세요.
    사용자 조건과 장소 정보를 종합해 식당 1곳과 카페 1곳을 포함한 Dining Plan을 JSON으로 반환하세요.
    JSON schema: { title: string, score: number, totalTime: string, walk: string, stages: [{name, rating, time, place, distance, tag}, ...] }
  `

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      return buildDemoPlan(payload)
    }

    const result = await response.json()
    const raw = result?.choices?.[0]?.message?.content
    if (!raw) return buildDemoPlan(payload)

    const parsed = JSON.parse(raw)
    return {
      title: parsed.title || defaultPlan.title,
      score: Number(parsed.score) || 94,
      totalTime: parsed.totalTime || '약 2.5시간',
      walk: parsed.walk || '도보 4분',
      stages: Array.isArray(parsed.stages) && parsed.stages.length ? parsed.stages : defaultPlan.stages
    }
  } catch {
    return buildDemoPlan(payload)
  }
}

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

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  const places = await fetchKakaoPlaces()
  const result = await fetchOpenAIRecommendation({ ...payload, placeCandidates: places })

  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(200).json(result)
}
