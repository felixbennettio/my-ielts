<script setup lang="ts">
import { useProgress } from '../composables/progress'
const props = defineProps<{ itemId: string; word: string }>()
const progress = useProgress()
const status = computed(() => progress.getStatus(props.itemId))
</script>

<template>
  <div class="learning-status" :data-status="status">
    <label class="mastery-checkbox">
      <input type="checkbox" :checked="status === 'mastered'" :aria-label="`${word}：已掌握`" @change="progress.setStatus([itemId], status === 'mastered' ? 'new' : 'mastered')">
      <span>已掌握</span>
    </label>
    <button type="button" class="review-button" :aria-label="`${word}：待复习`" :aria-pressed="status === 'review'" @click="progress.setStatus([itemId], status === 'review' ? 'new' : 'review')">
      {{ status === 'review' ? '★ 复习中' : '☆ 待复习' }}
    </button>
  </div>
</template>
