---
name: Warm Gourmet Dining
colors:
  surface: '#fff8f5'
  surface-dim: '#e3d8d3'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf1ec'
  surface-container: '#f7ece6'
  surface-container-high: '#f1e6e1'
  surface-container-highest: '#ebe0db'
  on-surface: '#201b18'
  on-surface-variant: '#57423d'
  inverse-surface: '#352f2c'
  inverse-on-surface: '#faeee9'
  outline: '#8a716c'
  outline-variant: '#dec0b9'
  surface-tint: '#a33d23'
  primary: '#a33d23'
  on-primary: '#ffffff'
  primary-container: '#e76f51'
  on-primary-container: '#590f00'
  inverse-primary: '#ffb4a2'
  secondary: '#8e4e14'
  on-secondary: '#ffffff'
  secondary-container: '#ffab69'
  on-secondary-container: '#783d01'
  tertiary: '#006a60'
  on-tertiary: '#ffffff'
  tertiary-container: '#33a395'
  on-tertiary-container: '#00322c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a2'
  on-primary-fixed: '#3c0700'
  on-primary-fixed-variant: '#83260e'
  secondary-fixed: '#ffdcc4'
  secondary-fixed-dim: '#ffb780'
  on-secondary-fixed: '#2f1400'
  on-secondary-fixed-variant: '#6f3800'
  tertiary-fixed: '#8cf5e4'
  tertiary-fixed-dim: '#6fd8c8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#fff8f5'
  on-background: '#201b18'
  surface-variant: '#ebe0db'
  background-sand: '#FBF9F6'
  surface-white: '#FFFFFF'
  border-subtle: '#E8E3DD'
  text-muted: '#6B6661'
  warning-amber: '#E9C46A'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# AI Dining Plan — UI/UX Design System & Specification (design.md)

> **프로젝트 슬로건**: *"맛집을 찾아주는 AI가 아니라, 지금 내 상황에 맞는 '오늘의 식사 계획'을 만들어주는 AI"*  
> **기반 사양서**: `AI Dining Plan 프로젝트 개발명세서.md` (MVP: 1일 8시간 Vibe Coding, Kakao API + OpenAI GPT + React/Tailwind)

## 1. Executive Summary & Design Principles
- **Effortless Decision & Thoughtful Journey**: 단편적 맛집 나열이 아닌 식사(저녁) -> 카페로 이어지는 시간순 수직 여정(Dining Plan)을 제공.
- **Low-Stimulus & Warm Gourmet Aesthetics**: 따뜻한 오프화이트 샌드(#FBF9F6) 배경, 딥 에스프레소 차콜(#1F1A17), 테라코타 오렌지(#E76F51)와 웜 앰버(#F4A261) 액센트로 편안하고 미식의 온기를 담은 감성 전달.
- **Interactive Cohesiveness & Radical Honesty**: 카카오맵과 좌측 플랜 카드 간의 양방향 인터랙션 동기화, 그리고 검증된 정보와 미확인 정보의 투명한 시각 뱃지 분리.

## 2. Color Palette
- Primary Accent (Terracotta): #E76F51 (식사 코스 마커, 메인 CTA 버튼)
- Secondary Accent (Warm Amber): #F4A261 (카페 코스 마커, 강조 뱃지)
- Background (Warm Sand): #FBF9F6 (눈이 편안한 저자극 미색 배경)
- Surface Card (Soft White): #FFFFFF (보더 #E8E3DD)
- Text Dark (Espresso Charcoal): #1F1A17
- Text Muted (Warm Slate): #6B6661
- Verified Accent (Fact Green): #2A9D8F
- Warning Accent (Unconfirmed Amber): #E9C46A

## 3. Typography
- Font Family: Pretendard, system-ui, sans-serif
- Scales: Hero (28-32px Bold), Section Title (20-24px SemiBold), Card Title (17-18px SemiBold), Reason Callout (15px Medium), Body/Meta (14px Regular), Badge (12px SemiBold)

## 4. Layout Architecture
- Desktop: Split View (좌측 480px~520px 스크롤 패널: 검색/칩/타임라인/추천근거 + 우측 Flex 1 카카오맵 인터랙티브 지도 뷰)
- Mobile: Vertical Flow (검색 -> 프로그레시브 AI 분석 -> 타임라인 코스 카드 -> 인터랙티브 맵)
