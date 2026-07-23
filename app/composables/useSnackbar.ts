export function useSnackbar() {
  const toast = useToast()

  function showSnackbar(message: string, color: string = 'info', _timeout: number = 5000) {
    toast.add({
      title: message,
      color: color as 'error' | 'success' | 'warning' | 'info' | 'primary',
    })
  }

  return { showSnackbar }
}
