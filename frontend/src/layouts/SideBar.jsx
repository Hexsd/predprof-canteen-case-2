import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'

export default function SideBar({ isOpen = true, onToggle }) {
  const location = useLocation()
  const { user: currentUser } = useAuth()
  const isActive = (path) => location.pathname === path ? 'active' : ''
  const isAdmin = currentUser?.role === 'admin'
  const isCook = currentUser?.role === 'cook'

  const navItems = [
    { path: '/', label: 'Главная', icon: <i className="fa-solid fa-house"></i> },
    ...(isAdmin ? [
      { path: '/admin/stats', label: 'Статистика', icon: <i className="fa-solid fa-chart-line"></i> },
      { path: '/admin/users', label: 'Пользователи', icon: <i className="fa-solid fa-users"></i> },
      { path: '/admin/applications', label: 'Заявки на закупку', icon: <i className="fa-solid fa-inbox"></i> }
    ] : []),
    ...(isCook ? [
      { path: '/cook/products', label: 'Контроль продуктов', icon: <i className="fa-solid fa-utensils"></i> },
      { path: '/cook/menu', label: 'Управление меню', icon: <i className="fa-solid fa-utensils"></i> },
      { path: '/cook/applications', label: 'Заявки на закупку', icon: <i className="fa-solid fa-inbox"></i> }
    ] : []),
    ...(currentUser?.role === 'student' ? [
      { path: '/history', label: 'История покупок', icon: <i className="fa-solid fa-clock-rotate-left"></i> }
    ] : [])
  ]

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {isOpen ? (
          <>
            <h2>Навигация</h2>
            <button
              onClick={onToggle}
              className="sidebar-toggle-btn"
              title="Свернуть"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="sidebar-toggle-btn collapsed-toggle"
            title="Развернуть"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        )}
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={isActive(item.path)} title={item.label}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>&copy; 2026 Клуб Романтики the best team</p>
        <p>Все права защищены</p>
      </div>
    </aside>
  )
}
