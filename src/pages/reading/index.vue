<script setup>
import words from './reading538words'
import { readingId } from '../../data/ids'
import { useLearningFilter } from '../../composables/progress'
const { query, filter, matches, progress } = useLearningFilter()

const ws = computed(() => words.map(cat => ({ ...cat, words: cat.words.filter(w => matches(readingId(cat.title, w), w.slice(1).flat().join(' '))) })).filter(cat => cat.words.length))
const ids = words.flatMap(cat => cat.words.map(w => readingId(cat.title, w)))
const visibleIds = computed(() => ws.value.flatMap(cat => cat.words.map(w => readingId(cat.title, w))))

const hideAnswers = ref(false)
onUnmounted(() => audio?.pause())

let audio = null
function play(word) {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
  audio = document.createElement('audio')
  audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`
  audio.play().catch(() => {})
}
</script>

<template>
  <div class="px-4 pt-6 2xl:px-0">
    <div class="border border-gray-200 rounded-lg bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <h1 class="text-xl font-bold">阅读考点词与同义替换</h1>
      <p class="text-gray-500">沿用原项目的分组和内容，逐项记录学习状态。</p>
      <label class="reading-recall"><input v-model="hideAnswers" type="checkbox">自测模式：隐藏词义与同义替换，点击查看答案</label>
      <LearningToolbar v-model:query="query" v-model:filter="filter" :ids="ids" :visible-ids="visibleIds" />
      <!-- Card header -->
      <template
        v-for="cat in ws"
        :key="cat.title"
      >
        <div class="mt-6 items-center justify-between lg:flex">
          <div class="mb-4 lg:mb-0">
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {{ cat.title }}
            </h3>
            <span class="text-base font-normal text-gray-500 dark:text-gray-400">{{ cat.define }}</span>
          </div>
        </div>
        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">学习状态</th>
                <th class="w-0 px-6 py-3">
                  排名
                </th>
                <th class="w-0 px-6 py-3" />
                <th scope="col" class="w-0 px-6 py-3">
                  考点词
                </th>
                <th scope="col" class="w-0 px-6 py-3">
                  词性
                </th>
                <th scope="col" class="w-80 px-6 py-3">
                  词义
                </th>
                <th scope="col" class="px-6 py-3">
                  同义替换
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="w in cat.words"
                :key="readingId(cat.title, w)"
                :class="{ 'learning-mastered-row': progress.getStatus(readingId(cat.title, w)) === 'mastered' }"
                class="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <td class="px-6 py-4"><LearningStatus :item-id="readingId(cat.title, w)" :word="w[1]" /></td>
                <td class="px-6 py-4">
                  {{ w[0] }}
                </td>
                <td class="px-6 py-4">
                  <button type="button" class="i-carbon-volume-up-filled block" :aria-label="`播放 ${w[1]} 发音`" @click="play(w[1])" />
                </td>
                <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <a
                    class="hover:underline"
                    :title="`在剑桥词典中查询 ${w[1]}`"
                    :href="`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${w[1]}`"
                    target="_blank"
                  >{{ w[1] }}</a>
                </th>
                <td
                  class="px-6 py-4 italic"
                  v-html="w[2].join('<br>')"
                />
                <td class="px-6 py-4">
                  <details v-if="hideAnswers" :key="`meaning-${readingId(cat.title, w)}`"><summary>查看词义</summary><p v-for="meaning in w[3]" :key="meaning">{{ meaning }}</p></details>
                  <template v-else><p v-for="meaning in w[3]" :key="meaning">{{ meaning }}</p></template>
                </td>
                <td class="px-6 py-4">
                  <details v-if="hideAnswers" :key="`answer-${readingId(cat.title, w)}`"><summary>查看同义替换</summary>{{ w[4].join(', ') }}<br>{{ w[5] }}</details>
                  <template v-else>{{ w[4].join(', ') }}<br>{{ w[5] }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>
