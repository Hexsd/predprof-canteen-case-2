import { useCallback } from 'react'

const notificationCenter = {
  listeners: [],
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  },
  notify(message, type = 'info') {
    this.listeners.forEach(callback => callback({ message, type, id: Date.now() }))
  }
}

export const useNotification = () => {
  const notify = useCallback((message, type = 'info') => {
    notificationCenter.notify(message, type)
  }, [])

  return { notify, notificationCenter }
}

export default notificationCenter
