interface EventsState {
  events: EventData[] | null
  isLoading: boolean
}
export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: null as EventData[] | null,
    isLoading: false,
  }),
  getters: {
    events: (state) => state.events,
  },
  actions: {
    async fetchEvents(): Promise<void> {
      try {
        const api = useStrapiApi()
        const response = await api.get('/events?populate=*')

        this.events = await response.data.data
      } catch (error) {
        console.error('Failed to fetch events', error)
      }
    },
  },
})
