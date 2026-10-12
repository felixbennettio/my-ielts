<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
const props = defineProps<{ topics: string[]; modelValue: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const currentIndex = computed(() => props.topics.indexOf(props.modelValue))
const draft = ref(String(currentIndex.value + 1))
const numberInput = ref<HTMLInputElement | null>(null)
const error = ref('')
watch(() => props.modelValue, () => {
  draft.value = String(currentIndex.value + 1)
  error.value = ''
})
function selectTopic(event: Event) {
  const select = event.target as HTMLSelectElement
  emit('update:modelValue', select.value)
  select.blur()
}
function move(offset: number) {
  const topic = props.topics[currentIndex.value + offset]
  if (topic) emit('update:modelValue', topic)
}
async function jump() {
  const value = draft.value.trim()
  const number = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < 1 || number > props.topics.length) {
    error.value = `请输入 1–${props.topics.length} 的话题编号。`
    return
  }
  error.value = ''
  draft.value = String(number)
  emit('update:modelValue', props.topics[number - 1])
  await nextTick()
  numberInput.value?.blur()
}
function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  const target = event.target instanceof HTMLElement ? event.target : document.activeElement
  if (target instanceof HTMLElement) {
    if (target.closest('textarea, select, [contenteditable]:not([contenteditable="false"]), .fixed-audio-player, [role="textbox"], [role="slider"]')) return
    const input = target.closest('input')
    if (input && !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(input.type)) return
  }
  event.preventDefault()
  move(event.key === 'ArrowLeft' ? -1 : 1)
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="topic-navigator" aria-label="话题选择与跳转">
    <div class="topic-nav-controls">
      <button type="button" class="topic-nav-arrow" aria-label="上一话题" title="上一话题（←）" :disabled="currentIndex <= 0" @click="move(-1)">←</button>
      <select :value="modelValue" aria-label="选择话题" @change="selectTopic">
        <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
      </select>
      <button type="button" class="topic-nav-arrow" aria-label="下一话题" title="下一话题（→）" :disabled="currentIndex >= topics.length - 1" @click="move(1)">→</button>
      <form class="topic-nav-jump" @submit.prevent="jump">
        <input ref="numberInput" v-model="draft" type="text" inputmode="numeric" autocomplete="off" aria-label="话题编号" :aria-invalid="!!error" :placeholder="`1–${topics.length}`">
        <span>/ {{ topics.length }}</span>
        <button type="submit">跳转</button>
      </form>
    </div>
    <p v-if="error" class="topic-nav-error" role="alert">{{ error }}</p>
    <p v-else class="topic-nav-hint">输入编号按回车跳转 · ← / → 切换话题</p>
  </div>
</template>
