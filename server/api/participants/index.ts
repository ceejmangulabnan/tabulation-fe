import type { ApiParticipantParticipant } from '~~/shared/types/contentTypes'

type StrapiCollectionResponse<T extends { attributes: unknown }> = {
  data: {
    id: number
    attribuaaa: T['attributes']
  }[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export default defineEventHandler(
  async (event): Promise<StrapiCollectionResponse<ApiParticipantParticipant>> => {
    const session = await getUserSession(event)
    const config = useRuntimeConfig()
    console.log('Session from /api/participants', session)

    if (!session?.secure?.jwt) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const response = await $fetch<StrapiCollectionResponse<ApiParticipantParticipant>>(
      `${config.public.strapiUrl}/api/participants`,
      {
        headers: {
          Authorization: `Bearer ${session.secure.jwt}`,
        },
      }
    )

    return response
  }
)
