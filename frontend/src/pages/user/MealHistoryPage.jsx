import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'

export default function MealHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [dishes, setDishes] = useState({})
  const navigate = useNavigate()
  const { notify } = useNotification()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/users/meal/history')
        setHistory(response.data)
        
        const dishesResponse = await axios.get('/api/index/dishes')
        const dishesMap = {}
        dishesResponse.data.forEach(dish => {
          dishesMap[dish.id] = dish
        })
        setDishes(dishesMap)
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching history:', error)
        notify('Ошибка загрузки истории', 'error')
        setLoading(false)
      }
    }

    fetchHistory()
  }, [notify])

  const handleLeaveReview = (meal) => {
    const dishIds = meal.dishes.map(d => parseInt(d))
    
    navigate('/review-history', {
      state: {
        meal_type: meal.meal_type,
        dishes: dishIds,
        meal_id: meal.id,
        date: meal.date
      }
    })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMealTypeLabel = (type) => {
    return type === 'breakfast' ? 'Завтрак' : 'Обед'
  }

  const getSourceLabel = (source) => {
    return source === 'subscription' ? 'Абонемент' : 'Покупка'
  }

  if (loading) {
    return (
      <div className="meal-history-page">
        <div className="loading">Загрузка истории...</div>
      </div>
    )
  }

  return (
    <div className="meal-history-page">
      <div className="history-container">
        <h1>История покупок и получений</h1>
        
        {history.length === 0 ? (
          <div className="no-history">
            <p>У вас пока нет истории покупок</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((meal) => (
              <div key={meal.id} className="history-item">
                <div className="history-item-header">
                  <div className="meal-info">
                    <span className="meal-type">{getMealTypeLabel(meal.meal_type)}</span>
                    <span className="meal-date">{formatDate(meal.created_at)}</span>
                  </div>
                  <span className={`source-badge source-${meal.source}`}>
                    {getSourceLabel(meal.source)}
                  </span>
                </div>

                <div className="meal-dishes">
                  <p className="dishes-label">Блюда:</p>
                  <div className="dishes-list">
                    {meal.dishes.map((dishId, idx) => {
                      const dish = dishes[dishId]
                      return (
                        <div key={idx} className="dish-item">
                          {dish ? dish.name : `Блюдо #${dishId}`}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleLeaveReview(meal)}
                  className="btn-leave-review"
                >
                  Оставить отзыв
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
