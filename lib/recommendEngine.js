export const CHEONGNA_CENTER = { lat: 37.53249042934526, lng: 126.63427992472252 }

const DEMO_PLACES = {
  restaurant: [
    { placeId: 'demo-restaurant-1', place: '청라 비스트로 무드', tag: '한식', distance: '650m', rating: 4.85, lat: 37.5334, lng: 126.6362 },
    { placeId: 'demo-restaurant-2', place: '청라 야간 바 테라스', tag: '퓨전 한식', distance: '720m', rating: 4.78, lat: 37.5310, lng: 126.6300 }
  ],
  cafe: [
    { placeId: 'demo-cafe-1', place: '카페 엠비엔트', tag: '브런치카페', distance: '280m', rating: 4.91, lat: 37.5342, lng: 126.6318 },
    { placeId: 'demo-cafe-2', place: '청라 다크브루', tag: '카페', distance: '410m', rating: 4.70, lat: 37.5300, lng: 126.6355 }
  ]
}

export const defaultPlan = {
  title: '청라 로맨틱 디너 & 캔들라이트 카페 데이트',
  score: 94,
  totalTime: '약 2.5시간',
  walk: '도보 4분',
  stages: [
    { name: '식당', time: '18:30 - 21:00', ...DEMO_PLACES.restaurant[0] },
    { name: '카페', time: '21:00 - 22:00', ...DEMO_PLACES.cafe[0] }
  ]
}

export function buildDemoPlan(payload = {}) {
  const prompt = String(payload.prompt || '')
  const intent = Array.isArray(payload.intent) ? payload.intent : []
  const conditions = Array.isArray(payload.conditions) ? payload.conditions : []
  const budget = payload.budget || '7만원 이내'

  const title = prompt.includes('데이트')
    ? '청라 로맨틱 디너 & 캔들라이트 카페 데이트'
    : '청라 힐링 저녁 + 가벼운 카페 타임'

  const restaurant = intent.includes('술') ? DEMO_PLACES.restaurant[1] : DEMO_PLACES.restaurant[0]
  const cafe = conditions.includes('조용한 곳') ? DEMO_PLACES.cafe[0] : DEMO_PLACES.cafe[1]

  return {
    title,
    score: 94,
    totalTime: '약 2.5시간',
    walk: budget === '4만원 이내' ? '도보 6분' : '도보 4분',
    stages: [
      {
        name: '식당',
        time: '18:30 - 21:00',
        ...restaurant,
        tag: intent.includes('카페') ? '퓨전 한식' : restaurant.tag
      },
      {
        name: '카페',
        time: '21:00 - 22:00',
        ...cafe
      }
    ]
  }
}

async function searchKakaoPlaces(query, categoryGroupCode) {
  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!kakaoKey) return []

  const params = new URLSearchParams({
    query,
    category_group_code: categoryGroupCode,
    radius: '2000',
    sort: 'distance',
    x: String(CHEONGNA_CENTER.lng),
    y: String(CHEONGNA_CENTER.lat)
  })

  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
      headers: { Authorization: `KakaoAK ${kakaoKey}` }
    })

    if (!response.ok) return []

    const data = await response.json()
    return Array.isArray(data.documents) ? data.documents.slice(0, 5) : []
  } catch {
    return []
  }
}

function normalizePlace(doc) {
  return {
    placeId: doc.id,
    place: doc.place_name,
    tag: doc.category_name?.split(' > ').pop() || '',
    distance: doc.distance ? `${doc.distance}m` : '',
    lat: Number(doc.y),
    lng: Number(doc.x),
    placeUrl: doc.place_url
  }
}

export async function fetchKakaoPlaces() {
  const [restaurants, cafes] = await Promise.all([
    searchKakaoPlaces('청라 맛집', 'FD6'),
    searchKakaoPlaces('청라 카페', 'CE7')
  ])

  return {
    restaurant: restaurants.map(normalizePlace),
    cafe: cafes.map(normalizePlace)
  }
}

function enrichStage(stage, candidates) {
  const all = [...candidates.restaurant, ...candidates.cafe]
  const isCafe = stage.name === '카페'
  const fallback = isCafe ? DEMO_PLACES.cafe[0] : DEMO_PLACES.restaurant[0]

  const match =
    all.find((candidate) => candidate.placeId === stage.placeId) ||
    all.find((candidate) => stage.place && candidate.place && stage.place.includes(candidate.place))

  return {
    name: stage.name || fallback.name,
    time: stage.time || fallback.time,
    place: stage.place || match?.place || fallback.place,
    rating: Number(stage.rating) || fallback.rating,
    distance: match?.distance || stage.distance || fallback.distance,
    tag: stage.tag || match?.tag || fallback.tag,
    lat: match?.lat ?? fallback.lat,
    lng: match?.lng ?? fallback.lng,
    placeUrl: match?.placeUrl
  }
}

export async function fetchOpenAIRecommendation(payload) {
  const apiKey = process.env.OPENAI_API_KEY
  const candidates = payload.placeCandidates || { restaurant: [], cafe: [] }

  if (!apiKey || (!candidates.restaurant.length && !candidates.cafe.length)) {
    return buildDemoPlan(payload)
  }

  const systemPrompt = `
    당신은 맛집 추천 도우미입니다.
    주의: 아래 candidates 목록에 있는 실제 장소만 사용하세요. 목록에 없는 장소를 지어내지 마세요.
    사용자 조건을 종합해 candidates.restaurant 중 식당 1곳, candidates.cafe 중 카페 1곳을 선택해 Dining Plan을 JSON으로 반환하세요.
    각 stage의 placeId는 candidates 목록에 있는 id 값을 그대로 사용해야 합니다.
    JSON schema: { title: string, score: number, totalTime: string, walk: string, stages: [{name: "식당"|"카페", rating: number, time: string, place: string, distance: string, tag: string, placeId: string}, ...] }
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
          { role: 'user', content: JSON.stringify({ ...payload, placeCandidates: candidates }) }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) return buildDemoPlan(payload)

    const result = await response.json()
    const raw = result?.choices?.[0]?.message?.content
    if (!raw) return buildDemoPlan(payload)

    const parsed = JSON.parse(raw)
    const stages = Array.isArray(parsed.stages) && parsed.stages.length ? parsed.stages : defaultPlan.stages

    return {
      title: parsed.title || defaultPlan.title,
      score: Number(parsed.score) || 94,
      totalTime: parsed.totalTime || '약 2.5시간',
      walk: parsed.walk || '도보 4분',
      stages: stages.map((stage) => enrichStage(stage, candidates))
    }
  } catch {
    return buildDemoPlan(payload)
  }
}
