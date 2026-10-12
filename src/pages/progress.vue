<script setup lang="ts">
import { useProgress, encodeProgress, parseProgress } from '../composables/progress'
import { allLearningIds, learningModules } from '../data/learning'
const progress = useProgress()
const totals = computed(() => progress.stats([...allLearningIds]))
const notice = ref('')
const importError = ref(false)
function exportBackup() {
  progress.sync()
  const url = URL.createObjectURL(new Blob([encodeProgress(progress.records.value)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `my-ielts-progress-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  importError.value = false
  notice.value = '已导出学习进度。请将备份文件妥善保存。'
}
async function importBackup(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('备份文件不能超过 2 MB。')
    const incoming = parseProgress(await file.text())
    if (Object.keys(incoming).some(id => !allLearningIds.has(id))) throw new Error('文件包含当前词库无法识别的记录，请确认备份来源。')
    progress.importRecords(incoming)
    importError.value = false
    notice.value = `已合并 ${Object.keys(incoming).length} 项记录；同一词条保留较新的状态。`
  }
  catch (error) {
    importError.value = true
    notice.value = error instanceof Error ? error.message : '导入失败，原有进度未被修改。'
  }
  input.value = ''
}
</script>

<template>
  <section class="learning-page">
    <div class="learning-hero">
      <span class="learning-eyebrow">MY IELTS · LEARNING PROGRESS</span>
      <h1>每一个掌握，都算数。</h1>
      <p>查看你的学习进度，把精力留给还需要练习的内容。</p>
      <div class="learning-total"><strong>{{ totals.mastered }}</strong><span> / {{ totals.total }} 项已掌握</span><b>{{ totals.percent }}%</b></div>
      <progress :value="totals.mastered" :max="totals.total || 1" aria-label="整体掌握进度" />
    </div>
    <div class="learning-module-grid">
      <article v-for="module in learningModules" :key="module.key" class="learning-module-card">
        <h2>{{ module.label }}</h2>
        <p><strong>{{ progress.stats(module.ids).mastered }}</strong> / {{ progress.stats(module.ids).total }} 已掌握</p>
        <progress :value="progress.stats(module.ids).mastered" :max="module.ids.length" :aria-label="`${module.label}掌握进度`" />
        <div class="learning-card-links">
          <RouterLink :to="module.link">继续学习 →</RouterLink>
          <RouterLink :to="{ path: module.link, query: { status: 'review' } }">待复习 {{ progress.stats(module.ids).review }}</RouterLink>
        </div>
      </article>
    </div>
    <section class="learning-backup">
      <h2>备份你的学习记录</h2>
      <p>进度自动保存在当前设备的当前浏览器。换设备、换浏览器或清理浏览器数据前，请先导出备份；在另一个设备导入即可合并进度。无痕模式结束后，记录可能被清除。</p>
      <div class="learning-backup-actions">
        <button type="button" class="learning-primary" @click="exportBackup">导出进度</button>
        <label class="learning-import">导入进度<input type="file" accept=".json,application/json" aria-label="导入学习进度备份" @change="importBackup"></label>
      </div>
      <p v-if="notice" :role="importError ? 'alert' : 'status'" :class="{ 'learning-error': importError }">{{ notice }}</p>
    </section>
  </section>
</template>
