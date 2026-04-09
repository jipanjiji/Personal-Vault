import { defineNuxtPlugin } from '#app'
import { useFirebase } from '~/composables/useFirebase'

export default defineNuxtPlugin((nuxtApp) => {
  const { auth } = useFirebase()
  
  // You can add global auth state monitoring here if needed
})
