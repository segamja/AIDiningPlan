# AI Dining Plan — UI/UX Design System & Specification (design.md)

> **프로젝트 슬로건**: *"맛집을 찾아주는 AI가 아니라, 지금 내 상황에 맞는 '오늘의 식사 계획'을 만들어주는 AI"*  
> **기반 사양서**: `AI Dining Plan 프로젝트 개발명세서.md` (MVP: 1일 8시간 Vibe Coding, Kakao API + OpenAI GPT + React/Tailwind)

---

## 1. Executive Summary & Design Principles

### 1.1 디자인 핵심 철학: "Effortless Decision & Thoughtful Journey"
기존 맛집 서비스는 사용자에게 수십 개의 선택지를 던져주고 '직접 고르는 피로(Choice Overload)'를 안겨주었습니다. 반면 **AI Dining Plan**은 사용자의 **현재 상황(누구와, 언제, 어디서, 얼마로, 어떤 분위기를 원하는지)**을 자연어 또는 빠른 Chip 터치로 파악한 뒤, 실시간 Kakao Local 정보와 LLM의 정밀 추론을 통해 **[식사 🍽️ ➔ 이동 🚶‍♂️ ➔ 카페 ☕]**로 이어지는 완결된 **단 하나의 최적 Plan**을 감성적이고 신뢰도 높은 인터페이스로 제공합니다.

### 1.2 핵심 원칙 (Core Principles)
1. **AI-Native & Conversational Flow**: 챗봇 창을 따로 띄우지 않고 메인 화면 자체가 하나의 직관적인 대화형 인풋 & 즉각적인 피드백 구조를 형성합니다.
2. **Low-Stimulus & High-Warmth (차분함과 미식의 온기)**: 배달앱의 현란한 할인 배너나 지도 앱의 복잡한 툴바를 걷어내고, 따뜻한 웜 샌드/아이보리 배경과 딥 에스프레소 타이포, 테라코타 오렌지 포인트로 식사의 설렘을 줍니다.
3. **Bento & Timeline Architecture**: 결과 화면은 수직 타임라인(Journey)과 핵심 정보를 압축한 벤토 그리드(거리, 예산, 코스간 소요시간, AI 추천 근거)로 구성되어 3초 안에 계획 전체가 읽힙니다.
4. **Interactive Cohesiveness (Map ↔ Card 양방향 동기화)**: 카카오맵 마커와 장소 카드가 호버/탭에 따라 유기적으로 반응하여 직관적인 공간 인식을 보장합니다.
5. **Radical Honesty (환각 없는 신뢰 UI)**: API 및 웹 검색으로 검증된 정보와 확인되지 않은 부가정보(예: 주차 여부 미확인)를 명확한 시각 뱃지로 구분합니다.

---

## 2. Color Palette & Theming

미식(Gourmet)과 휴식(Cafe)의 온기를 품은 **Warm Terracotta & Espresso Neutral** 팔레트를 채택합니다.

```
Primary Accent (Terracotta)      #E76F51  (식사/행동 유도/메인 마커)
Secondary Accent (Warm Amber)    #F4A261  (카페 마커/단계 연결/강조 뱃지)
Deep Charcoal / Espresso         #1F1A17  (헤드라인, 본문 폰트, 고급스러운 무게감)
Warm Neutral (Background)        #FBF9F6  (눈의 피로를 덜어주는 부드러운 오프화이트 샌드)
Surface Card (Pure Soft White)   #FFFFFF  (카드 표면, 1px 보더 #EFECE6)
Muted Slate Text                 #6B6661  (서브 텍스트, 메타데이터)
Border / Divider                 #E8E3DD  (극저자극 테두리선)
Success / Verified Green         #2A9D8F  (확인된 팩트 뱃지)
Warning / Unconfirmed Amber      #E9C46A  (미확인 정보 안내 뱃지)
```

