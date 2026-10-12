<script setup lang="ts">
import chapterData from './spelling_convention'
import { useAudioPlayer } from '../../composables/audioPlayer'
import { corpusId } from '../../data/ids'
import { useLearningFilter } from '../../composables/progress'
const chapter = 'Chapter2 拼写规范'
const chapterInfo = chapterData[chapter]
const { query, filter, matches, progress } = useLearningFilter()
const ids = chapterInfo.rows.map(row => corpusId(chapter, row[0]))
const rows = computed(() => chapterInfo.rows.filter(row => matches(corpusId(chapter, row[0]), row.join(' '))))
const visibleIds = computed(() => rows.value.map(row => corpusId(chapter, row[0])))
function play(word: string) {
  useAudioPlayer().play(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word.split(', ')[0])}&type=1`, `听力拼写 · ${word}`)
}
</script>

<template>
  <div class="mt-6">
    <h1 class="text-xl font-bold">听力拼写语料库</h1>
    <p class="text-gray-500">{{ chapter }} · {{ chapterInfo.title }}</p>
    <p class="text-sm text-gray-500">{{ chapterInfo.desc }}</p>
    <LearningToolbar v-model:query="query" v-model:filter="filter" :ids="ids" :visible-ids="visibleIds" />
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700"><tr><th class="p-4">学习状态</th><th class="p-4">发音</th><th v-for="column in chapterInfo.columns" :key="column" class="p-4">{{ column }}</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="corpusId(chapter, row[0])" class="border-b dark:border-gray-700" :class="{ 'learning-mastered-row': progress.getStatus(corpusId(chapter, row[0])) === 'mastered' }">
            <td class="p-4"><LearningStatus :item-id="corpusId(chapter, row[0])" :word="row[0]" /></td>
            <td class="p-4"><button type="button" class="i-carbon-volume-up-filled" :aria-label="`播放 ${row[0]} 发音`" @click="play(row[0])" /></td>
            <td v-for="(cell, index) in row" :key="index" class="p-4">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
