export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { idToken, uid, email } = body
  
  if (!idToken || !uid || !email) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing session data' 
    })
  }

  const config = useRuntimeConfig()
  const WHITELISTED_EMAIL = config.whitelistEmail

  // 1. Security Whitelist Check
  if (email !== WHITELISTED_EMAIL) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied. Unauthorized account.'
    })
  }

  // 2. Set Session Cookies (same as login API)
  setCookie(event, 'vault_token', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 
  })
  
  setCookie(event, 'vault_uid', uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 
  })

  return { success: true }
})
