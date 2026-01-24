<template>
  <div class="meter">
    <div class="bar" :style="{ width: value + '%' }"></div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.meter {
  width: 100%;
  height: 20px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #42b883;
  transition: width 0.1s linear;
}
</style>
