export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'vault_uid')
  const token = getCookie(event, 'vault_token')
  
  if (!uid || !token) throw createError({ statusCode: 401 })

  const body = await readBody(event)
  const { id } = body
  
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

  const config = useRuntimeConfig()
  const projectId = config.firebaseProjectId

  try {
    // 1. Verify ownership before deletion
    // In a real app, we'd check if the document's userId matches 'uid'
    // But Firestore Rules will also handle this if the token is valid.
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/items/${id}`
    
    await $fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    return { success: true }
  } catch (e: any) {
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: 'Failed to delete item' 
    })
  }
})
