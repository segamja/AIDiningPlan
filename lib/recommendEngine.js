export const CHEONGNA_CENTER = { lat: 37.53249042934526, lng: 126.63427992472252 }
export const DEFAULT_LOCATION = { ...CHEONGNA_CENTER, label: '청라호수공원' }

const DEMO_PLACES = {
  restaurant: [
    { placeId: 'demo-restaurant-1', place: '청라 비스트로 무드', tag: '한식', distance: '650m', rating: 4.85, lat: 37.5334, lng: 126.6362, address: '인천 서구 청라동', phone: '' },
    { placeId: 'demo-restaurant-2', place: '청라 야간 바 테라스', tag: '퓨전 한식', distance: '720m', rating: 4.78, lat: 37.5310, lng: 126.6300, address: '인천 서구 청라동', phone: '' }
  ],
  cafe: [
    { placeId: 'demo-cafe-1', place: '카페 엠비엔트', tag: '브런치카페', distance: '280m', rating: 4.91, lat: 37.5342, lng: 126.6318, address: '인천 서구 청라동', phone: '' },
    { placeId: 'demo-cafe-2', place: '청라 다크브루', tag: '카페', distance: '410m', rating: 4.70, lat: 37.5300, lng: 126.6355, address: '인천 서구 청라동', phone: '' }
  ]
}

export const defaultPlan = {
  title: '청라 로맨틱 디너 & 캔들라이트 카페 데이트',
  score: 94,
  totalTime: '약 2.5시간',
  walk: '도보 4분',
  location: DEFAULT_LOCATION,
  stages: [
    { name: '식당', time: '18:30 - 21:00', reason: '분위기와 접근성을 함께 만족하는 기본 추천 코스입니다.', ...DEMO_PLACES.restaurant[0] },
    { name: '카페', time: '21:00 - 22:00', reason: '식사 후 걸어서 이동하기 좋은 거리의 카페입니다.', ...DEMO_PLACES.cafe[0] }
  ],
  restaurantCandidates: DEMO_PLACES.restaurant,
  cafeCandidates: DEMO_PLACES.cafe
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
    location: DEFAULT_LOCATION,
    stages: [
      {
        name: '식당',
        time: '18:30 - 21:00',
        reason: intent.includes('술') ? '술과 함께하기 좋은 야간 테라스 좌석을 우선했습니다.' : '무난한 분위기와 가까운 거리로 첫 코스에 적합합니다.',
        ...restaurant,
        tag: intent.includes('카페') ? '퓨전 한식' : restaurant.tag
      },
      {
        name: '카페',
        time: '21:00 - 22:00',
        reason: conditions.includes('조용한 곳') ? '조용한 곳을 원하셔서 대화하기 편한 카페로 골랐습니다.' : '식사 장소에서 도보로 이동하기 좋은 카페입니다.',
        ...cafe
      }
    ],
    restaurantCandidates: DEMO_PLACES.restaurant,
    cafeCandidates: DEMO_PLACES.cafe
  }
}

async function extractLocationName(prompt) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !prompt) return null

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: '사용자 문장에서 식사/약속 장소로 언급된 한국 지명(동, 역, 지역구, 랜드마크 등) 하나만 추출하세요. 언급이 없으면 null을 반환하세요. JSON schema: { "location": string | null }'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) return null

    const result = await response.json()
    const raw = result?.choices?.[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return typeof parsed.location === 'string' && parsed.location.trim() ? parsed.location.trim() : null
  } catch {
    return null
  }
}

async function geocodeLocation(name) {
  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!kakaoKey || !name) return null

  try {
    const params = new URLSearchParams({ query: name, size: '1' })
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
      headers: { Authorization: `KakaoAK ${kakaoKey}` }
    })

    if (!response.ok) return null

    const data = await response.json()
    const doc = data.documents?.[0]
    if (!doc) return null

    return { lat: Number(doc.y), lng: Number(doc.x), label: name }
  } catch {
    return null
  }
}

