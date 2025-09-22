export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return await $fetch('http://localhost:1337/api/auth/local/register', {
    method: 'POST',
    body,
  })
})
