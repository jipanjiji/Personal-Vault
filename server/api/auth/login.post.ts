export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body
  
  const config = useRuntimeConfig()
  const apiKey = config.firebaseApiKey
  const projectId = config.firebaseProjectId
  const WHITELISTED_EMAIL = config.whitelistEmail

  try {
    // 1. Fetch email from username mapping in Firestore
    const usernameUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/usernames/${identifier.toLowerCase()}`
    const userDoc: any = await $fetch(usernameUrl).catch(() => null)
    
    if (!userDoc) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Username not found. Please register first.' 
      })
    }

    const email = userDoc.fields.email.stringValue

    // 2. Sign in with Firebase Auth REST API
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
    const authData: any = await $fetch(authUrl, {
      method: 'POST',
      body: { 
        email, 
        password, 
        returnSecureToken: true 
      }
    })

    // 3. Security Whitelist Check
    if (authData.email !== WHITELISTED_EMAIL) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied. Unauthorized account.'
      })
    }

    // 4. Set Session Cookies
    // Store token for server-side auth in other routes
    setCookie(event, 'vault_token', authData.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    // Store UID for easy access
    setCookie(event, 'vault_uid', authData.localId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 
    })

    return {
      uid: authData.localId,
      email: authData.email,
      username: identifier
    }
    
  } catch (e: any) {
    if (e.data?.error?.message === 'INVALID_PASSWORD' || e.data?.error?.message === 'EMAIL_NOT_FOUND') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username or password'
      })
    }
    
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Internal Authentication Error'
    })
  }
})