async function reverseGeocodeLabel(lat, lng) {
  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!kakaoKey) return null

  try {
    const params = new URLSearchParams({ x: String(lng), y: String(lat) })
    const response = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?${params}`, {
      headers: { Authorization: `KakaoAK ${kakaoKey}` }
    })

    if (!response.ok) return null

    const data = await response.json()
    const region = data.documents?.find((doc) => doc.region_type === 'H') || data.documents?.[0]
    return region?.region_3depth_name || region?.region_2depth_name || null
  } catch {
    return null
  }
}

export async function resolveLocation(prompt, clientLocation) {
  const name = await extractLocationName(prompt)
  if (name) {
    const geocoded = await geocodeLocation(name)
    if (geocoded) return geocoded
  }

  if (clientLocation && Number.isFinite(clientLocation.lat) && Number.isFinite(clientLocation.lng)) {
    const label = await reverseGeocodeLabel(clientLocation.lat, clientLocation.lng)
    return { lat: clientLocation.lat, lng: clientLocation.lng, label: label || '현재 위치' }
  }

  return DEFAULT_LOCATION
}

async function searchKakaoPlaces(query, categoryGroupCode, center) {
  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!kakaoKey) return []

  const params = new URLSearchParams({
    query,
    category_group_code: categoryGroupCode,
    radius: '2000',
    sort: 'distance',
    x: String(center.lng),
    y: String(center.lat)
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
    placeUrl: doc.place_url,
    address: doc.road_address_name || doc.address_name || '',
    phone: doc.phone || ''
  }
}

export async function fetchKakaoPlaces(center = DEFAULT_LOCATION) {
  const [restaurants, cafes] = await Promise.all([
    searchKakaoPlaces(`${center.label} 맛집`, 'FD6', center),
    searchKakaoPlaces(`${center.label} 카페`, 'CE7', center)
  ])

  return {
    restaurant: restaurants.map(normalizePlace),
    cafe: cafes.map(normalizePlace)
  }
}

function enrichStage(stage, candidates, center) {
  const all = [...candidates.restaurant, ...candidates.cafe]

  const match =
    all.find((candidate) => candidate.placeId === stage.placeId) ||
    all.find((candidate) => stage.place && candidate.place && stage.place.includes(candidate.place))

  return {
    name: stage.name,
    time: stage.time,
    place: stage.place || match?.place || (stage.name === '카페' ? '추천 카페' : '추천 식당'),
    rating: Number(stage.rating) || 4.5,
    distance: match?.distance || stage.distance || '',
    tag: stage.tag || match?.tag || '',
    reason: stage.reason || '조건에 맞춰 후보 중 가장 적합한 곳을 선택했습니다.',
    lat: match?.lat ?? center.lat,
    lng: match?.lng ?? center.lng,
    placeUrl: match?.placeUrl,
    placeId: match?.placeId,
    address: match?.address || '',
    phone: match?.phone || ''
  }
}

export async function fetchOpenAIRecommendation(payload) {
  const apiKey = process.env.OPENAI_API_KEY
  const candidates = payload.placeCandidates || { restaurant: [], cafe: [] }
  const location = payload.location || DEFAULT_LOCATION

  if (!apiKey || (!candidates.restaurant.length && !candidates.cafe.length)) {
    return buildDemoPlan(payload)
  }

  const systemPrompt = `
    당신은 맛집 추천 도우미입니다.
    주의: 아래 candidates 목록에 있는 실제 장소만 사용하세요. 목록에 없는 장소를 지어내지 마세요.
    사용자 조건을 종합해 candidates.restaurant 중 식당 1곳, candidates.cafe 중 카페 1곳을 선택해 Dining Plan을 JSON으로 반환하세요.
    각 stage의 placeId는 candidates 목록에 있는 id 값을 그대로 사용해야 합니다.
    score는 0~100 사이의 정수(적합도 %)로 반환하세요.
    각 stage의 reason에는 왜 이 장소를 골랐는지 사용자 조건(분위기, 예산, 인원, 조건 등)과 연결해 한 문장으로 설명하세요. 존재하지 않는 평점/리뷰 수치를 지어내지 마세요.
    JSON schema: { title: string, score: number, totalTime: string, walk: string, stages: [{name: "식당"|"카페", rating: number, time: string, place: string, distance: string, tag: string, placeId: string, reason: string}, ...] }
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
          { role: 'user', content: JSON.stringify({ ...payload, placeCandidates: candidates, location }) }
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
      location,
      stages: stages.map((stage) => enrichStage(stage, candidates, location)),
      restaurantCandidates: candidates.restaurant,
      cafeCandidates: candidates.cafe
    }
  } catch {
    return buildDemoPlan(payload)
  }
}
