export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = {
    projectId: 'personal-vault-4d1fd' // Diambil dari config kamu
  }

  try {
    // Ambil data langsung dari Firestore REST API agar tidak perlu setup Admin SDK yang berat
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/items/${id}`
    const response: any = await $fetch(url).catch(() => null)

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found'
      })
    }

    const fields = response.fields
    const isPublic = fields.is_public?.booleanValue
    const type = fields.type?.stringValue
    const content = fields.content?.stringValue

    // Hanya izinkan akses jika publik dan bukan password
    if (isPublic && type !== 'password') {
      // Set header agar browser/tool membaca ini sebagai teks murni
      setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      setResponseHeader(event, 'Access-Control-Allow-Origin', '*') // Izinkan diakses dari mana saja (seperti raw gist)
      
      return content
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'This item is private'
      })
    }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Server Error'
    })
  }
})
