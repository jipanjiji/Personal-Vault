<template>
  <div class="min-h-screen bg-[#0d1117]">
    <!-- Top Action Bar -->
    <div class="px-6 py-3 border-b border-white/5 flex items-center justify-between text-xs sticky top-0 bg-[#0d1117]/80 backdrop-blur-md z-10">
      <div class="flex items-center gap-4">
        <span class="text-slate-500 font-mono">ID: {{ $route.params.id }}</span>
        <span v-if="item" class="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest text-[10px]">{{ item.type }}</span>
      </div>
      <a 
        :href="`/r/${$route.params.id}`" 
        target="_blank"
        class="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium bg-indigo-400/5 px-3 py-1 rounded-lg border border-indigo-400/10"
      >
        View True Raw (Plain Text)
      </a>
    </div>

    <div v-if="item" class="p-6 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
      <div v-if="item.type === 'code' && html" v-html="html"></div>
      <div v-else class="text-slate-300">{{ item.content }}</div>
    </div>
    
    <div v-else-if="error" class="min-h-screen flex items-center justify-center text-slate-500 font-mono text-sm">
      <div class="text-center space-y-2">
        <p>{{ error }}</p>
        <NuxtLink to="/dashboard" class="text-indigo-400 hover:underline">Back to Dashboard</NuxtLink>
      </div>
    </div>

    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-indigo-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { codeToHtml } from 'shiki'

definePageMeta({
  layout: false
})

const route = useRoute()
const { db } = useFirebase()
const item = ref<any>(null)
const error = ref('')
const html = ref('')

onMounted(async () => {
  try {
    const docRef = doc(db, 'items', route.params.id as string)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.is_public && data.type !== 'password') {
        item.value = data
        
        if (data.type === 'code') {
          html.value = await codeToHtml(data.content, {
            lang: data.language || 'text',
            theme: 'github-dark'
          })
        }
      } else {
        error.value = '403 | This item is private or restricted'
      }
    } else {
      error.value = '404 | Source not found'
    }
  } catch (e: any) {
    error.value = '500 | Internal Server Error'
  }
})

useHead({
  title: 'Raw View - Personal Vault',
  bodyAttrs: {
    class: 'bg-[#0d1117] text-[#e6edf3]' // GitHub dark bg
  }
})
</script>

<style>
/* Shiki output styling */
pre.shiki {
  background-color: transparent !important;
  padding: 0;
  margin: 0;
  white-space: pre-wrap;
}
</style>
