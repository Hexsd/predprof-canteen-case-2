import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'

export default function SideBar() {
  const location = useLocation()
  const { user: currentUser } = useAuth()
  const isActive = (path) => location.pathname === path ? 'active' : ''
  const isAdmin = currentUser?.role === 'admin'
  const isCook = currentUser?.role === 'cook'
  return (
    <aside className="sidebar">
      <h2>Навигация</h2>
      <nav>
        <ul>
          <li>
            <Link to="/" className={isActive('/')}>Главная</Link>
          </li>
          {isAdmin && (
            <div>
              <li>
                <Link to="/admin/stats" className={isActive('/admin/stats')}>Статистика</Link>
              </li>
              <li>
                <Link to="/admin/users" className={isActive('/admin/users')}>Пользователи</Link>
              </li>
            </div>
          )}
          {isCook && (
            <div>
              <li>
                <Link to="/cook/products" className={isActive('/cook/products')}>Контроль продуктов</Link>
              </li>
              <li>
                <Link to="/cook/menu" className={isActive('/cook/menu')}>Управление меню</Link>
              </li>
            </div>
          )}
        </ul>
      </nav>
    </aside>
  )
}
