import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { useNotification } from '../../hooks/useNotification'
import logger from '../../utils/logger'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()
  const { notify } = useNotification()
  const [subscription, setSubscription] = useState(null)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [daysInput, setDaysInput] = useState('7')
  const [isLoading, setIsLoading] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [alergens, setAlergens] = useState([])
  const [selectedAlergens, setSelectedAlergens] = useState([])
  const [isLoadingAlergens, setIsLoadingAlergens] = useState(false)

  const SUBSCRIPTION_PRICE_PER_DAY = 300

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSubscriptionStatus()
      fetchAlergens()
    }
  }, [user])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/users/subscription/status')
      setSubscription(response.data)
      setSubscriptionActive(response.data.is_active)
    } catch (error) {
      logger.error('Error fetching subscription:', error)
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

  const fetchAlergens = async () => {
    try {
      const response = await axios.get('/api/cook/all')
      setAlergens(response.data[2])
      if (user?.alergens) {
        setSelectedAlergens(user.alergens.split('#').filter(id => id !== ''))
      }
    } catch (error) {
      logger.error('Error fetching alergens:', error)
    }
  }

  const handleAlergenToggle = (alergenId) => {
    setSelectedAlergens(prev => {
      if (prev.includes(String(alergenId))) {
        return prev.filter(id => id !== String(alergenId))
      } else {
        return [...prev, String(alergenId)]
      }
    })
  }

  const handleSaveAlergens = async () => {
    setIsLoadingAlergens(true)
    try {
      const alergenString = selectedAlergens.join('#')
      await axios.put(`/api/personal/${user.id}/alergens`, {
        alergens: alergenString
      })
      notify('Аллергены успешно сохранены', 'success')
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при сохранении аллергенов', 'error')
    } finally {
      setIsLoadingAlergens(false)
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
    <div className="profile-page">
      <h2 className="page-title">Профиль</h2>
      <div className="user-card user-card--full">
        <div className="user-avatar">
          <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>

        <div className="user-main">
          <div className="user-name">{user.name}</div>
          <div className="user-role">{getRoleName(user.role)}</div>
        </div>

        <div className="user-meta">
          <div>
            <div className="user-meta-item-label">Почта</div>
            <div className="user-meta-item-value">{user.email}</div>
          </div>
          <div>
            <div className="user-meta-item-label">Дата рождения</div>
            <div className="user-meta-item-value">
              {formatDate(user.birth_date)}
            </div>
          </div>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="profile-bottom-row">
          <div className="balance-card">
            <div className="balance-card-header">
              <div className="balance-title">Баланс кошелька</div>
              <div className="balance-amount">{user.balance} ₽</div>
            </div>

            <div className="balance-up balance-up--no-border">
              <div className="user-meta-item-label">
                Пополнить баланс
              </div>
              <div className="balance-input-row">
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
                <button
                  onClick={handleBalanceUp}
                  className="btn-balance-up"
                  disabled={isLoading}
                >
                  Пополнить
                </button>
              </div>
            </div>
          </div>

          <div className="subscription-section subscription-section--card">
            <h3>Абонемент</h3>
            {subscriptionActive && subscription?.subscription ? (
              <div className="subscription-active">
                <div className="subscription-status">
                  Активен
                </div>
                <div className="subscription-details">
                  <p>
                    Осталось дней:{' '}
                    <strong>{subscription.days_remaining}</strong>
                  </p>
                  <p>
                    Действует до:{' '}
                    <strong>
                      {formatDate(subscription.subscription.end_date)}
                    </strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="subscription-inactive">
                <p className="subscription-status-text">
                  Абонемент не активен
                </p>
                <p className="subscription-description">
                  Вы можете купить абонемент на определенное количество дней.
                </p>

                <div className="subscription-form subscription-form--flat">
                  <div className="form-group">
                    <label htmlFor="days">Количество дней</label>
                    <div className="subscription-buttons">
                      <button
                        type="button"
                        onClick={() => setDaysInput('7')}
                        className="preset-days-btn"
                        disabled={isLoading}
                      >
                        7 дней
                      </button>
                      <button
                        type="button"
                        onClick={() => setDaysInput('30')}
                        className="preset-days-btn"
                        disabled={isLoading}
                      >
                        30 дней
                      </button>
                    </div>
                  </div>

                  <div className="price-display">
                    <span>Стоимость: </span>
                    <strong>
                      {parseInt(daysInput || 0) * SUBSCRIPTION_PRICE_PER_DAY} ₽
                    </strong>
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
        </div>
      )}

      {user.role === 'student' && (
        <div className="alergens-section">
          <h3>Мои аллергены</h3>
          <p className="alergens-description">
            Отметьте аллергены, чтобы при просмотре меню видеть предупреждение о блюдах, содержащих опасные для вас ингредиенты.
          </p>
          
          <div className="alergens-grid">
            {alergens.map(alergen => (
              <label key={alergen.id} className="alergen-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAlergens.includes(String(alergen.id))}
                  onChange={() => handleAlergenToggle(alergen.id)}
                  disabled={isLoadingAlergens}
                />
                <span className="checkbox-label">{alergen.name}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveAlergens}
            className="save-alergens-btn"
            disabled={isLoadingAlergens}
          >
            {isLoadingAlergens ? 'Сохранение...' : 'Сохранить аллергены'}
          </button>
        </div>
      )}
    </div>
  )
}
