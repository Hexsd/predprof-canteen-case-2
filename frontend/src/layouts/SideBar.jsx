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
    { path: '/', label: 'Главная', icon: '◉' },
    ...(isAdmin ? [
      { path: '/admin/stats', label: 'Статистика', icon: '⇄' },
      { path: '/admin/users', label: 'Пользователи', icon: '▤' }
    ] : []),
    ...(isCook ? [
      { path: '/cook/products', label: 'Контроль продуктов', icon: '◆' },
      { path: '/cook/menu', label: 'Управление меню', icon: '⪼' }
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
              ◀
            </button>
          </>
        ) : (
          <button 
            onClick={onToggle}
            className="sidebar-toggle-btn collapsed-toggle"
            title="Развернуть"
          >
            ▶
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
    </aside>
  )
}
