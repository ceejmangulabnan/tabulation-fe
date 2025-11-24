interface JudgeRequestsState {
  judgeRequests: JudgeRequestData[] | []
  allJudgeRequests: JudgeRequestData[] | []
  isLoading: boolean
  isError: boolean
}
export const useJudgeRequestsStore = defineStore('judge-requests', {
  state: (): JudgeRequestsState => ({
    judgeRequests: [],
    allJudgeRequests: [],
    isLoading: false,
    isError: false,
  }),
  actions: {
    async fetchJudgeRequests(judgeId: number): Promise<void> {
      this.isLoading = true
      this.isError = false
      try {
        const api = useStrapiApi()
        const { data } = await api.get(
          `judge-requests?populate=*&filters[judge][id][$eq]=${judgeId}`
        )
        this.judgeRequests = data?.data || []
      } catch (error) {
        console.log('Failed to fetch judge requests', error)
        this.isError = true
      } finally {
        this.isLoading = false
      }
    },
    async fetchAllJudgeRequests(): Promise<void> {
      this.isLoading = true
      this.isError = false
      try {
        const api = useStrapiApi()
        const { data } = await api.get(`judge-requests?populate=*`)
        this.allJudgeRequests = data?.data || []
      } catch (error) {
        console.log('Failed to fetch judge requests', error)
        this.isError = true
      } finally {
        this.isLoading = false
      }
    },
    async updateJudgeRequest(id: string, payload: Partial<JudgeRequestData>): Promise<boolean> {
      this.isLoading = true
      this.isError = false
      try {
        const api = useStrapiApi()
        await api.put(`judge-requests/${id}`, { data: payload })
        return true
      } catch (error) {
        console.log('Failed to update judge request', error)
        this.isError = true
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})
