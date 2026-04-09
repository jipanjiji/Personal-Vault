<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 premium-gradient text-white">
    <div class="max-w-md w-full glass rounded-3xl p-8 space-y-8">
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <div class="bg-indigo-500/20 p-4 rounded-2xl">
            <LockIcon class="w-10 h-10 text-indigo-400" />
          </div>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Personal Vault</h1>
        <p class="text-slate-400 mt-2">Securely manage your snippets & secrets</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm antialiased">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Username</label>
          <input 
            v-model="username_input" 
            type="text" 
            class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600 text-white"
            placeholder="Your identifier"
            @keyup.enter="handleLogin"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600 text-white"
            placeholder="••••••••"
            @keyup.enter="handleLogin"
          />
        </div>

        <button 
          @click="handleLogin"
          :disabled="loading_ui"
          class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <span v-if="loading_ui">Locating Vault...</span>
          <span v-else>Open Vault</span>
        </button>
      </div>

      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/5"></div></div>
        <div class="relative flex justify-center text-xs uppercase"><span class="bg-[#0f172a] px-2 text-slate-500 font-medium">Verified Access Only</span></div>
      </div>

      <button 
        @click="handleGoogleLogin"
        class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 duration-200"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" />
        Continue with Google
      </button>

      <div class="text-[10px] text-center text-slate-500 leading-relaxed">
        This is a private instance. Unauthorized access attempts are logged.<br>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LockIcon } from 'lucide-vue-next'

const { loginWithGoogle, loginWithUsername, user } = useAuth()
const username_input = ref('')
const password = ref('')
const loading_ui = ref(false)
const error = ref('')

watch(user, (u) => {
  if (u) {
    console.log('User detected, routing to dashboard...');
    navigateTo('/dashboard');
  }
}, { immediate: true })

const handleLogin = async () => {
  if (!username_input.value || !password.value) {
    error.value = "Please enter both username and password."
    return
  }
  
  error.value = ''
  loading_ui.value = true
  try {
    await loginWithUsername(username_input.value, password.value)
  } catch (e: any) {
    console.error('Login Error:', e.code || e.message);
    error.value = e.message === 'Username not found.' ? 'User not found. Try Google Login first?' : 'Incorrect credentials.'
  } finally {
    loading_ui.value = false
  }
}

const handleGoogleLogin = async () => {
  error.value = ''
  try {
    await loginWithGoogle()
  } catch (e: any) {
    console.error('Google Auth Failed:', e.message);
    error.value = e.message
  }
}
</script>

<style scoped>
.premium-gradient {
  background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
}
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
