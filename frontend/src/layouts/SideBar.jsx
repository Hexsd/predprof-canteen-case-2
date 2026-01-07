import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function SideBar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <aside className="sidebar">
      <h2>Навигация</h2>
      <nav>
        <ul>
          <li>
            <Link to="/" className={isActive('/')}>Главная</Link>
          </li>
          <li>
            <Link to="/users" className={isActive('/users')}>Пользователи</Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
