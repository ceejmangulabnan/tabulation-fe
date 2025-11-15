interface EventsState {
  events: EventData[] | null
  isLoading: boolean
  isError: boolean
  error: unknown
}
export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: null as EventData[] | null,
    isLoading: false,
    isError: false,
    error: null,
  }),
  actions: {
    async fetchEvents(): Promise<void> {
      try {
        const api = useStrapiApi()
        const response = await api.get('/events?populate=*')
        this.isLoading = true

        this.events = await response.data
      } catch (error) {
        console.error('Failed to fetch events', error)
        this.error = error
        this.isError = true
      } finally {
        this.isLoading = false
      }
    },
  },
})
