import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Index() {
  const [menu, setMenu] = useState(null)

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

  if (!menu) {
    return <div className="loading">Загрузка меню...</div>
  }

  return (
    <div>
      <h2 className="page-title">Меню столовой</h2>
      
      <div className="menu-container">
        <div className="menu-section">
          <h3>Завтрак</h3>
          <ul className="menu-list">
            {menu.breakfast.split('#').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="menu-section">
          <h3>Обед</h3>
          <ul className="menu-list">
            {menu.lunch.split('#').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
