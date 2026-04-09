<template>
  <div class="relative w-full" ref="container">
    <label v-if="label" class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">{{ label }}</label>
    
    <button 
      type="button"
      @click="isOpen = !isOpen"
      class="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-900 transition-all focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98]"
    >
      <div class="flex items-center gap-3">
        <component :is="selectedOption?.icon" v-if="selectedOption?.icon" class="w-5 h-5 text-indigo-400" />
        <span :class="modelValue ? 'text-white' : 'text-slate-500'">
          {{ selectedOption?.label || placeholder || 'Select an option' }}
        </span>
      </div>
      <ChevronDownIcon :class="['w-4 h-4 text-slate-500 transition-transform duration-300', isOpen ? 'rotate-180' : '']" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="absolute z-50 mt-2 w-full glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <div class="max-h-60 overflow-y-auto custom-scrollbar">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            @click="selectOption(option)"
            :class="[
              'w-full px-4 py-3 flex items-center gap-3 transition-colors text-left',
              modelValue === option.value ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
            ]"
          >
            <component :is="option.icon" v-if="option.icon" :class="['w-5 h-5', modelValue === option.value ? 'text-white' : 'text-indigo-400']" />
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ option.label }}</span>
              <span v-if="option.description" class="text-[10px] opacity-60">{{ option.description }}</span>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

interface Option {
  label: string
  value: string
  icon?: any
  description?: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find(o => o.value === props.modelValue)
})

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
.glass {
  background: rgba(15, 23, 42, 0.9);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
