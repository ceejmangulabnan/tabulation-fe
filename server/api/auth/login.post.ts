export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const response = await $fetch<StrapiAuthResponse>('http://localhost:1337/api/auth/local', {
    method: 'POST',
    body,
  })

  if (!response.jwt || !response.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  if (response) {
    await setUserSession(event, {
      user: {
        id: response.user.id,
        documentId: response.user.documentId,
        email: response.user.email,
        username: response.user.username,
        confirmed: response.user.confirmed,
        provider: response.user.provider,
        blocked: response.user.blocked,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      },
      secure: {
        jwt: response.jwt,
      },
      loggedInAt: new Date(),
    })
    console.log('Login Response', response)
    return response
  }
})
