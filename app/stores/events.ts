import { defineStore } from 'pinia'

interface EventsError {
  message: string
  status?: number
}

interface EventsState {
  events: EventData[] | []
  event: EventData | null
  newEvent: EventData | null
  isLoading: boolean
  isSubmitting: boolean
  isError: boolean
  error: EventsError | null
}

type FetchEventsParams = {
  populate?: {
    judges?: boolean
    scores?: boolean
    judge_requests?: boolean
    segments?: {
      populate?: {
        categories?: boolean
      }
    }
  }
}

function buildPopulateQuery(populate?: FetchEventsParams['populate']) {
  if (!populate) return ''

  const params: string[] = []

  if (populate.judges) {
    params.push('populate[judges]=true')
  }

  if (populate.scores) {
    params.push('populate[scores]=true')
  }

  if (populate.judge_requests) {
    params.push('populate[judge_requests]=true')
  }

  if (populate.segments?.populate?.categories) {
    params.push('populate[segments][populate][categories]=true')
  }

  return params.join('&')
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    event: null,
    newEvent: null,
    isLoading: false,
    isError: false,
    isSubmitting: false,
    error: null,
  }),
  getters: {
    getJudgeEvents: (state) => {
      return (judgeId: number) =>
        state.events?.filter((event) =>
          event.judges?.some((judge: JudgeData) => judge.id === judgeId)
        ) || []
    },
  },
  actions: {
    async fetchEvents(params: FetchEventsParams = {}): Promise<void> {
      this.isLoading = true
      this.isError = false
      this.error = null

      try {
        const api = useStrapiApi()
        const query = buildPopulateQuery(params.populate)

        const url = query ? `/events?${query}` : '/events'
        const { data } = await api.get(url)

        this.events = data?.data || []
      } catch (err: any) {
        console.error('Failed to fetch events:', err)

        this.isError = true

        this.error = {
          message: err?.response?.data?.error?.message || err?.message || 'Unknown error',
          status: err?.response?.status,
        }
      } finally {
        this.isLoading = false
      }
    },

    // Fetch event by id
    async fetchEvent(eventId: string): Promise<void> {
      this.isLoading = true
      this.isError = false
      this.error = null

      if (!eventId) {
        throw Error('Invalid Event ID')
      }

      try {
        const api = useStrapiApi()
        const { data } = await api.get(
          `/events?filters[id][$eq]=${eventId}&populate[participants][populate][headshot]=true&populate[participants][populate][department]=true&populate[participants][populate][eliminated_at_segment]=true&populate[judges][populate][users_permissions_user][fields]=email&populate[scores][populate][category]=true&populate[scores][populate][judge]=true&populate[scores][populate][segment]=true&populate[scores][populate][participant]=true&populate[judge_requests]=true&populate[segments][populate][categories][populate][active_judges]=true`
        )

        this.event = data?.data[0] || {}
      } catch (err: any) {
        console.error('Failed to fetch events:', err)

        this.isError = true

        this.error = {
          message: err?.response?.data?.error?.message || err?.message || 'Unknown error',
          status: err?.response?.status,
        }
      } finally {
        this.isLoading = false
      }
    },

    // Admin Create Event Basic
    async createEvent(createEventData: { name: string; description: string }) {
      const api = useStrapiApi()
      try {
        this.isLoading = true
        this.isSubmitting = true
        const payload = {
          data: {
            name: createEventData.name,
            description: createEventData.description,
          },
        }
        const response = await api.post(`/events`, payload)
        console.log('Admin Create Event Response', response)
        this.newEvent = response.data.data
        return response
      } catch (error: any) {
        console.error('Failed to create event', error)

        this.isError = true
        this.error = {
          message: error?.response?.data?.error?.message || error?.message || 'Unknown error',
          status: error?.response?.status,
        }
      } finally {
        this.isLoading = false
        this.isSubmitting = false
      }
    },
    clearNewEvent() {
      this.newEvent = null
    },
  },
})
