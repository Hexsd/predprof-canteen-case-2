import React from 'react'

export default function DishCard({ dish }) {
  const rating = 3.0
  const hasImage = false

  return (
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
            {'⨳'.repeat(Math.floor(rating))}
            {rating % 1 !== 0 && <span>⨳</span>}
          </div>
          <span className="rating-text">{rating}</span>
        </div>
      </div>
    </div>
  )
}
