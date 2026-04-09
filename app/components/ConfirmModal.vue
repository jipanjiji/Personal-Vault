<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="glass border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangleIcon class="text-red-500 w-6 h-6" />
          </div>
          
          <h3 class="text-xl font-bold text-white mb-2">{{ title || 'Are you sure?' }}</h3>
          <p class="text-slate-400 text-sm mb-6 leading-relaxed">
            {{ message || 'This action cannot be undone. This item will be permanently removed from your vault.' }}
          </p>
          
          <div class="flex gap-3">
            <button 
              @click="$emit('update:modelValue', false)"
              class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              @click="$emit('confirm')"
              class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangleIcon } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  title?: string
  message?: string
}>()

defineEmits(['update:modelValue', 'confirm'])
</script>

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
