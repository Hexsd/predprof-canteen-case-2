import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../hooks/useNotification'
import logger from '../utils/logger'

export default function ReviewsViewModal({ dishId, dishName, onClose }) {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { notify } = useNotification()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get(`/api/reviews/dish/${dishId}`),
          axios.get(`/api/reviews/stats/${dishId}`)
        ])

        setReviews(reviewsRes.data)
        setStats(statsRes.data)
        setLoading(false)
      } catch (error) {
        logger.error('Error fetching reviews:', error)
        notify('Ошибка загрузки отзывов', 'error')
        setLoading(false)
      }
    }

    fetchReviews()
  }, [dishId, notify])

  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(<i key={i} className="fa-solid fa-star"></i>)
      } else {
        stars.push(<i key={i} className="fa-regular fa-star"></i>)
      }
    }
    return stars
  }

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <h2>Отзывы на блюдо "{dishName}"</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="reviews-loading">Загрузка отзывов...</div>
        ) : (
          <>
            {stats && (
              <div className="reviews-stats">
                <div className="stat-item">
                  <span className="stat-label">Средняя оценка:</span>
                  <span className="stat-value">{stats.average_rating.toFixed(1)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Всего отзывов:</span>
                  <span className="stat-value">{stats.count}</span>
                </div>
              </div>
            )}

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>Пока нет отзывов на это блюдо</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="review-username">{review.username}</span>
                      <span className="review-rating">{renderStars(review.rating)}</span>
                    </div>
                    {review.text && (
                      <p className="review-text">{review.text}</p>
                    )}
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
