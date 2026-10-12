import { describe, expect, it } from 'vitest'
import { createProgressStore, encodeProgress, mergeProgress, parseProgress, PROGRESS_KEY } from '../src/composables/progress'
import { allLearningIds, learningModules, listeningId, vocabularyId } from '../src/data/learning'

function memoryStorage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value) } }
}

describe('learning progress', () => {
  it('persists mastering, review and an explicit uncheck across reloads', () => {
    const storage = memoryStorage()
    const first = createProgressStore(storage, () => 100)
    const id = listeningId('accommodation')
    first.setStatus([id], 'mastered')
    expect(createProgressStore(storage).getStatus(id)).toBe('mastered')
    first.setStatus([id], 'review')
    expect(createProgressStore(storage).getStatus(id)).toBe('review')
    first.setStatus([id], 'new')
    expect(createProgressStore(storage).getStatus(id)).toBe('new')
  })

  it('keeps module and chapter progress independent', () => {
    const store = createProgressStore(memoryStorage())
    const item = { id: 1, word: ['accommodation'] }
    const first = vocabularyId('01', item)
    store.setStatus([first], 'mastered')
    expect(store.getStatus(vocabularyId('02', item))).toBe('new')
    expect(store.getStatus(listeningId('accommodation'))).toBe('new')
  })

  it('supports pending, mastered and review filters with accurate totals', () => {
    const store = createProgressStore(memoryStorage())
    const ids = ['listening:a', 'listening:b', 'listening:c']
    store.setStatus([ids[0]], 'mastered')
    store.setStatus([ids[1]], 'review')
    expect(store.stats(ids)).toEqual({ total: 3, mastered: 1, review: 1, pending: 2, percent: 33 })
    expect(ids.filter(id => store.matches(id, 'pending'))).toEqual(ids.slice(1))
    expect(ids.filter(id => store.matches(id, 'review'))).toEqual([ids[1]])
    expect(store.stats([ids[0], ids[0]]).total).toBe(1)
  })

  it('merges independent tab edits without losing prior writes', () => {
    const storage = memoryStorage()
    const first = createProgressStore(storage, () => 100)
    const second = createProgressStore(storage, () => 100)
    first.setStatus(['listening:a'], 'mastered')
    second.setStatus(['listening:b'], 'review')
    first.sync()
    expect(first.getStatus('listening:a')).toBe('mastered')
    expect(first.getStatus('listening:b')).toBe('review')
    second.setStatus(['listening:a'], 'new')
    first.sync()
    expect(first.getStatus('listening:a')).toBe('new')
  })

  it('round-trips a backup and keeps newer local states when importing', () => {
    const storage = memoryStorage()
    const store = createProgressStore(storage, () => 200)
    store.setStatus(['listening:a'], 'new')
    const backup = parseProgress(encodeProgress({ 'listening:a': { status: 'mastered', updatedAt: 100 }, 'listening:b': { status: 'review', updatedAt: 100 } }))
    store.importRecords(backup)
    expect(store.getStatus('listening:a')).toBe('new')
    expect(createProgressStore(storage).getStatus('listening:b')).toBe('review')
  })

  it.each([
    'not JSON',
    '{"version":1,"records":{}}',
    JSON.stringify({ app: 'my-ielts', version: 2, records: {} }),
    JSON.stringify({ app: 'my-ielts', version: 1, records: [] }),
    encodeProgress({ 'listening:a': { status: 'invalid' as any, updatedAt: 100 } }),
    encodeProgress({ 'listening:a': { status: 'mastered', updatedAt: -1 } }),
    encodeProgress({ '__proto__': { status: 'mastered', updatedAt: 100 }, bad: { status: 'mastered', updatedAt: 100 } }),
  ])('rejects malformed backup data before any mutation', (text) => {
    expect(() => parseProgress(text)).toThrow()
  })

  it('warns when browser storage is unavailable while preserving in-session progress', () => {
    const store = createProgressStore({ getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('quota') } })
    expect(store.storageError.value).toBeTruthy()
    store.setStatus(['listening:a'], 'mastered')
    expect(store.getStatus('listening:a')).toBe('mastered')
    expect(store.storageError.value).toContain('暂未保存')
  })

  it('loads valid saved records and preserves explicit unchecks on merge', () => {
    const storage = memoryStorage()
    storage.setItem(PROGRESS_KEY, encodeProgress({ 'listening:a': { status: 'review', updatedAt: 100 } }))
    expect(createProgressStore(storage).getStatus('listening:a')).toBe('review')
    expect(mergeProgress({ 'listening:a': { status: 'new', updatedAt: 200 } }, { 'listening:a': { status: 'mastered', updatedAt: 100 } })['listening:a'].status).toBe('new')
  })

  it('gives every source entry a unique persistent identity', () => {
    expect(allLearningIds.size).toBe(learningModules.reduce((sum, module) => sum + module.ids.length, 0))
    expect(learningModules.find(module => module.key === 'listening')?.ids.length).toBe(179)
  })
})
