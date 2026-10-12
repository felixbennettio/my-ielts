<script setup lang="ts" generic="T extends any, O extends any">
import words from './listening179.json'
import { useAudioPlayer } from '../../composables/audioPlayer'

const ws = reactive(words)
function play(word: string) {
  useAudioPlayer().play(`${import.meta.env.BASE_URL}179_audios/${word}.mp3`, `听力考点词 · ${word}`)
}
</script>

<template>
  <div>
    <div class="relative overflow-x-auto">
      <div>
        <router-link to="/ielts/practice">
          练习
        </router-link>
      </div>
      <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th class="w-0 px-6 py-3 word-sequence">
              本话题序号
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
            <th scope="col" class="px-6 py-3 text-right word-sequence">总序号</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in ws" :key="w.index" class="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
            <td class="px-6 py-4">
              {{ w.index }}
            </td>
            <td class="px-6 py-4">
              <a href="javascript:;" class="i-carbon-volume-up-filled block" @click="play(w.word)" />
            </td>
            <th scope="row" class="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
              <a
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
            <td class="px-6 py-4 text-right word-sequence">{{ w.index }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
