<script setup lang="ts">
import { useAudioPlayer } from '../composables/audioPlayer'
const player = useAudioPlayer()
const { current, playing, error } = player
const media = ref<HTMLAudioElement | null>(null)
const bar = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined
function updateSpace() {
  const visible = !!current.value
  document.documentElement.classList.toggle('audio-player-active', visible)
  document.documentElement.style.setProperty('--audio-player-height', `${visible ? bar.value?.offsetHeight || 132 : 0}px`)
}
onMounted(() => {
  if (media.value) player.connect(media.value)
  if (typeof ResizeObserver !== 'undefined' && bar.value) {
    observer = new ResizeObserver(updateSpace)
    observer.observe(bar.value)
  }
  updateSpace()
})
watch(current, async () => { await nextTick(); updateSpace() })
onUnmounted(() => {
  observer?.disconnect()
  player.disconnect()
  document.documentElement.classList.remove('audio-player-active')
  document.documentElement.style.removeProperty('--audio-player-height')
})
</script>

<template>
  <aside v-show="current" ref="bar" class="fixed-audio-player" aria-label="固定音频播放器">
    <div class="fixed-audio-inner">
      <div class="fixed-audio-description">
        <span>正在收听</span>
        <strong :title="current?.title">{{ current?.title }}</strong>
      </div>
      <audio ref="media" controls preload="none" :aria-label="`${current?.title || '音频'}播放控制`" />
      <button type="button" class="fixed-audio-toggle" :aria-label="playing ? '暂停音频' : '继续播放音频'" @click="player.toggle()">{{ playing ? '暂停' : '播放' }}</button>
      <button type="button" class="fixed-audio-close" aria-label="关闭播放器并停止音频" title="关闭播放器并停止音频" @click="player.close()">×</button>
      <p v-if="error" class="fixed-audio-error" role="status">{{ error }}</p>
    </div>
  </aside>
</template>
