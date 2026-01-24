<template>
  <div>
    <button @click="toggleTest">
      {{ isTesting ? 'Stop test' : 'Start microphone test' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>

    <VolumeMeter v-if="isTesting" :value="volume" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VolumeMeter from './VolumeMeter.vue'
import { startMicrophone, stopMicrophone } from '../services/audioService'
import { saveTest } from '../services/db'
import { registerSync } from '../services/syncService'
import {
  supportsMicrophone,
  supportsAudioContext
} from '../utils/featureDetection'

const isTesting = ref(false)
const volume = ref(0)
const error = ref(null)

async function toggleTest() {
  error.value = null

  if (!supportsMicrophone() || !supportsAudioContext()) {
    error.value = 'Microphone testing is not supported on this device.'
    return
  }

  if (isTesting.value) {
    stopMicrophone()
    isTesting.value = false

    await saveTest({
      timestamp: Date.now(),
      averageVolume: volume.value
    })

    await registerSync()
    return
  }

  try {
    await startMicrophone(v => (volume.value = v))
    isTesting.value = true
  } catch {
    error.value = 'Microphone permission denied.'
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
