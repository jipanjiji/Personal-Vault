export default defineEventHandler(async (event) => {
  const uid = getCookie(event, 'vault_uid')
  const token = getCookie(event, 'vault_token')
  
  if (!uid || !token) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Unauthorized. Please login again.' 
    })
  }

  const config = useRuntimeConfig()
  const projectId = config.firebaseProjectId
  
  try {
    // Firestore REST API runQuery to filter items by userId
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`
    
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'items' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'userId' },
            op: 'EQUAL',
            value: { stringValue: uid }
          }
        },
        // Optional: you can add orderBy here if you have an index
        // But runQuery requires indexes for ordering
      }
    }

    const response: any = await $fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      body: queryBody
    })

    // 2. Parse Firestore REST format to clean JSON
    // Firestore REST returns an array of { document: { name, fields, ... } }
    if (!Array.isArray(response)) return []

    const items = response
      .map((item: any) => {
        const doc = item.document
        if (!doc) return null
        
        const fields = doc.fields
        const id = doc.name.split('/').pop()
        
        // Helper to extract value regardless of type
        const val = (f: any) => {
          if (!f) return undefined
          return f.stringValue ?? f.booleanValue ?? f.integerValue ?? f.doubleValue
        }

        return {
          id,
          title: val(fields.title),
          content: val(fields.content),
          type: val(fields.type),
          is_public: val(fields.is_public),
          userId: val(fields.userId),
          createdAt: doc.createTime // Use firestore creation time
        }
      })
      .filter(item => item !== null)

    return items
    
  } catch (e: any) {
    console.error('[API] Vault List Error:', e.message)
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Failed to fetch vault items'
    })
  }
})
