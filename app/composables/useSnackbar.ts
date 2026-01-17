const snackbar = reactive({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
})

export function useSnackbar() {
  function showSnackbar(message: string, color: string = 'info', timeout: number = 5000) {
    snackbar.show = true
    snackbar.message = message
    snackbar.color = color
    snackbar.timeout = timeout
  }

  return { snackbar, showSnackbar }
}
