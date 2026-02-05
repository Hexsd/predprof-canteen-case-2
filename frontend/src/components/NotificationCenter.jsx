import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../pages/auth/AuthContext'
import notificationCenter from '../hooks/useNotification'
import logger from '../utils/logger'
import '../styles/notification-center.css'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const { token } = useAuth()
  const ws = React.useRef(null)
  const reconnectAttempts = React.useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeout = React.useRef(null)

  const connectWebSocket = () => {
    if (!token) return
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws?token=${encodeURIComponent(token)}`

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      reconnectAttempts.current = 0
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addNotification(data.message, data.type || 'info')
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error)
      }
    }

    ws.current.onerror = (error) => {
      logger.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
        reconnectTimeout.current = setTimeout(connectWebSocket, delay)
      }
    }
  }

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        try {
          ws.current.close()
        } catch (e) {
          // ignore
        }
        ws.current = null
      }
    }
  }, [token])

  useEffect(() => {
    const unsubscribe = notificationCenter.subscribe((notification) => {
      addNotification(notification.message, notification.type)
    })
    return unsubscribe
  }, [])

  const addNotification = useCallback((message, type) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])

    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }, [])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getStyle = (type) => {
    const baseStyle = {
      padding: '20px 30px',
      marginBottom: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      fontSize: '14px',
      maxWidth: '300px',
      wordWrap: 'break-word',
      animation: 'slideIn 0.3s ease-in-out'
    }

    const typeStyles = {
      success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', fontSize: '18px' },
      error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', fontSize: '18px' },
      info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb', fontSize: '18px' },
      warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', fontSize: '18px' }
    }

    return { ...baseStyle, ...typeStyles[type] }
  }

  return (
    <>
      <div className="notification-center">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification-item ${notification.type || 'info'}`} style={{ ['--duration']: '5000ms' }}>
            <div className="nc-content">{notification.message}</div>
            <button className="nc-close" aria-label="Закрыть" onClick={() => removeNotification(notification.id)}>✕</button>
            <div className="nc-progress"><i /></div>
          </div>
        ))}
      </div>
    </>
  )
}
