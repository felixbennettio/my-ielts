import vocabulary from '../pages/vocabulary/vocabulary'
import listening from '../pages/listening/listening179.json'
import reading from '../pages/reading/reading538words'
import corpus from '../pages/listening/spelling_convention'

import { vocabularyId, listeningId, readingId, corpusId } from './ids'
export { vocabularyId, listeningId, readingId, corpusId } from './ids'

export const learningModules = [
  { key: 'vocabulary', label: '雅思词汇真经', link: '/vocabulary', ids: Object.entries(vocabulary).flatMap(([chapter, data]) => data.words.flat().map(item => vocabularyId(chapter, item))) },
  { key: 'listening', label: '听力 179 考点词', link: '/listening/keyword', ids: listening.map(item => listeningId(item.word)) },
  { key: 'reading', label: '阅读同义替换', link: '/reading', ids: reading.flatMap(category => category.words.map(word => readingId(category.title, word))) },
  { key: 'corpus', label: '听力拼写语料', link: '/listening/corpus', ids: (corpus['Chapter2 拼写规范'].rows as string[][]).map(row => corpusId('Chapter2 拼写规范', row[0])) },
]
export const allLearningIds = new Set(learningModules.flatMap(module => module.ids))
