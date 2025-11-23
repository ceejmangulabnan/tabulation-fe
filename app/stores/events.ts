interface EventsError {
  message: string
  status?: number
}

interface EventsState {
  events: EventData[] | []
  event: EventData | null
  isLoading: boolean
  isError: boolean
  error: EventsError | null
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    event: null,
    isLoading: false,
    isError: false,
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
    async fetchEvents(): Promise<void> {
      this.isLoading = true
      this.isError = false
      this.error = null

      try {
        const api = useStrapiApi()
        const { data } = await api.get('/events?populate=*')

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
        const { data } = await api.get(`/events?populate=*&filters[id][$eq]=${eventId}`)

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
  },
})
