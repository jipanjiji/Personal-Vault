<template>
  <div class="glass rounded-2xl p-5 hover:border-indigo-500/30 transition-all group flex flex-col h-full cursor-pointer" @click="handleCardClick">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
          <div :class="[
            'p-2 rounded-lg',
            item.type === 'code' ? 'bg-blue-500/10 text-blue-400' : 
            item.type === 'account' ? 'bg-emerald-500/10 text-emerald-400' :
            item.type === 'email' ? 'bg-indigo-500/10 text-indigo-400' :
            item.type === 'password' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
          ]">
            <CodeIcon v-if="item.type === 'code'" class="w-5 h-5" />
            <UserIcon v-else-if="item.type === 'account'" class="w-5 h-5" />
            <MailIcon v-else-if="item.type === 'email'" class="w-5 h-5" />
            <LockIcon v-else-if="item.type === 'password'" class="w-5 h-5" />
            <FileTextIcon v-else class="w-5 h-5" />
          </div>
        <div>
          <h3 class="font-semibold text-slate-100 line-clamp-1">{{ item.title }}</h3>
          <p class="text-xs text-slate-500 uppercase tracking-wider">{{ item.type.replace('_', ' ') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <span v-if="item.is_public" class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">PUBLIC</span>
        <span v-else class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-white/5">PRIVATE</span>
      </div>
    </div>

    <div class="flex-grow bg-slate-900/40 rounded-xl p-3 mb-4 font-mono text-sm overflow-hidden relative">
      <div v-if="isSecretType" class="flex items-center justify-between">
        <span class="text-slate-500">••••••••</span>
        <button @click="$emit('copy', item)" class="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-indigo-400">
          <CopyIcon class="w-4 h-4" />
        </button>
      </div>
      <div v-else class="line-clamp-4 text-slate-400 break-all">
        {{ item.content }}
      </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-white/5">
      <div class="flex gap-1">
        <button 
          v-if="item.type !== 'password' && item.is_public"
          @click.stop="openRaw"
          class="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          title="View Raw"
        >
          <ExternalLinkIcon class="w-4 h-4" />
        </button>
        <button 
          v-if="item.type !== 'password' && item.is_public"
          @click.stop="copyLink"
          class="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          title="Copy Raw Link"
        >
          <LinkIcon class="w-4 h-4" />
        </button>
      </div>
      <div class="flex gap-2">
        <button @click.stop="$emit('edit', item)" class="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-indigo-400 transition-all">
          <Edit2Icon class="w-4 h-4" />
        </button>
        <button @click.stop="$emit('delete', item.id)" class="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-all">
          <Trash2Icon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  FileTextIcon, 
  CodeIcon, 
  LockIcon as KeyIcon, 
  CopyIcon, 
  Edit2Icon, 
  Trash2Icon, 
  LinkIcon, 
  ExternalLinkIcon,
  UserIcon,
  MailIcon,
  LockIcon
} from 'lucide-vue-next'

import { ref, computed } from 'vue'

const props = defineProps<{
  item: any
}>()

const emit = defineEmits(['edit', 'delete', 'copy', 'view'])

const isSecretType = computed(() => ['account', 'email', 'password'].includes(props.item.type))

const handleCardClick = () => {
  const type = (props.item?.type || '').toLowerCase().trim()
  console.log('[Vault] Card Clicked Type:', type, props.item.id)
  
  if (isSecretType.value) {
    emit('view', props.item)
  } else {
    navigateTo(`/vault/${props.item.id}`)
  }
}

const openRaw = () => {
  window.open(`/raw/${props.item.id}`, '_blank')
}

const copyLink = () => {
  const url = `${window.location.origin}/raw/${props.item.id}`
  navigator.clipboard.writeText(url)
  // Maybe add a toast here
}
</script>
