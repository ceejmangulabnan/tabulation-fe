interface EventsError {
  message: string
  status?: number
}

interface EventsState {
  events: EventData[] | null
  isLoading: boolean
  isError: boolean
  error: EventsError | null
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: null,
    isLoading: false,
    isError: false,
    error: null,
  }),

  actions: {
    async fetchEvents(): Promise<void> {
      this.isLoading = true
      this.isError = false
      this.error = null

      try {
        const api = useStrapiApi()
        const { data } = await api.get('/events?populate=*')

        this.events = data?.data || null
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
  },
})
