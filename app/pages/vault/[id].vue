<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
    <!-- Header -->
    <header class="glass border-b border-white/5 px-4 py-3 sticky top-0 z-50">
      <div class="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <button 
            @click="navigateTo('/dashboard')" 
            class="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all flex items-center gap-2 group"
          >
            <ArrowLeftIcon class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span class="hidden sm:inline font-medium text-sm">Back</span>
          </button>
          
          <div class="h-6 w-px bg-white/10 hidden sm:block"></div>

          <div class="flex flex-col flex-1 min-w-0">
            <input 
              v-model="itemTitle"
              type="text" 
              class="bg-transparent border-none p-0 text-sm sm:text-base font-bold text-white focus:ring-0 placeholder-slate-600 truncate"
              placeholder="Untitled Snippet"
            />
            <div class="flex items-center gap-2 mt-0.5">
              <span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{{ detectedLanguage }}</span>
              <span v-if="isSaving" class="text-[10px] text-indigo-400 animate-pulse font-medium">Saving...</span>
              <span v-else-if="lastSaved" class="text-[10px] text-slate-600">Saved {{ lastSaved }}</span>
            </div>
          </div>
        </div>

        <!-- Search in content -->
        <div class="hidden lg:flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-1.5 w-64 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
          <SearchIcon class="w-4 h-4 text-slate-500" />
          <input 
            v-model="internalSearch"
            type="text" 
            placeholder="Find in content..." 
            class="bg-transparent border-none p-0 text-xs w-full focus:ring-0 text-slate-300"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center bg-white/5 p-1 rounded-xl gap-1">
            <button 
              @click="autoSaveEnabled = !autoSaveEnabled"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                autoSaveEnabled ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              ]"
            >
              <ZapIcon v-if="autoSaveEnabled" class="w-3 h-3" />
              Auto-save
            </button>
            <button 
              v-if="!autoSaveEnabled"
              @click="saveManual"
              :disabled="isSaving"
              class="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              Save
            </button>
          </div>

          <div class="h-6 w-px bg-white/10 mx-1"></div>

          <button 
            @click="copyRawLink"
            class="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all relative group"
            title="Copy Raw Link"
          >
            <LinkIcon class="w-5 h-5" />
            <span v-if="showCopyTooltip" class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap">Copied!</span>
          </button>
          
          <a 
            :href="`/r/${$route.params.id}`" 
            target="_blank"
            class="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            title="View Raw"
          >
            <ExternalLinkIcon class="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>

    <!-- Editor / Viewer Area -->
    <div class="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      <!-- Toolbar Sidebar (Vertical) -->
      <aside class="w-full md:w-16 border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center py-2 md:py-6 gap-4 px-4 md:px-0">
        <button 
          @click="editMode = false"
          :class="['p-3 rounded-2xl transition-all', !editMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-400']"
          title="View Mode"
        >
          <EyeIcon class="w-5 h-5" />
        </button>
        <button 
          @click="editMode = true"
          :class="['p-3 rounded-2xl transition-all', editMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-400']"
          title="Edit Mode"
        >
          <Edit3Icon class="w-5 h-5" />
        </button>
        
        <div class="hidden md:block h-px w-8 bg-white/5 my-2"></div>
        
        <button 
          @click="togglePrivacy"
          class="p-3 text-slate-600 hover:text-slate-400 rounded-2xl transition-all"
          :title="isPublic ? 'Public' : 'Private'"
        >
          <GlobeIcon v-if="isPublic" class="w-5 h-5 text-emerald-500" />
          <LockIcon v-else class="w-5 h-5 text-amber-500" />
        </button>
      </aside>

      <!-- Main Workspace -->
      <main class="flex-grow relative bg-[#010409]">
        <ClientOnly>
          <MonacoEditor 
            v-model="itemContent"
            :lang="detectedLanguage"
            theme="vs-dark"
            :options="editorOptions"
            class="h-full w-full"
            @load="onEditorLoad"
          />
        </ClientOnly>

        <!-- Custom Search Overlay (if needed, though Monaco has built-in) -->
        <div v-if="internalSearch && !editMode" class="fixed bottom-6 right-6 bg-slate-900/90 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-400 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
           <SearchIcon class="w-3 h-3 text-indigo-400" />
           Press <kbd class="px-1 py-0.5 rounded bg-white/10 mx-1">Ctrl+F</kbd> for advanced find
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeftIcon, 
  SearchIcon, 
  EyeIcon, 
  Edit3Icon, 
  GlobeIcon, 
  LockIcon, 
  LinkIcon, 
  ExternalLinkIcon,
  ZapIcon,
  Trash2Icon
} from 'lucide-vue-next'
import { codeToHtml } from 'shiki'

