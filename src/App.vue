<script setup lang="ts">
import { useProgress } from './composables/progress'
const { storageError } = useProgress()
</script>

<template>
  <TheHeader />
  <main class="flex-1 bg-gray-50 pb-10 pt-16 leading-8 dark:bg-gray-900 dark:text-white">
    <div class="mx-auto w-full max-w-screen-2xl">
      <p v-if="storageError" role="alert" class="learning-storage-warning">{{ storageError }}</p>
      <RouterView />
    </div>
  </main>
  <TheFooter />
</template>
