interface JudgeRequestsState {
  judgeRequests: JudgeRequestData[] | []
  isLoading: boolean
  isError: boolean
}
export const useJudgeRequestsStore = defineStore('judge-requests', {
  state: (): JudgeRequestsState => ({
    judgeRequests: [],
    isLoading: false,
    isError: false,
  }),
  actions: {
    async fetchJudgeRequests(): Promise<void> {
      this.isLoading = true
      this.isError = false
      try {
        const api = useStrapiApi()
        const { data } = await api.get('judge-requests?populate=*')

        this.judgeRequests = data?.data || []
      } catch (error) {
        console.log('Failed to fetch judge requests', error)
        this.isError = true
      } finally {
        this.isLoading = false
      }
    },
  },
})