### Tailwind CSS Token Configuration 예시
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#E76F51',
          secondary: '#F4A261',
          dark: '#1F1A17',
          surface: '#FFFFFF',
          bg: '#FBF9F6',
          border: '#E8E3DD',
          muted: '#6B6661',
          verified: '#2A9D8F',
        }
      },
      borderRadius: {
        'bento': '1.25rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(31, 26, 23, 0.05)',
        'float': '0 12px 32px -4px rgba(31, 26, 23, 0.12)',
      }
    }
  }
}
```

---

## 3. Typography Hierarchy

한국어 사용자 경험에 최적화된 **Pretendard** (또는 Inter + Noto Sans KR fallback) 기반의 유려한 스케일입니다.

| 역할 | 크기/굵기 | Line-Height | 용도 |
| :--- | :--- | :--- | :--- |
| **Hero Title** | 28px ~ 32px (Bold 700) | 135% | "오늘 뭐 먹을지, AI가 계획해드릴게요" |
| **Section Title** | 20px ~ 24px (SemiBold 600) | 140% | "오늘의 Dining Plan", "식사 코스" |
| **Card Heading** | 17px ~ 18px (SemiBold 600) | 140% | 장소명 (예: 청라 어부네 화덕구이) |
| **AI Reason Callout** | 15px (Medium 500) | 160% | "데이트하기 좋은 조용한 분위기와 예산을..." |
| **Body & Meta** | 14px (Regular 400 & Medium 500)| 150% | 카테고리, 이동거리, 도보 시간 |
| **Badge / Caption** | 12px (SemiBold 600) | 130% | 팩트 체크 뱃지, 단계 번호(01, 02) |

---

## 4. Layout Architecture & Screen Flow

### 4.1 반응형 레이아웃 전략
- **Desktop (≥ 1024px)**: 
  - **좌측 패널 (480px ~ 520px 고정/스크롤)**: 헤더 + 검색 인풋/칩 + AI Dining Plan 타임라인 카드 + 추천 근거 Bento 카드
  - **우측 뷰 (Flex 1 Full Height)**: Kakao Map 인터랙티브 지도 (현재위치, 코스 1번/2번 마커 및 도보 점선 경로, 실시간 줌/패닝)
- **Mobile (< 1024px)**:
  - 단일 뷰포트 내 수직 스크롤 + 맵 탭 전환 또는 상단 지도(높이 280px 고정/인터랙티브 핀) + 하단 드래그블/스크롤 플랜 카드 시트 구조.

---

## 5. Detailed Component Specifications

### 5.1 [화면 1] Home & Unified Conversational Input (자연어 + 퀵 칩)
- **Hero Header**: 
  - 브랜드 심볼 (미식 포크 & 따뜻한 스파크/별)
  - 헤드카피: *"오늘 뭐 먹을지, AI가 계획해드릴게요."*
  - 서브카피: *"지금 누구와 어디서 어떤 분위기를 즐기고 싶은지 편하게 말씀해주세요."*
- **Conversational Search Box**:
  - `textarea` 형태의 넓은 입력창 (3줄 확장 가능)
  - 플레이스홀더: *"예: 아내와 청라에서 데이트하려고 해. 저녁은 조용하게 먹고 감성 카페에서 대화하고 싶어. 예산은 7만원 안팎."*
  - 우측 하단: [📍 내 위치 사용] 토글 뱃지 + [식사 계획 만들기 ✨] 주황색 플로팅 버튼
- **Quick Attribute Chips (자연어 보조 및 빠른 선택)**:
  - **누구와**: [혼자] [연인 💕] [친구 👥] [가족 👨‍👩‍👧]
  - **원하는 코스**: [식사 + 카페 ☕] [식사만 🍽️] [가벼운 술 한잔 🍷]
  - **중요 조건**: [조용한 곳 🤫] [분위기 좋은 ✨] [가성비 💸] [주차 편리 🚗] [역세권/도보 🚶]
  - **예산대**: [2만원대] [5만원대] [7만원대] [10만원+]
  - *인터랙션*: 칩을 클릭하면 AI 입력창에 자연스럽게 조건 문구가 동기화되거나, 하단 구조화 메타데이터로 즉시 반영.

### 5.2 [화면 2] Progressive AI Feedback (추천 생성 중 상태)
단순한 회전 스피너를 지양하고, 사용자의 신뢰와 지루함을 덜어주는 **Step-by-Step 진행 애니메이션**:
1. `✓` 사용자 요청 및 분위기 분석 완료 *(데이트 / 2명 / 청라 / 7만원대)*
2. `✓` Kakao Local API로 반경 2km 맛집 탐색 중...
3. `✓` GPT가 분위기와 리뷰 키워드 매칭 분석 중...
4. `●` 식사 후 도보 5분 거리 내 감성 카페 매칭 중...
5. `○` 오늘의 Dining Plan 지도 시각화 준비

### 5.3 [화면 3] AI Dining Plan 결과 & 타임라인 카드 (The Core Screen)
- **Plan Summary Header**:
  - *"청라 로맨틱 디너 & 캔들라이트 카페 데이트"*
  - Bento 메트릭: `총 예상 소요: 약 2.5시간` | `코스 간 이동: 도보 4분(280m)` | `예산 적합도: 95%`
- **Timeline Step 01 (🍽️ DINNER)**:
  - 라벨: `01 저녁 식사 · 18:30`
  - 장소명: `청라 비스트로 무드 (이탈리안)`
  - 거리/위치: `현재 위치에서 650m · 인천 서구 청라커낼로`
  - AI 맞춤 추천 이유 (말풍선 테두리):
    *"조용하게 대화를 나눌 수 있는 좌석 간격과 7만원 예산 내에서 2인 파스타&스테이크 코스를 즐기기 최적화된 곳입니다."*
  - 액션: [카카오맵 길찾기 ↗] [지도에서 위치 보기 📍]
- **Connector (이동 구간)**:
  - 수직 점선과 아이콘: `🚶‍♂️ 도보 4분 (280m) - 호수공원 산책로 연결`
- **Timeline Step 02 (☕ CAFE)**:
  - 라벨: `02 조용한 대화 · 20:00`
  - 장소명: `카페 엠비언트 (디저트/로스터리)`
  - 거리/위치: `식당에서 280m · 도보 4분`
  - AI 맞춤 추천 이유:
    *"식사 후 붐비지 않고 아늑한 조명 아래서 긴 대화를 이어가기 좋은 핸드드립 전문 카페입니다."*
  - 보조 액션 버튼: **[☕ 다른 카페로 변경하기 ↻]** *(클릭 시 식당은 유지한 채 주변 2순위 카페로 원터치 교체)*

### 5.4 [화면 4] AI 추천 팩트 검증 (Radical Honesty Card)
AI 환각을 차단하고 8시간 MVP에서 신뢰를 극대화하는 정직한 정보 분리 영역:
- **확인된 정보 (Verified ✓)**: Kakao API 거리(650m), 정식 업종(양식), 도로명 주소, 운영 상태
- **미확인/주의 정보 (Caution ⚠️)**: *"해당 매장의 실시간 주차 가능 대수 및 당일 예약석 잔여 여부는 API 상에서 확인되지 않았습니다. 방문 전 전화 확인을 권장합니다."*

### 5.5 [화면 5] Kakao Map 인터랙티브 뷰
- **커스텀 마커**:
  - 현재 위치: 블루 펄스 닷 (내 위치)
  - 1차 식당: `#E76F51` 테라코타 컬러 핀 + `① 🍽️` 배지
  - 2차 카페: `#F4A261` 웜 앰버 컬러 핀 + `② ☕` 배지
