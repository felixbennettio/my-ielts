<script setup>
import words from './listening179.json'
import { useAudioPlayer } from '../../composables/audioPlayer'
import { listeningId } from '../../data/ids'
import { useLearningFilter } from '../../composables/progress'
const { query, filter, matches, progress } = useLearningFilter()

const ws = computed(() => words.filter(w => matches(listeningId(w.word), [w.word, w.meaning, ...w.replace].join(' '))))
const ids = words.map(w => listeningId(w.word))
const visibleIds = computed(() => ws.value.map(w => listeningId(w.word)))
function play(word) {
  useAudioPlayer().play(`${import.meta.env.BASE_URL}179_audios/${word}.mp3`, `听力考点词 · ${word}`)
}


</script>

<template>
  <!-- Card header -->
  <div class="mt-6 items-center justify-between lg:flex">
    <div class="mb-4 lg:mb-0">
      <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        听力 179 考点词
      </h3>
      <span class="text-base font-normal text-gray-500 dark:text-gray-400">考点词以及对应的同义替换</span>
    </div>
    <div class="items-center sm:flex">
      <div class="flex items-center">
        <button
          type="button"
          class="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white dark:bg-blue-600 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          @click="$router.push('/listening/179practice')"
        >
          练习
        </button>

      </div>
    </div>
  </div>
  <LearningToolbar v-model:query="query" v-model:filter="filter" :ids="ids" :visible-ids="visibleIds" />
  <div class="mt-6 overflow-x-auto">
    <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
      <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th class="px-6 py-3">学习状态</th>
          <th class="w-0 px-6 py-3">
            #
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
        <tr v-for="w in ws" :key="w.index" :class="{ 'learning-mastered-row': progress.getStatus(listeningId(w.word)) === 'mastered' }" class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
          <td class="px-6 py-4"><LearningStatus :item-id="listeningId(w.word)" :word="w.word" /></td>
          <td class="px-6 py-4">
            {{ w.index }}
          </td>
          <td class="px-6 py-4">
            <button type="button" class="i-carbon-volume-up-filled block" :aria-label="`播放 ${w.word} 发音`" @click="play(w.word)" />
          </td>
          <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
            <a
              class="hover:underline"
              :title="`在剑桥词典中查询 ${w.word}`"
              :href="`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${w.word}`"
              target="_blank"
            >{{ w.word }}</a>
          </th>
          <td class="px-6 py-4 italic">
            {{ w.type }}
          </td>
          <td class="px-6 py-4">
            {{ w.meaning }}
          </td>
          <td class="px-6 py-4">
            {{ w.replace.join(', ') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
