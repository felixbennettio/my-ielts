<script setup lang="ts">
import { useProgress } from '../composables/progress'
import type { LearningStatus, StatusFilter } from '../composables/progress'
const props = defineProps<{ ids: string[]; visibleIds: string[]; query: string; filter: StatusFilter }>()
const emit = defineEmits<{ (event: 'update:query', value: string): void; (event: 'update:filter', value: StatusFilter): void }>()
const progress = useProgress()
const stats = computed(() => progress.stats(props.ids))
const filters: { value: StatusFilter; label: string }[] = [{ value: 'all', label: '全部' }, { value: 'pending', label: '未掌握' }, { value: 'review', label: '待复习' }, { value: 'mastered', label: '已掌握' }]
const notice = ref('')
const undoEntries = ref<{ id: string; status: LearningStatus; appliedAt: number }[]>([])
function mark(status: 'mastered' | 'review') {
  const count = props.visibleIds.length
  const previous = props.visibleIds.map(id => ({ id, status: progress.getStatus(id), appliedAt: 0 }))
  progress.setStatus(props.visibleIds, status)
  undoEntries.value = previous.map(entry => ({ ...entry, appliedAt: progress.records.value[entry.id].updatedAt }))
  notice.value = `已将 ${count} 项标为${status === 'mastered' ? '已掌握' : '待复习'}。可切换筛选后逐项修改。`
}
function undoBatch() {
  const entries = undoEntries.value.filter(entry => progress.records.value[entry.id]?.updatedAt === entry.appliedAt)
  for (const status of ['new', 'review', 'mastered'] as LearningStatus[]) {
    const ids = entries.filter(entry => entry.status === status).map(entry => entry.id)
    if (ids.length) progress.setStatus(ids, status)
  }
  undoEntries.value = []
  notice.value = `已撤销 ${entries.length} 项批量标记；之后单独修改的词条保留当前状态。`
}
</script>

<template>
  <section class="learning-toolbar" aria-label="学习筛选与进度">
    <div class="learning-summary">
      <strong>已掌握 {{ stats.mastered }} / {{ stats.total }}</strong>
      <span>待复习 {{ stats.review }} · 剩余 {{ stats.pending }}</span>
      <RouterLink to="/progress">管理与备份进度 ↗</RouterLink>
    </div>
    <progress :value="stats.mastered" :max="stats.total || 1" :aria-label="`掌握进度 ${stats.percent}%`" />
    <div class="learning-controls">
      <input type="search" :value="query" aria-label="搜索单词、释义或同义词" placeholder="搜索单词、中文释义、同义词…" @input="emit('update:query', ($event.target as HTMLInputElement).value)">
      <div class="learning-filters" aria-label="学习状态筛选">
        <button v-for="option in filters" :key="option.value" type="button" :aria-pressed="filter === option.value" @click="emit('update:filter', option.value)">{{ option.label }}</button>
      </div>
    </div>
    <div class="learning-batch">
      <span>当前结果 {{ visibleIds.length }} 项</span>
      <button type="button" :disabled="!visibleIds.length" @click="mark('mastered')">将当前结果标为已掌握</button>
      <button type="button" :disabled="!visibleIds.length" @click="mark('review')">将当前结果加入复习</button>
    </div>
    <p v-if="!visibleIds.length" class="learning-empty">没有匹配的内容。试试其他关键词或切换到「全部」。</p>
    <button v-if="undoEntries.length" type="button" class="mt-3 text-sm underline" @click="undoBatch">撤销上次批量标记</button>
    <p v-if="notice" role="status" class="learning-notice">{{ notice }}</p>
  </section>
</template>
