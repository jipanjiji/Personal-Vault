<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>
    
    <!-- Modal -->
    <div class="relative w-full max-w-2xl glass rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">{{ isEdit ? 'Edit Item' : 'Create New Item' }}</h2>
        <button @click="$emit('update:modelValue', false)" class="p-2 hover:bg-white/5 rounded-full transition-colors">
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Column: Primary Config -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input 
                v-model="form.title" 
                type="text" 
                required
                class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
                placeholder="e.g. My Website Login"
              />
            </div>
            
            <div class="space-y-4">
              <CustomDropdown 
                v-model="form.type"
                label="Item Type"
                :options="typeOptions"
              />
              
              <div v-if="form.type === 'code'">
                <label class="block text-sm font-medium text-slate-300 mb-1">Programming Language</label>
                <input 
                  v-model="form.language" 
                  type="text" 
                  class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="javascript, python..."
                />
              </div>

              <div v-if="form.type === 'password'" class="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in duration-500">
                <div class="flex items-center gap-2 text-indigo-400 mb-1">
                  <ShieldAlertIcon class="w-4 h-4" />
                  <span class="text-[10px] font-bold uppercase tracking-wider">Secure Storage</span>
                </div>
                <p class="text-[10px] text-slate-500 italic">This data is end-to-end encrypted.</p>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2" v-if="form.type !== 'password'">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.is_public" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white text-white"></div>
              </label>
              <span class="text-sm font-medium text-slate-300">Share Publicly</span>
            </div>
          </div>

          <!-- Right Column: Context/Secrets -->
          <div class="space-y-6">
            <div v-if="form.type === 'password'" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Email / Username</label>
                <input 
                  v-model="form.email" 
                  type="text" 
                  class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                  placeholder="alvin@example.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input 
                  v-model="form.secretPassword" 
                  type="password" 
                  class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">
                {{ form.type === 'password' ? 'Notes' : 'Content' }}
              </label>
              <textarea 
                v-model="form.content" 
                :required="form.type !== 'password'"
                :rows="form.type === 'password' ? 6 : 10"
                class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm resize-none custom-scrollbar"
                :placeholder="form.type === 'password' ? 'Additional notes about this account...' : 'Paste your content here...'"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button 
            type="button"
            @click="$emit('update:modelValue', false)"
            class="px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-400"
          >
            Cancel
          </button>
          <button 
            type="submit"
            :disabled="loading"
            class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <SaveIcon v-if="!loading" class="w-5 h-5" />
            <span v-else class="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5"></span>
            {{ isEdit ? 'Update Item' : 'Save Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  XIcon, 
  SaveIcon, 
  FileTextIcon, 
  CodeIcon, 
  ShieldAlertIcon 
} from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  isEdit: boolean
  initialData?: any
  loading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const typeOptions = [
  { 
    label: 'Plain Text', 
    value: 'plain_text', 
    icon: FileTextIcon,
    description: 'Simple notes and text'
  },
  { 
    label: 'Code Snippet', 
    value: 'code', 
    icon: CodeIcon,
    description: 'Syntax-highlighted code'
  },
  { 
    label: 'Secret / Password', 
    value: 'password', 
    icon: ShieldAlertIcon,
    description: 'Hardware-encrypted vault'
  }
]

const form = ref({
  title: '',
  type: 'plain_text',
  content: '',
  language: '',
  is_public: false,
  email: '',
  secretPassword: ''
})

watch(() => props.modelValue, (val) => {
  if (val && props.initialData) {
    const data = { ...props.initialData }
    if (data.type === 'password') {
      try {
        const secret = JSON.parse(data.content)
        form.value = {
          ...data,
          email: secret.email || '',
          secretPassword: secret.password || '',
          content: secret.notes || ''
        }
      } catch (e) {
        // Fallback for old content format
        form.value = {
          ...data,
          email: '',
          secretPassword: data.content,
          content: ''
        }
      }
    } else {
      form.value = {
        ...data,
        email: '',
        secretPassword: ''
      }
    }
  } else if (val) {
    form.value = {
      title: '',
      type: 'plain_text',
      content: '',
      language: '',
      is_public: false,
      email: '',
      secretPassword: ''
    }
  }
})

const handleSubmit = () => {
  const submitData = { ...form.value }
  
  if (submitData.type === 'password') {
    submitData.is_public = false
    // Pack into JSON string
    submitData.content = JSON.stringify({
      email: submitData.email,
      password: submitData.secretPassword,
      notes: submitData.content
    })
  }

  // Clean internal fields before emitting
  const { email, secretPassword, ...finalData } = submitData
  emit('save', finalData)
}
</script>
