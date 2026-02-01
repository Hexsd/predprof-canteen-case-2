import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { useNotification } from '../../hooks/useNotification'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()
  const { notify } = useNotification()
  const [subscription, setSubscription] = useState(null)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [daysInput, setDaysInput] = useState('7')
  const [isLoading, setIsLoading] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')

  const SUBSCRIPTION_PRICE_PER_DAY = 300

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSubscriptionStatus()
    }
  }, [user])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/users/subscription/status')
      setSubscription(response.data)
      setSubscriptionActive(response.data.is_active)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }
  const handleBuySubscription = async () => {
    if (!daysInput || parseInt(daysInput) <= 0) {
      notify('Введите корректное количество дней', 'error')
      return
    }

    const days = parseInt(daysInput)
    const price = days * SUBSCRIPTION_PRICE_PER_DAY

    if (user.balance < price) {
      notify(`Недостаточно средств. Нужно ${price} ₽, у вас ${user.balance} ₽`, 'error')
      return
    }

    setIsLoading(true)
    try {
      await axios.post('/api/users/subscription/buy', { days })
      notify(`Абонемент на ${days} дней куплен!`, 'success')
      fetchSubscriptionStatus()
      setDaysInput('7')
      window.location.reload()
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при покупке', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  const handleBalanceUp = async () => {
    if (!balanceInput || parseInt(balanceInput) <= 0) {
      notify('Введите корректную сумму', 'error')
      return
    }

    const amount = parseInt(balanceInput)
    setIsLoading(true)
    try {
      await axios.post('/api/users/balance/up', { amount })
      notify(`Баланс пополнен на ${amount} ₽`, 'success')
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при пополнении баланса', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" />
  }

  const getRoleName = (role) => {
    const roles = {
      student: 'Ученик',
      cook: 'Повар',
      admin: 'Администратор'
    }
    return roles[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      student: 'blue',
      cook: 'green',
      admin: 'red'
    }
    return colors[role] || 'gray'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }

  return (
    <div>
      <h2 className="page-title"> Профиль</h2>
      <div className="user-card">
        <h3>Имя</h3>
        <div className="user-name">{user.name}</div>
        <h3>Статус</h3>
        <div className="user-role">{getRoleName(user.role)}</div>
        <h3>Почта</h3>
        <div className="user-email">{user.email}</div>
        <h3>Дата рождения</h3>
        <div className="user-date">{formatDate(user.birth_date)}</div>
        {user.role === 'student' && (
          <>
            <h3>Баланс кошелька</h3>
            <div className="user-balance">{user.balance} ₽</div>
            <div className="balance-up">
              <h3>Введите сумму для пополнения баланса</h3>
              <input
                id="balance"
                type="number"
                min="100"
                max="10000"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="balance-input"
                disabled={isLoading}
                />
              <button onClick={handleBalanceUp} className="btn-balance-up">
                Пополнить баланс
              </button>
            </div>
            <div className="subscription-section">
              <h3>Абонемент</h3>
              {subscriptionActive && subscription.subscription ? (
                <div className="subscription-active">
                  <div className="subscription-status">
                    Активен
                  </div>
                  <div className="subscription-details">
                    <p>Осталось дней: <strong>{subscription.days_remaining}</strong></p>
                    <p>Действует до: <strong>{formatDate(subscription.subscription.end_date)}</strong></p>
                  </div>
                </div>
              ) : (
                <div className="subscription-inactive">
                  <p className="subscription-status-text">Абонемент не активен</p>
                  <p className="subscription-description">Купите абонемент и получайте завтрак и обед бесплатно!</p>
                  
                  <div className="subscription-form">
                    <div className="form-group">
                      <label htmlFor="days">Количество дней:</label>
                      <button
                        onClick={() => setDaysInput('7')}
                        className="preset-days-btn"
                      >
                        7 дней
                      </button>
                      <button
                        onClick={() => setDaysInput('30')}
                        className="preset-days-btn"
                      >
                        30 дней
                      </button>
                    </div>
                    <div className="price-display">
                      <span>Стоимость: </span>
                      <strong>{parseInt(daysInput || 0) * SUBSCRIPTION_PRICE_PER_DAY} ₽</strong>
                      <span> ({SUBSCRIPTION_PRICE_PER_DAY} ₽/день)</span>
                    </div>
                    <button
                      onClick={handleBuySubscription}
                      className="buy-subscription-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Обработка...' : 'Купить абонемент'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}