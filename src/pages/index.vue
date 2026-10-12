<script setup lang="ts" generic="T extends any, O extends any">
import { RouterLink } from 'vue-router'
import { useProgress } from '../composables/progress'
import { allLearningIds } from '../data/learning'
const progress = useProgress()
const totals = computed(() => progress.stats([...allLearningIds]))

defineOptions({
  name: 'IndexPage',
})

const menus = reactive([
  {
    label: '词汇',
    icon: 'i-carbon-chart-histogram',
    link: '/vocabulary',
    desc: '包含雅思词汇真经内容，按场景分组',
  },
  {
    label: '语法',
    icon: 'i-carbon-load-balancer-vpc ',
    link: '/grammar',
    desc: '新东方雅思语法课程，针对雅思考试设计，思维导图',
  },
  {
    label: '听力',
    icon: 'i-carbon-headphones',
    link: '/listening',
    desc: '听力基本概念，179 考点词同义替换和雅思王语料库',
  },
  {
    label: '口语',
    icon: 'i-carbon-microphone',
    link: '/speaking',
    desc: '栏目待补充，先专注已有学习资料',
  },
  {
    label: '阅读',
    icon: 'i-carbon-white-paper',
    link: '/reading',
    desc: '538 考点词同义替换',
  },
  {
    label: '写作',
    icon: 'i-carbon-edit',
    link: '/writing',
    desc: '100 句翻译练习、大小作文',
  },
  {
    label: '单词练习',
    icon: 'i-carbon-keyboard',
    link: '/vocabulary/typing',
    desc: '背景单词跟打练习，提升打字速度与单词读写熟悉度',
  },
])
</script>

<template>
  <div class="px-4 pt-6 2xl:px-0">
    <section class="mb-4 border border-gray-200 rounded-lg bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div class="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 sm:py-16">
        <div class="learning-hero mb-10">
          <span class="learning-eyebrow">MY IELTS · YOUR DAILY PRACTICE</span>
          <h1>一步一步，掌握你的雅思词汇。</h1>
          <p>词汇、听力、阅读，学过的内容随手勾选，难记的内容留待复习。</p>
          <div class="learning-total"><strong>{{ totals.mastered }}</strong><span> / {{ totals.total }} 项已掌握</span><b>{{ totals.percent }}%</b></div>
          <progress :value="totals.mastered" :max="totals.total || 1" aria-label="整体掌握进度" />
          <div class="learning-hero-links"><RouterLink to="/vocabulary" class="learning-primary">开始学词汇 →</RouterLink><RouterLink to="/progress">查看进度与备份 ↗</RouterLink></div>
        </div>
        <div class="md:grid lg:grid-cols-3 md:grid-cols-2 md:gap-12 space-y-8 md:space-y-0">
          <RouterLink
            v-for="m in menus"
            :key="m.label"
            :to="m.link"
            class="block"
          >
            <div class="mb-4 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
              <i class="block h-5 w-5 text-primary-600 lg:h-6 lg:w-6 dark:text-primary-300" :class="m.icon" />
            </div>
            <h3 class="mb-2 text-xl font-bold dark:text-white">
              {{ m.label }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ m.desc }}
            </p>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
