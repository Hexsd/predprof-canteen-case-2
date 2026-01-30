import React, { useState, useEffect } from 'react'
import { useAuth } from '../pages/auth/AuthContext'
import notificationCenter from '../hooks/useNotification'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const { token } = useAuth()
  const ws = React.useRef(null)
  const reconnectAttempts = React.useRef(0)
  const maxReconnectAttempts = 5

  const connectWebSocket = () => {
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws?token=${token}`
    
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      reconnectAttempts.current = 0
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addNotification(data.message, data.type || 'info')
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
        setTimeout(connectWebSocket, delay)
      }
    }
  }

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [token])

  useEffect(() => {
    const unsubscribe = notificationCenter.subscribe((notification) => {
      addNotification(notification.message, notification.type)
    })
    return unsubscribe
  }, [])

  const addNotification = (message, type) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getStyle = (type) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '4px',
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
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}>
        {notifications.map(notification => (
          <div key={notification.id} style={getStyle(notification.type)}>
            {notification.message}
          </div>
        ))}
      </div>
    </>
  )
}