const route = useRoute()
const { user } = useAuth()
const { getItem, updateItem, getDecryptedPassword } = useVault()

// State
const item = ref<any>(null)
const itemTitle = ref('')
const itemContent = ref('')
const isPublic = ref(false)
const type = ref('plain_text')
const editMode = ref(false)
const autoSaveEnabled = ref(true)
const isSaving = ref(false)
const lastSaved = ref('')
const internalSearch = ref('')
const showCopyTooltip = ref(false)
const editorInstance = ref<any>(null)

// Monaco Options
const editorOptions = computed(() => ({
  readOnly: !editMode.value,
  fontSize: 14,
  lineNumbers: 'on' as const,
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  theme: 'vs-dark',
  padding: { top: 20, bottom: 20 },
  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true
}))

// Computed Logic for Language Detection
const detectedLanguage = computed(() => {
  const t = itemTitle.value.toLowerCase()
  if (t.endsWith('.js')) return 'javascript'
  if (t.endsWith('.ts')) return 'typescript'
  if (t.endsWith('.html')) return 'html'
  if (t.endsWith('.css')) return 'css'
  if (t.endsWith('.json')) return 'json'
  if (t.endsWith('.py')) return 'python'
  if (t.endsWith('.lua')) return 'lua'
  if (t.endsWith('.md')) return 'markdown'
  if (t.endsWith('.vue')) return 'html'
  if (t.endsWith('.go')) return 'go'
  if (t.endsWith('.rs')) return 'rust'
  if (t.endsWith('.php')) return 'php'
  return 'plaintext'
})

// Lifecycle: Fetch Data
onMounted(async () => {
  if (!user.value) {
    navigateTo('/login')
    return
  }

  const id = route.params.id as string
  const data = await getItem(id)
  
  if (!data) {
    navigateTo('/dashboard')
    return
  }

  // Security check
  if (data.userId !== user.value.uid) {
    navigateTo('/dashboard')
    return
  }

  item.value = data
  itemTitle.value = data.title
  isPublic.value = data.is_public
  type.value = data.type

  if (data.type === 'password') {
    itemContent.value = getDecryptedPassword(data.content)
  } else {
    itemContent.value = data.content
  }
})

// Monaco Editor Load
const onEditorLoad = (editor: any) => {
  editorInstance.value = editor
}

// Search Integration
watch(internalSearch, (val) => {
  if (editorInstance.value && val) {
    // Open Monaco's find controller
    editorInstance.value.getAction('actions.find').run()
  }
})

// Auto-save logic
let saveTimeout: any = null

onMounted(() => {
  const saved = localStorage.getItem('pv_auto_save')
  if (saved !== null) autoSaveEnabled.value = saved === 'true'
})

watch(autoSaveEnabled, (val) => {
  localStorage.setItem('pv_auto_save', val.toString())
})

watch([itemContent, itemTitle], () => {
  if (autoSaveEnabled.value) {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveChanges()
    }, 1000)
  }
})

const saveChanges = async () => {
  if (!item.value) return
  isSaving.value = true
  try {
    await updateItem(item.value.id, {
      title: itemTitle.value,
      content: itemContent.value,
      is_public: isPublic.value,
      type: type.value === 'password' ? 'password' : (detectedLanguage.value === 'plaintext' ? 'plain_text' : 'code')
    })
    lastSaved.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

const saveManual = () => {
  saveChanges()
}

const togglePrivacy = () => {
  isPublic.value = !isPublic.value
  if (autoSaveEnabled.value) saveChanges()
}

const copyRawLink = () => {
  const url = `${window.location.origin}/r/${route.params.id}`
  navigator.clipboard.writeText(url)
  showCopyTooltip.value = true
  setTimeout(() => showCopyTooltip.value = false, 2000)
}

useHead({
  title: computed(() => (itemTitle.value || 'Untitled') + ' - Personal Vault'),
  bodyAttrs: {
    class: 'bg-[#020617] text-slate-200'
  }
})
</script>

<style>
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
  background-clip: content-box;
}

/* Shiki output styling */
.shiki-container pre {
  background-color: transparent !important;
  padding: 0;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

input:focus, textarea:focus {
  outline: none;
}
</style>
