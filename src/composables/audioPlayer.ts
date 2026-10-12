import { ref } from 'vue'

export interface AudioSelection { src: string; title: string }

export function createAudioPlayer() {
  const current = ref<AudioSelection | null>(null)
  const playing = ref(false)
  const error = ref('')
  let media: HTMLAudioElement | null = null
  let request = 0
  let removeListeners = () => {}

  async function resume() {
    if (!media || !current.value) return
    const activeRequest = request
    error.value = ''
    if (media.error) media.load()
    try {
      await media.play()
    }
    catch (reason) {
      if (activeRequest !== request || (reason as DOMException)?.name === 'AbortError') return
      playing.value = false
      error.value = (reason as DOMException)?.name === 'NotAllowedError'
        ? '点击播放按钮即可开始播放。'
        : '音频暂时无法播放，请重试或选择其他内容。'
    }
  }

  function play(src: string, title: string) {
    request++
    media?.pause()
    playing.value = false
    error.value = ''
    current.value = { src, title }
    if (media) {
      media.src = src
      media.load()
      void resume()
    }
  }

  function pause() {
    request++
    media?.pause()
    playing.value = false
  }

  function toggle() {
    if (!media || !current.value) return
    if (media.paused) void resume()
    else pause()
  }

  function seekBy(seconds: number) {
    if (!media || !Number.isFinite(media.duration)) return
    media.currentTime = Math.min(media.duration, Math.max(0, media.currentTime + seconds))
  }

  function close() {
    pause()
    current.value = null
    error.value = ''
    if (media) {
      media.removeAttribute('src')
      media.load()
    }
  }

  function connect(element: HTMLAudioElement) {
    removeListeners()
    if (media && media !== element) media.pause()
    media = element
    const onPlay = () => { playing.value = true; error.value = '' }
    const onPause = () => { playing.value = false }
    const onError = () => {
      if (!current.value) return
      playing.value = false
      error.value = '音频暂时无法播放，请重试或选择其他内容。'
    }
    element.addEventListener('play', onPlay)
    element.addEventListener('pause', onPause)
    element.addEventListener('ended', onPause)
    element.addEventListener('error', onError)
    removeListeners = () => {
      element.removeEventListener('play', onPlay)
      element.removeEventListener('pause', onPause)
      element.removeEventListener('ended', onPause)
      element.removeEventListener('error', onError)
    }
    // A page can request audio while the app's persistent controls are mounting.
    if (current.value) {
      element.src = current.value.src
      element.load()
      void resume()
    }
  }

  function disconnect() {
    close()
    removeListeners()
    media = null
  }

  return { current, playing, error, play, pause, toggle, seekBy, close, connect, disconnect }
}

let singleton: ReturnType<typeof createAudioPlayer> | undefined
export function useAudioPlayer() {
  singleton ||= createAudioPlayer()
  return singleton
}