- **상호 인터랙션**:
  - 리스트에서 식당 카드 호버/클릭 시 -> 지도 마커가 1.2배 바운스 줌되며 미니 인포윈도우 오픈
  - 지도에서 마커 클릭 시 -> 좌측 타임라인의 해당 카드가 은은한 테라코타 링(#E76F51/20)으로 스크롤 & 포커스

---

## 6. Micro-Interactions & State Transitions

1. **인풋 포커스**: 인풋 테두리가 `#E76F51` 2px 부드러운 트랜지션과 함께 앰비언트 글로우 형성.
2. **칩 토글**: 누를 때 톡 튀는 `scale(0.96) -> scale(1.0)` 스프링 애니메이션 및 채워진 오렌지 배경 전환.
3. **분석 단계 전환**: 체크마크 아이콘이 순차적으로 fade-in 및 slide-up 되며 사용자에게 끊김 없는 진행 상황 전달.
4. **카페 교체(Swap)**: '다른 카페 추천' 클릭 시 카페 카드만 살짝 블러/페이드아웃 후 새 후보가 부드럽게 슬라이드인.

---

## 7. 8시간 Vibe Coding 구현 가이드 (React + Tailwind + Kakao + OpenAI)

- **컴포넌트 분리**:
  - `Header.tsx`: 타이틀, 서비스 정체성
  - `SearchSection.tsx`: 자연어 textarea + 카테고리 칩 + 위치 권한 버튼
  - `LoadingProgress.tsx`: 4단계 실시간 체크리스트
  - `DiningPlanTimeline.tsx`: Step 01 식당, Step 02 카페, 도보 이동 커넥터
  - `PlaceCard.tsx`: 이미지/폴백 썸네일, AI 추천평, 메타 뱃지, 카카오맵 외부 링크
  - `FactCheckBadge.tsx`: 확인된 정보 / 미확인 정보 뱃지
  - `KakaoMapView.tsx`: Kakao Maps JavaScript SDK 마커 렌더링 및 클릭 이벤트 바인딩
- **Fallback 안전장치**: Kakao Local API 응답에 장소 사진이 없더라도 우아한 미식 카테고리 일러스트/아이콘 플레이스홀더를 제공하여 UI가 깨지지 않도록 방어.
