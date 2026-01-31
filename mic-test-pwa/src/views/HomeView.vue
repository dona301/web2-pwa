<template>
  <main>
    <h1>Test Your Microphone</h1>

    <MicrophoneTest @test-added="loadTests" />

    <section v-if="tests.length">
      <h2>Previous tests</h2>
      <ul>
        <li v-for="test in tests" :key="test.id">
          {{ formatDate(test.timestamp) }} –
          Avg volume: {{ test.averageVolume }}
          <span v-if="test.synced">✅</span>
          <span v-else>⏳</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MicrophoneTest from '../components/MicrophoneTest.vue'
import { getAllTests } from '../services/db'
import { requestPushPermission } from '../pwa/push.js'
import '../pwa/registerSW.js'

const tests = ref([])

const loadTests = async () => {
  tests.value = await getAllTests()
}

onMounted(async () => {
  requestPushPermission()
  await loadTests()

  window.addEventListener('online', loadTests)

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'sync-complete') {
        loadTests()
      }
    })
  }
})

function formatDate(ts) {
  return new Date(ts).toLocaleString()
}
</script>
