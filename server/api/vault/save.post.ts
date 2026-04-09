export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'vault_uid')
  const token = getCookie(event, 'vault_token')
  
  if (!uid || !token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const { id, ...itemData } = body
  const config = useRuntimeConfig()
  const projectId = config.firebaseProjectId

  // 1. Prepare Firestore Fields
  // Note: We expect the client to send RAW content, we will NOT encrypt here 
  // because the encryption key (user.uid) is better handled in a consistent way.
  // Actually, for security, let's keep encryption in the composable so it's end-to-end.
  
  const fields: any = {}
  Object.keys(itemData).forEach(key => {
    const val = itemData[key]
    if (typeof val === 'string') fields[key] = { stringValue: val }
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val }
  })

  // Force userId to match the session
  fields.userId = { stringValue: uid }

  try {
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/items`
    let method: 'POST' | 'PATCH' = 'POST'
    
    if (id) {
      // Update existing
      const queryParams = Object.keys(itemData)
        .map(k => `updateMask.fieldPaths=${k}`)
        .join('&')
      url += `/${id}?${queryParams}`
      method = 'PATCH'
    }

    const response: any = await $fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: { fields }
    })
    
    return {
      success: true,
      id: response.name?.split('/').pop() || id
    }
  } catch (e: any) {
    console.error('[API] Save Error:', e.data || e.message)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: 'Failed to save item to vault' 
    })
  }
})
