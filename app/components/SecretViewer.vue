<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div class="relative w-full max-w-lg glass border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
                <ShieldCheckIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">{{ item?.title || 'Secret Details' }}</h2>
                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-full">Encrypted Vault</span>
              </div>
            </div>
            <button @click="close" class="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white">
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Email Field -->
            <div class="group relative bg-[#0a0f1d] border border-white/5 rounded-3xl p-6 transition-all hover:border-indigo-500/30">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email / Username</label>
              <div class="flex items-center justify-between gap-4">
                <span class="text-lg font-medium text-slate-200 truncate">{{ secretData.email || 'N/A' }}</span>
                <button 
                  @click="copy(secretData.email, 'email')"
                  class="p-2.5 bg-white/5 hover:bg-indigo-600 transition-all rounded-xl group-hover:scale-110"
                >
                  <CopyIcon class="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            <!-- Password Field -->
            <div class="group relative bg-[#0a0f1d] border border-white/5 rounded-3xl p-6 transition-all hover:border-indigo-500/30">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Security Key</label>
              <div class="flex items-center justify-between gap-4">
                <span class="text-lg font-mono font-bold tracking-tight text-white transition-all duration-300">
                  {{ showPassword ? secretData.password : '••••••••••••' }}
                </span>
                <div class="flex items-center gap-2">
                  <button 
                    @click="showPassword = !showPassword"
                    class="p-2.5 bg-white/5 hover:bg-indigo-600 transition-all rounded-xl"
                  >
                    <EyeIcon v-if="!showPassword" class="w-4 h-4 text-slate-400" />
                    <EyeOffIcon v-else class="w-4 h-4 text-white" />
                  </button>
                  <button 
                    @click="copy(secretData.password, 'password')"
                    class="p-2.5 bg-white/5 hover:bg-indigo-600 transition-all rounded-xl"
                  >
                    <CopyIcon class="w-4 h-4 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes Field -->
            <div v-if="secretData.notes" class="bg-[#0a0f1d] border border-white/5 rounded-3xl p-6">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Private Notes</label>
              <p class="text-sm text-slate-400 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                {{ secretData.notes }}
              </p>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button 
              @click="$emit('edit', item)"
              class="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2"
            >
              <Edit2Icon class="w-4 h-4" /> Edit Secret
            </button>
          </div>
          
          <!-- Copy Notification Toast -->
          <Transition name="slide-up">
            <div v-if="copyToast" class="absolute -bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-emerald-600/90 text-white text-xs font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 max-w-[200px] whitespace-nowrap">
              <CheckCircleIcon class="w-4 h-4" /> {{ copyToast }} Copied!
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ShieldCheckIcon, 
  XIcon, 
  CopyIcon, 
  EyeIcon, 
  EyeOffIcon, 
  Edit2Icon,
  CheckCircleIcon
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  item: any
}>()

const emit = defineEmits(['update:modelValue', 'edit'])

const showPassword = ref(false)
const copyToast = ref('')

const secretData = computed(() => {
  if (!props.item?.content) return { email: '', password: '', notes: '' }
  try {
    return JSON.parse(props.item.content)
  } catch (e) {
    // Legacy support
    return { email: '', password: props.item.content, notes: '' }
  }
})

const close = () => {
  emit('update:modelValue', false)
  showPassword.value = false
}

const copy = (val: string, label: string) => {
  if (!val) return
  navigator.clipboard.writeText(val)
  copyToast.value = label.charAt(0).toUpperCase() + label.slice(1)
  setTimeout(() => copyToast.value = '', 2000)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
