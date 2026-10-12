import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export type LearningStatus = 'new' | 'review' | 'mastered'
export type StatusFilter = 'all' | 'pending' | 'review' | 'mastered'
export interface ProgressRecord { status: LearningStatus; updatedAt: number }
export type ProgressRecords = Record<string, ProgressRecord>
export const PROGRESS_KEY = 'my-ielts:progress:v1'

export function parseProgress(text: string): ProgressRecords {
  const data = JSON.parse(text)
  if (data?.app !== 'my-ielts' || data.version !== 1 || !data.records || Array.isArray(data.records) || typeof data.records !== 'object')
    throw new Error('请选择 My IELTS 导出的进度文件（版本 1）。')
  const entries = Object.entries(data.records)
  if (entries.length > 20000)
    throw new Error('进度文件包含过多记录。')
  const records: ProgressRecords = {}
  for (const [id, value] of entries) {
    const record = value as ProgressRecord
    if (!/^(vocabulary|listening|reading|corpus):/.test(id) || id.length > 1000 || !record || !['new', 'review', 'mastered'].includes(record.status) || !Number.isSafeInteger(record.updatedAt) || record.updatedAt < 0 || record.updatedAt > Date.now() + 86400000)
      throw new Error('进度文件格式有误，原有进度未被修改。')
    records[id] = { status: record.status, updatedAt: record.updatedAt }
  }
  return records
}

export function encodeProgress(records: ProgressRecords) {
  return JSON.stringify({ app: 'my-ielts', version: 1, exportedAt: new Date().toISOString(), records }, null, 2)
}

export function mergeProgress(current: ProgressRecords, incoming: ProgressRecords): ProgressRecords {
  const merged = { ...current }
  for (const [id, record] of Object.entries(incoming)) {
    if (!merged[id] || record.updatedAt > merged[id].updatedAt)
      merged[id] = record
  }
  return merged
}

export function createProgressStore(storage: Pick<Storage, 'getItem' | 'setItem'>, now = Date.now) {
  const records = ref<ProgressRecords>({})
  const storageError = ref('')
  function read() {
    try {
      const raw = storage.getItem(PROGRESS_KEY)
      return raw ? parseProgress(raw) : {}
    }
    catch {
      storageError.value = '浏览器暂时无法读取学习进度。请先导出备份，避免清理浏览器数据。'
      return {}
    }
  }
  records.value = read()
  function save(next: ProgressRecords) {
    records.value = next
    try {
      storage.setItem(PROGRESS_KEY, encodeProgress(next))
      storageError.value = ''
    }
    catch {
      storageError.value = '学习进度暂未保存到浏览器。请在离开前到「学习进度」导出备份。'
    }
  }
  function setStatus(ids: string[], status: LearningStatus) {
    const next = mergeProgress(records.value, read())
    const latest = Math.max(0, ...Object.values(next).map(record => record.updatedAt))
    const updatedAt = Math.max(now(), latest + 1)
    for (const id of ids)
      next[id] = { status, updatedAt }
    save(next)
  }
  function importRecords(incoming: ProgressRecords) {
    save(mergeProgress(mergeProgress(records.value, read()), incoming))
  }
  function sync() {
    records.value = mergeProgress(records.value, read())
  }
  const getStatus = (id: string): LearningStatus => records.value[id]?.status || 'new'
  function matches(id: string, filter: StatusFilter) {
    const status = getStatus(id)
    return filter === 'all' || (filter === 'pending' ? status !== 'mastered' : status === filter)
  }
  function stats(ids: string[]) {
    const unique = [...new Set(ids)]
    const mastered = unique.filter(id => getStatus(id) === 'mastered').length
    const review = unique.filter(id => getStatus(id) === 'review').length
    return { total: unique.length, mastered, review, pending: unique.length - mastered, percent: unique.length ? Math.round(mastered / unique.length * 100) : 0 }
  }
  return { records, storageError, getStatus, matches, stats, setStatus, importRecords, sync }
}

let singleton: ReturnType<typeof createProgressStore> | undefined
export function useProgress() {
  if (!singleton) {
    // Storage access itself can be denied in private or restricted browsers.
    const storage = {
      getItem: (key: string) => window.localStorage.getItem(key),
      setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    }
    singleton = createProgressStore(storage)
    window.addEventListener('storage', event => {
      if (event.key === PROGRESS_KEY)
        singleton?.sync()
    })
  }
  return singleton
}

export function useLearningFilter() {
  const route = useRoute()
  const query = ref('')
  const filter = ref<StatusFilter>(['pending', 'review', 'mastered'].includes(String(route.query.status)) ? route.query.status as StatusFilter : 'all')
  watch(() => route.query.status, value => {
    filter.value = ['pending', 'review', 'mastered'].includes(String(value)) ? value as StatusFilter : 'all'
  })
  const progress = useProgress()
  const matches = (id: string, text: string) => progress.matches(id, filter.value) && text.toLowerCase().includes(query.value.trim().toLowerCase())
  return { query, filter, matches, progress }
}
