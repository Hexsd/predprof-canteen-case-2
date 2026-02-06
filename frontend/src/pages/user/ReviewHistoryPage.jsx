import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import logger from '../../utils/logger'

export default function ReviewHistoryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useNotification()

  const [dishIds, setDishIds] = useState([])
  const [dishNames, setDishNames] = useState({})
  const [reviews, setReviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const mealType = location.state?.meal_type
  const dishes = location.state?.dishes || []
  const mealId = location.state?.meal_id
  const mealDate = location.state?.date

  useEffect(() => {
    if (!mealType || dishes.length === 0) {
      navigate('/history')
      return
    }

    const fetchDishDetails = async () => {
      try {
        setDishIds(dishes)
        const dishDetailsMap = {}


        const response = await axios.get(`/api/index/dishes`)
        const allDishes = response.data

        for (const dishId of dishes) {
          const dish = allDishes.find(d => d.id === parseInt(dishId))
          if (dish) {
            dishDetailsMap[dishId] = dish.name
          }
        }

        setDishNames(dishDetailsMap)
        setLoading(false)
      } catch (error) {
        logger.error('Error fetching dishes:', error)
        notify('Ошибка загрузки блюд', 'error')
        setLoading(false)
      }
    }

    fetchDishDetails()
  }, [mealType, dishes, navigate, notify])

  const handleRatingChange = (dishId, rating) => {
    setReviews(prev => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        rating
      }
    }))
  }

  const handleTextChange = (dishId, text) => {
    setReviews(prev => ({
      ...prev,
      [dishId]: {
        ...prev[dishId],
        text
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const reviewsToSubmit = Object.entries(reviews).filter(([_, review]) => review.rating)

      if (reviewsToSubmit.length === 0) {
        notify('Выберите хотя бы одно блюдо для оценки', 'warning')
        setSubmitting(false)
        return
      }

      const successCount = { count: 0 }
      const failedDishes = []

      for (const [dishId, review] of reviewsToSubmit) {
        if (review.rating) {
          try {
            await axios.post('/api/reviews', {
              dish_id: parseInt(dishId),
              rating: review.rating,
              text: review.text || null
            })
            successCount.count++
          } catch (dishError) {
            if (dishError.response?.status === 400 &&
              dishError.response?.data?.detail?.includes('уже оставили отзыв')) {
              failedDishes.push(dishNames[dishId])
            } else {
              throw dishError
            }
          }
        }
      }

      if (successCount.count > 0) {
        notify(`Отзывы успешно отправлены! (${successCount.count} блюд)`, 'success')
      }

      if (failedDishes.length > 0) {
        notify(`На эти блюда уже оставлены отзывы: ${failedDishes.join(', ')}`, 'warning')
      }

      if (successCount.count > 0 || failedDishes.length > 0) {
        setTimeout(() => {
          navigate('/history')
        }, 1500)
      }
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка отправки отзывов', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="review-page">
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="review-page">
      <div className="review-container">
        <h1>Оставьте отзывы на блюда</h1>
        <p className="review-subtitle">
          {mealType === 'breakfast' ? 'Завтрак' : 'Обед'} от {new Date(mealDate).toLocaleDateString('ru-RU')}
        </p>

        <form onSubmit={handleSubmit} className="review-form">
          {dishIds.map((dishId) => (
            <div key={dishId} className="review-item">
              <h3>{dishNames[dishId] || `Блюдо #${dishId}`}</h3>

              <div className="rating-input">
                <label>Оценка:</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${reviews[dishId]?.rating >= star ? 'active' : ''}`}
                      onClick={() => handleRatingChange(dishId, star)}
                      title={`${star} звезд`}
                    >
                      <i className="fa-solid fa-star"></i>
                    </button>
                  ))}
                </div>
                {reviews[dishId]?.rating && (
                  <span className="rating-value">{reviews[dishId].rating} из 5</span>
                )}
              </div>

              <div className="text-input">
                <label htmlFor={`review-text-${dishId}`}>Комментарий (опционально):</label>
                <textarea
                  id={`review-text-${dishId}`}
                  placeholder="Поделитесь своим мнением о блюде..."
                  value={reviews[dishId]?.text || ''}
                  onChange={(e) => handleTextChange(dishId, e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Отправить отзывы'}
            </button>
            <button
              type="button"
              className="btn-skip"
              onClick={() => navigate('/history')}
              disabled={submitting}
            >
              Назад в историю
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
