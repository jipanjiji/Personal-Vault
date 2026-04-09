export default defineEventHandler(async (event) => {
  // Clear the session cookies
  deleteCookie(event, 'vault_token')
  deleteCookie(event, 'vault_uid')
  
  return { success: true }
})
