import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'

export default function Index() {
  const [menu, setMenu] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const { user } = useAuth()

  const BREAKFAST_PRICE = 50
  const LUNCH_PRICE = 100

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/index')
      setMenu(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const handleBuyBreakfast = async () => {
    if (!user) return
    if (user.role !== 'student') {
      setMessageType('error')
      setMessage('Только ученики могут покупать завтрак')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    
    if (user.balance < BREAKFAST_PRICE) {
      setMessageType('error')
      setMessage(`Недостаточно средств. Необходимо ${BREAKFAST_PRICE} ₽, у вас ${user.balance} ₽`)
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const response = await axios.post('/api/users/buy/breakfast')
      setMessageType('success')
      setMessage(`Завтрак куплен! Баланс: ${response.data.balance} ₽`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.detail || 'Ошибка при покупке')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleBuyLunch = async () => {
    if (!user) return
    if (user.role !== 'student') {
      setMessageType('error')
      setMessage('Только ученики могут покупать обед')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    
    if (user.balance < LUNCH_PRICE) {
      setMessageType('error')
      setMessage(`Недостаточно средств. Необходимо ${LUNCH_PRICE} ₽, у вас ${user.balance} ₽`)
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const response = await axios.post('/api/users/buy/lunch')
      setMessageType('success')
      setMessage(`Обед куплен! Баланс: ${response.data.balance} ₽`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.detail || 'Ошибка при покупке')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!menu) {
    return <div className="loading">Меню на сегодня не найдено.</div>
  }

  return (
    <div>
      <h2 className="page-title">Меню столовой</h2>
      
      {message && (
        <div className={`message message-${messageType}`}>
          {message}
        </div>
      )}

      {user?.role === 'student' && (
        <div className="user-balance-display">
          Ваш баланс: <strong>{user.balance} ₽</strong>
        </div>
      )}

      <div className="menu-container">
        <div className="menu-section">
          <h3>Завтрак</h3>
          <ul className="menu-list">
            {menu.breakfast.split('#').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          {user?.role === 'student' && (
            <button 
              onClick={handleBuyBreakfast}
              className="buy-button"
            >
              Купить завтрак - {BREAKFAST_PRICE} ₽
            </button>
          )}
        </div>

        <div className="menu-section">
          <h3>Обед</h3>
          <ul className="menu-list">
            {menu.lunch.split('#').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          {user?.role === 'student' && (
            <button 
              onClick={handleBuyLunch}
              className="buy-button"
            >
              Купить обед - {LUNCH_PRICE} ₽
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
