<template>
  <div class="min-h-screen pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-40 w-full glass border-b border-white/5 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="bg-indigo-600 p-2 rounded-lg">
            <LockIcon class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-xl font-bold hidden sm:block">Personal Vault</h1>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="user" class="flex items-center gap-3 pr-4 border-r border-white/10 hidden md:flex">
            <div class="text-right">
              <p class="text-xs text-slate-400">Welcome,</p>
              <p class="text-sm font-medium">{{ username || user.displayName || user.email?.split('@')[0] }}</p>
            </div>
            <img :src="user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid" class="w-10 h-10 rounded-full border border-white/10" />
          </div>
          <button @click="logout" class="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-red-400 transition-colors">
            <LogOutIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Toolbar -->
      <div class="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <button 
            v-for="type in filterTypes" 
            :key="type.value"
            @click="activeFilter = type.value"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all mb-1 md:mb-0',
              activeFilter === type.value 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            ]"
          >
            {{ type.label }}
          </button>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative flex-grow md:w-64">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search items..." 
              class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <button 
            @click="showForm = true; isEdit = false; selectedItem = null"
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            <PlusIcon class="w-5 h-5" />
            New Item
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-50">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 mb-4"></div>
        <p>Loading your vault...</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl p-10">
        <div class="bg-white/5 p-6 rounded-3xl mb-4">
          <GalleryHorizontalIcon class="w-12 h-12 text-slate-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-300">No items found</h3>
        <p class="text-slate-500 max-w-xs mt-2">Start by creating your first snippet, note, or secure password.</p>
        <button 
          @click="showForm = true; isEdit = false"
          class="mt-6 text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2"
        >
          <PlusIcon class="w-4 h-4" /> Create Item
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <VaultItemCard 
          v-for="item in filteredItems" 
          :key="item.id" 
          :item="item" 
          @edit="handleEdit"
          @delete="handleDeleteRequest"
          @copy="handleCopyPassword"
          @view="handleView"
        />
      </div>
    </main>

    <VaultItemForm 
      v-model="showForm"
      :isEdit="isEdit"
      :initialData="selectedItem"
      :loading="submitting"
      @save="handleSave"
    />

    <SecretViewer 
      v-model="showSecretViewer"
      :item="selectedItem"
      @edit="handleEditFromViewer"
    />

    <ConfirmModal 
      v-model="showConfirmModal"
      title="Delete Vault Item?"
      message="This action is permanent and cannot be reversed. The item will be gone forever from your vault."
      @confirm="handleConfirmDelete"
    />

    <!-- Toast Mockup -->
    <Teleport to="body">
      <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
        <CheckCircleIcon class="w-5 h-5 text-emerald-400" />
        <span class="text-sm font-medium">{{ toast }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { 
  LockIcon, 
  LogOutIcon, 
  PlusIcon, 
  SearchIcon, 
  GalleryHorizontalIcon, 
  CheckCircleIcon,
  UserIcon
} from 'lucide-vue-next'

import { ref, computed, watch, onMounted } from 'vue'

const { user, logout, username } = useAuth()
const { items, loading, addItem, updateItem, deleteItem, getDecryptedPassword } = useVault()

const activeFilter = ref('all')
const searchQuery = ref('')
const showForm = ref(false)
const showView = ref(false)
const showSecretViewer = ref(false)
const showConfirmModal = ref(false)
const pendingDeleteId = ref<string | null>(null)
const isEdit = ref(false)
const selectedItem = ref<any>(null)
const currentDecryptedPassword = ref('')
const submitting = ref(false)
const toast = ref('')

const filterTypes = [
  { label: 'All Items', value: 'all' },
  { label: 'Account', value: 'account' },
  { label: 'Email', value: 'email' },
  { label: 'Passwords', value: 'password' },
  { label: 'Text', value: 'plain_text' },
  { label: 'Code', value: 'code' }
]

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesFilter = activeFilter.value === 'all' || item.type === activeFilter.value
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         (item.type !== 'password' && item.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesFilter && matchesSearch
  })
})

const isSecretType = (type: string) => ['account', 'email', 'password'].includes(type)

const handleEdit = (item: any) => {
  const type = (item.type || '').toLowerCase().trim()
  const isSecret = isSecretType(type)
  
  if (isSecret && item.content?.startsWith('U2FsdGVkX1')) {
    const decryptedContent = getDecryptedPassword(item.content)
    selectedItem.value = { ...item, content: decryptedContent }
  } else {
    selectedItem.value = { ...item }
  }
  
  isEdit.value = true
  showForm.value = true
}

const handleEditFromViewer = (item: any) => {
  showSecretViewer.value = false
  handleEdit(item)
}

const handleView = (item: any) => {
  const type = (item.type || '').toLowerCase().trim()
  const isSecret = isSecretType(type)
  
  if (isSecret) {
    const decryptedContent = item.content?.startsWith('U2FsdGVkX1') 
      ? getDecryptedPassword(item.content) 
      : item.content
    selectedItem.value = { ...item, content: decryptedContent }
    showSecretViewer.value = true
  } else if (type === 'code' || type === 'plain_text' || type === 'text') {
    selectedItem.value = item
    navigateTo('/vault/' + item.id)
  } else {
    console.warn('[Vault] Unknown type, defaulting to popup for safety:', type)
    const decryptedContent = item.content?.startsWith('U2FsdGVkX1') 
      ? getDecryptedPassword(item.content) 
      : item.content
    selectedItem.value = { ...item, content: decryptedContent }
    showSecretViewer.value = true
  }
}

const handleDeleteRequest = (id: string) => {
  pendingDeleteId.value = id
  showConfirmModal.value = true
}

const handleConfirmDelete = async () => {
  if (!pendingDeleteId.value) return
  try {
    await deleteItem(pendingDeleteId.value)
    showToast('Item deleted successfully')
  } catch (e) {
    console.error(e)
    alert('Failed to delete item')
  } finally {
    showConfirmModal.value = false
    pendingDeleteId.value = null
  }
}

const handleSave = async (data: any) => {
  submitting.value = true
  try {
    if (isEdit.value && selectedItem.value?.id) {
      await updateItem(selectedItem.value.id, data)
      showToast('Item updated')
    } else {
      await addItem(data)
      showToast('Item created')
    }
    showForm.value = false
  } catch (e) {
    console.error(e)
    alert('Failed to save item')
  } finally {
    submitting.value = false
  }
}

const handleCopyPassword = (item: any) => {
  const decrypted = getDecryptedPassword(item.content)
  let textToCopy = decrypted
  
  if (isSecretType(item.type)) {
    try {
      const secret = JSON.parse(decrypted)
      textToCopy = secret.password || decrypted
    } catch (e) {
      // Fallback to full decrypted content
    }
  }
  
  navigator.clipboard.writeText(textToCopy)
  showToast('Password copied to clipboard')
}

const showToast = (msg: string) => {
  toast.value = msg
  setTimeout(() => toast.value = '', 3000)
}

// Protected route logic
onMounted(() => {
  if (!user.value) navigateTo('/login')
})

watch(user, (u) => {
  if (!u) navigateTo('/login')
})
</script>
