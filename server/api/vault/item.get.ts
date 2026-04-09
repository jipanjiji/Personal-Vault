export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'vault_uid')
  const token = getCookie(event, 'vault_token')
  const { id } = getQuery(event)
  
  if (!uid || !token || !id) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Unauthorized or missing Item ID' 
    })
  }

  const config = useRuntimeConfig()
  const projectId = config.firebaseProjectId
  
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/items/${id}`
    const doc: any = await $fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const fields = doc.fields
    
    // 1. Security check: Ensure UID matches owner
    if (fields.userId?.stringValue !== uid) {
      throw createError({ 
        statusCode: 403, 
        statusMessage: 'Access Denied: You do not own this item.' 
      })
    }

    const val = (f: any) => f?.stringValue ?? f?.booleanValue ?? f?.integerValue

    return {
      id: doc.name.split('/').pop(),
      title: val(fields.title),
      content: val(fields.content),
      type: val(fields.type),
      is_public: val(fields.is_public),
      userId: val(fields.userId),
      createdAt: doc.createTime
    }
  } catch (e: any) {
    console.error('[API] Fetch Item Error:', e.message)
    throw createError({ 
      statusCode: e.statusCode || 500, 
      statusMessage: e.statusMessage || 'Failed to fetch item' 
    })
  }
})
