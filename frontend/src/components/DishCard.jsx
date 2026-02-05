import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReviewsViewModal from './ReviewsViewModal'
import { useAuth } from '../pages/auth/AuthContext'
import logger from '../utils/logger'

export default function DishCard({ dish, products = [] }) {
  const [rating, setRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [hasAllergen, setHasAllergen] = useState(false)
  const [isInPreferences, setIsInPreferences] = useState(false)
  const { user } = useAuth()
  const hasImage = false

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(`/api/reviews/stats/${dish.id}`)
        setRating(response.data.average_rating || 0)
        setReviewCount(response.data.count || 0)
      } catch (error) {
        logger.error('Error fetching rating:', error)
        setRating(0)
        setReviewCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [dish.id])

  useEffect(() => {
    if (user?.alergens && dish.products && products.length > 0) {
      const userAlergens = user.alergens.split('#').filter(id => id !== '')
      const dishProductIds = dish.products.split('#').filter(id => id !== '')
      
      const dishHasAllergen = dishProductIds.some(productId => {
        const product = products.find(p => p.id === parseInt(productId))
        if (product && product.alergens) {
          const productAlergens = product.alergens.split('#').filter(id => id !== '')
          return productAlergens.some(allergen => userAlergens.includes(allergen))
        }
        return false
      })
      
      setHasAllergen(dishHasAllergen)
    }
  }, [user, dish, products])

  useEffect(() => {
    if (user && user.role === 'student') {
      const checkPreference = async () => {
        try {
          const response = await axios.get(`/api/reviews/preferences/${dish.id}/check`)
          setIsInPreferences(response.data.in_preferences)
        } catch (error) {
          logger.error('Error checking preference:', error)
          setIsInPreferences(false)
        }
      }
      
      checkPreference()
    }
  }, [user, dish.id])

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    let stars = '⭐'.repeat(filledStars)
    if (hasHalfStar) {
      stars += '⭐'
    }
    return stars
  }

  return (
    <>
      <div className="dish-card">
        <div className="dish-image-container">
          {hasImage ? (
            <img src={dish.image} alt={dish.name} className="dish-image" />
          ) : (
            <div className="dish-image-placeholder">
              <span className="placeholder-icon">🍴</span>
            </div>
          )}
          {hasAllergen && (
            <div className="allergen-warning">
              Содержит ваши аллергены
            </div>
          )}
          {isInPreferences && (
            <div className="preference-tag">
              Вам нравится
            </div>
          )}
        </div>

        <div className="dish-info">
          <h4 className="dish-name">{dish.name}</h4>
          
          <div className="dish-footer">
            <div className="dish-rating">
              <div className="stars">
                {renderStars(rating)}
              </div>
              <span className="rating-text">{rating.toFixed(1)}</span>
            </div>

            {reviewCount > 0 && (
              <button
                className="view-reviews-btn"
                onClick={() => setShowReviewsModal(true)}
              >
                Смотреть отзывы ({reviewCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewsModal && (
        <ReviewsViewModal
          dishId={dish.id}
          dishName={dish.name}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
    </>
  )
}
