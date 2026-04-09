<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md" @click="$emit('update:modelValue', false)"></div>
    
    <div class="relative w-full max-w-4xl glass rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div :class="[
            'p-3 rounded-xl',
            item.type === 'code' ? 'bg-blue-500/10 text-blue-400' : 
            item.type === 'password' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          ]">
            <CodeIcon v-if="item.type === 'code'" class="w-6 h-6" />
            <KeyIcon v-else-if="item.type === 'password'" class="w-6 h-6" />
            <FileTextIcon v-else class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">{{ item.title }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-slate-500 font-mono uppercase tracking-widest">{{ item.type }}</span>
              <span v-if="item.is_public" class="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">PUBLIC</span>
            </div>
          </div>
        </div>
        <button @click="$emit('update:modelValue', false)" class="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-grow overflow-auto p-6 bg-slate-950/50">
        <div v-if="item.type === 'password'" class="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
          <div class="bg-amber-500/10 p-5 rounded-full mb-4">
            <LockIcon class="w-10 h-10 text-amber-400" />
          </div>
          <p class="text-slate-400 mb-6">This password is encrypted and private.</p>
          <div class="flex items-center gap-4">
            <div class="bg-indigo-500/5 px-6 py-3 rounded-xl border border-indigo-500/10 font-mono text-xl tracking-wider text-indigo-300">
              {{ decryptedPassword || '••••••••' }}
            </div>
            <button 
              @click="handleCopy"
              class="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all text-indigo-400 border border-white/5"
              title="Copy to clipboard"
            >
              <CopyIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div v-else-if="item.type === 'code'" class="relative">
          <div v-if="highlightedHtml" v-html="highlightedHtml" class="rounded-2xl overflow-hidden border border-white/5"></div>
          <pre v-else class="p-6 bg-slate-900/40 rounded-2xl border border-white/5 font-mono text-sm whitespace-pre-wrap text-slate-300">{{ item.content }}</pre>
          <button 
            @click="handleCopy"
            class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-lg text-white transition-all border border-white/10"
          >
            <CopyIcon class="w-4 h-4" />
          </button>
        </div>

        <div v-else class="relative bg-slate-900/40 rounded-2xl border border-white/5 p-8 font-serif text-lg leading-relaxed text-slate-300 whitespace-pre-wrap">
          {{ item.content }}
          <button 
            @click="handleCopy"
            class="absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-slate-400 transition-all"
          >
            <CopyIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-white/5 flex items-center justify-between">
        <div class="flex gap-2">
          <button 
            v-if="item.is_public && item.type !== 'password'" 
            @click="openRaw"
            class="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <ExternalLinkIcon class="w-4 h-4" /> View Raw
          </button>
        </div>
        <div class="flex gap-3">
          <button @click="$emit('edit', item)" class="px-6 py-2 hover:bg-white/5 text-slate-400 rounded-xl text-sm font-medium transition-all">Edit</button>
          <button @click="$emit('update:modelValue', false)" class="px-6 py-2 bg-white text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-white/5">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  XIcon, 
  FileTextIcon, 
  CodeIcon, 
  KeyIcon, 
  LockIcon, 
  CopyIcon, 
  ExternalLinkIcon 
} from 'lucide-vue-next'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  modelValue: boolean
  item: any
  decryptedPassword?: string
}>()

const emit = defineEmits(['update:modelValue', 'edit', 'copy'])

const highlightedHtml = ref('')

watch(() => [props.item, props.modelValue], async ([newItem, isOpen]) => {
  if (isOpen && newItem && newItem.type === 'code') {
    highlightedHtml.value = await codeToHtml(newItem.content, {
      lang: newItem.language || 'text',
      theme: 'github-dark'
    })
  } else {
    highlightedHtml.value = ''
  }
}, { immediate: true })

const handleCopy = () => {
  emit('copy', props.item)
}

const openRaw = () => {
  window.open(`/raw/${props.item.id}`, '_blank')
}
</script>

<style>
/* Shiki output overrides for the view modal */
pre.shiki {
  padding: 1.5rem;
  margin: 0;
  white-space: pre-wrap;
  background-color: transparent !important;
}
</style>
