import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'

export default function SideBar() {
  const location = useLocation()
  const { user: currentUser } = useAuth()
  const isActive = (path) => location.pathname === path ? 'active' : ''
  const isAdmin = currentUser?.role === 'admin'
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
          <li>
            <Link to="/personal" className={isActive('/personal')}>Профиль</Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/" className={isActive('/')}>Статистика</Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  )
}
