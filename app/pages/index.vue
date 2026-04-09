<script setup lang="ts">
// Halaman index kosong saja, hanya untuk redirect
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/dashboard')
    }
  ]
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
    <p class="animate-pulse">Loading Vault...</p>
  </div>
</template>
