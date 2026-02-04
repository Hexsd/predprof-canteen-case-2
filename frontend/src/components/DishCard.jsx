import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReviewsViewModal from './ReviewsViewModal'

export default function DishCard({ dish }) {
  const [rating, setRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const hasImage = false

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(`/api/reviews/stats/${dish.id}`)
        setRating(response.data.average_rating || 0)
        setReviewCount(response.data.count || 0)
      } catch (error) {
        console.error('Error fetching rating:', error)
        setRating(0)
        setReviewCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [dish.id])

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
        </div>

        <div className="dish-info">
          <h4 className="dish-name">{dish.name}</h4>
          
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
