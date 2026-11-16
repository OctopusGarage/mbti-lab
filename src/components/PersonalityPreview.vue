<template>
  <section ref="container" class="personality-preview" :style="{ height: `${width * height / 540}px` }" :aria-label="type">
    <div ref="stage" class="preview-scale" :style="{ transform: `scale(${width / 540})` }">
      <ShareCard :type="type" visible />
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ShareCard from './ShareCard.vue'
defineProps({ type: String })
const container = ref(null), stage = ref(null), width = ref(320), height = ref(600)
let observer, frame
onMounted(() => {
  const resize = () => { width.value = container.value.clientWidth; height.value = stage.value.offsetHeight }
  resize()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(resize)
    })
    observer.observe(container.value)
    observer.observe(stage.value)
  }
})
onUnmounted(() => { observer?.disconnect(); cancelAnimationFrame(frame) })
</script>
<style scoped>
.personality-preview { position: relative; width: 100%; max-width: 540px; margin: 24px auto 36px; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 60px rgba(30,25,60,.18); }
.preview-scale { position: absolute; left: 0; top: 0; width: 540px; transform-origin: top left; }
</style>
