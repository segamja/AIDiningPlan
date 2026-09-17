import React from 'react'

type Chip = {
  label: string
  active?: boolean
}

const APP_VERSION = '1.0.0'
const VERSION_STORAGE_KEY = 'ai-dining-plan-version'

const initialPeople = ['혼자', '연인', '친구', '가족']
const initialIntent = ['식사', '카페', '술', '산책']
const initialConditions = ['가까운 곳', '가성비', '주차', '조용한 곳']
const initialBudgets = ['4만원 이내', '7만원 이내', '10만원 이상']

const defaultPlan = {
  title: '청라 로맨틱 디너 & 캔들라이트 카페 데이트',
  score: 94,
  totalTime: '약 2.5시간',
  walk: '도보 4분',
  stages: [
    { name: '식당', rating: 4.85, time: '18:30 - 21:00', place: '청라 비스트로 무드', distance: '650m', tag: '한식' },
    { name: '카페', rating: 4.91, time: '21:00 - 22:00', place: '카페 엠비엔트', distance: '280m', tag: '브런치카페' }
  ]
}

function App() {
  const [prompt, setPrompt] = React.useState('아내와 청라에서 데이트하려고 해. 저녁은 맛있는 걸 먹고 조용한 카페에서 이야기하고 싶어. 7만원 정도 생각하고 있어.')
  const [people, setPeople] = React.useState<string[]>(['연인'])
  const [intent, setIntent] = React.useState<string[]>(['식사'])
  const [conditions, setConditions] = React.useState<string[]>(['가까운 곳', '조용한 곳'])
  const [budget, setBudget] = React.useState<string>('7만원 이내')
  const [isLoading, setIsLoading] = React.useState(false)
  const [plan, setPlan] = React.useState(defaultPlan)
  const [currentVersion, setCurrentVersion] = React.useState(APP_VERSION)
  const [versionUpdateMessage, setVersionUpdateMessage] = React.useState('')

  React.useEffect(() => {
    const syncVersion = async () => {
      try {
        const response = await fetch('/api/version')
        if (!response.ok) {
          throw new Error('버전 정보를 확인할 수 없습니다.')
        }

        const data = await response.json()
        const serverVersion = data?.version || APP_VERSION
        const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY)

        setCurrentVersion(serverVersion)

        if (savedVersion && savedVersion !== serverVersion) {
          setVersionUpdateMessage(`업데이트 완료: v${savedVersion} → v${serverVersion}`)
          localStorage.setItem(VERSION_STORAGE_KEY, serverVersion)
          window.setTimeout(() => {
            window.location.reload()
          }, 1200)
          return
        }

        if (!savedVersion) {
          localStorage.setItem(VERSION_STORAGE_KEY, serverVersion)
        }
      } catch {
        const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY)
        if (savedVersion) {
          setCurrentVersion(savedVersion)
        }
      }
    }

    syncVersion()
  }, [])

  const toggleValue = (value: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value)
      }
      return [...current, value]
    })
  }

  const handleGenerate = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          people,
          intent,
          conditions,
          budget
        })
      })

      if (!response.ok) {
        throw new Error('추천 요청이 실패했습니다.')
      }

      const data = await response.json()
      if (!data?.title || !Array.isArray(data?.stages) || data.stages.length === 0) {
        throw new Error('추천 데이터가 올바르지 않습니다.')
      }

      setPlan(data)
    } catch (error) {
      const matchedBudget = budget || '7만원 이내'
      const matchedTitle = prompt.includes('데이트')
        ? '청라 로맨틱 디너 & 캔들라이트 카페 데이트'
        : '청라 힐링 저녁 + 가벼운 카페 타임'

      setPlan({
        title: matchedTitle,
        score: 94,
        totalTime: '약 2.5시간',
        walk: matchedBudget === '4만원 이내' ? '도보 6분' : '도보 4분',
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
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <span>청라호수공원</span>
        </div>
        <div className="topbar-icons">
          <span className="version-pill">v{currentVersion}</span>
          <button className="icon-button">🔔</button>
          <button className="icon-button user">👤</button>
        </div>
      </header>

      {versionUpdateMessage && (
        <div className="version-banner">
          {versionUpdateMessage}
        </div>
      )}

      <main className="main-layout">
        <aside className="sidebar">
          <div className="hero-box">
            <div className="label-row">
              <span className="mini-tag">AI Dining Plan</span>
              <span className="status-dot" />
            </div>
            <h1>오늘 어떤 시간을 보내고 싶나요?</h1>
            <textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />

            <button className="primary-btn" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'AI가 계획을 만들고 있어요...' : 'AI 식사 계획 만들기'}
            </button>
          </div>

          <div className="chip-group-block">
            <div className="chip-title-row">
              <span>누구와?</span>
            </div>
            <div className="chip-row">
              {initialPeople.map((label) => (
                <button
                  key={label}
                  className={`chip ${people.includes(label) ? 'selected' : ''}`}
                  onClick={() => toggleValue(label, people, setPeople)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="chip-group-block">
            <div className="chip-title-row">
              <span>무엇을 할까요?</span>
            </div>
            <div className="chip-row">
              {initialIntent.map((label) => (
                <button
                  key={label}
                  className={`chip ${intent.includes(label) ? 'selected' : ''}`}
                  onClick={() => toggleValue(label, intent, setIntent)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="chip-group-block">
            <div className="chip-title-row">
              <span>중요 조건</span>
            </div>
            <div className="chip-row">
              {initialConditions.map((label) => (
                <button
                  key={label}
                  className={`chip ${conditions.includes(label) ? 'selected' : ''}`}
                  onClick={() => toggleValue(label, conditions, setConditions)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="chip-group-block">
            <div className="chip-title-row">
              <span>예산</span>
            </div>
            <div className="chip-row">
              {initialBudgets.map((label) => (
                <button
                  key={label}
                  className={`chip ${budget === label ? 'selected' : ''}`}
                  onClick={() => setBudget(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="location-strip">
            <span>📍 현재 위치 사용</span>
            <button className="small-link">수정</button>
          </div>
        </aside>

        <section className="map-panel">
          <div className="map-toolbar">
            <div className="map-location"><span className="pin">◎</span> 청라호수공원</div>
            <div className="map-actions">
              <button className="toolbar-button">반경 2km</button>
              <button className="toolbar-button accent">AI 추천</button>
            </div>
          </div>

          <div className="map-surface">
            <div className="water-shape" />
            <div className="path-line path-one" />
            <div className="path-line path-two" />

            <div className="marker restaurant">
              <span className="marker-pin">1</span>
              <div className="marker-card">
                <strong>{plan.stages[0].place}</strong>
                <small>{plan.stages[0].tag} · {plan.stages[0].distance}</small>
              </div>
            </div>

            <div className="marker cafe">
              <span className="marker-pin">2</span>
              <div className="marker-card">
                <strong>{plan.stages[1].place}</strong>
                <small>{plan.stages[1].tag} · {plan.stages[1].distance}</small>
              </div>
            </div>
          </div>

          <div className="result-panel">
            <div className="result-header">
              <span className="eyebrow">오늘의 AI 조언</span>
              <span className="score-pill">{plan.score}%</span>
            </div>

            <h2>{plan.title}</h2>

            <div className="summary-row">
              <div>
                <span className="summary-label">총 소요</span>
                <strong>{plan.totalTime}</strong>
              </div>
              <div>
                <span className="summary-label">코스 이동</span>
                <strong>{plan.walk}</strong>
              </div>
              <div>
                <span className="summary-label">예상 적합도</span>
                <strong>{plan.score}%</strong>
              </div>
            </div>

            <div className="plan-list">
              {plan.stages.map((stage, index) => (
                <div className="plan-item" key={`${stage.name}-${index}`}>
                  <div className="plan-index">{index + 1}</div>
                  <div className="plan-main">
                    <div className="plan-topline">
                      <span className="plan-name">{stage.name}</span>
                      <span className="plan-time">{stage.time}</span>
                    </div>
                    <div className="plan-content">
                      <div>
                        <h3>{stage.place}</h3>
                        <p>{stage.tag} · {stage.distance}</p>
                      </div>
                      <div className="star">★ {stage.rating}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="detail-actions">
              <button className="ghost-btn">상세 보기</button>
              <button className="primary-btn small">카카오맵 열기</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
