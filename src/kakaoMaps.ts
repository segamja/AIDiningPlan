export const CHEONGNA_CENTER = { lat: 37.53249042934526, lng: 126.63427992472252 }

declare global {
  interface Window {
    kakao: any
  }
}

let loadPromise: Promise<any> | null = null

export function loadKakaoMaps(appKey: string): Promise<any> {
  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao)
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('카카오맵을 불러오지 못했습니다. 카카오 개발자 콘솔(Web 플랫폼 도메인)에 현재 접속 도메인이 등록되어 있는지 확인해주세요.'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
