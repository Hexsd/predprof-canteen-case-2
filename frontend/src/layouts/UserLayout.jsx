import React, { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'
import SideBar from './SideBar'
import NotificationCenter from '../components/NotificationCenter'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" />
  }

  return (
    <div className="layout">
      <NotificationCenter />
      <SideBar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content">
        <header className="header">
          <h1>Система управления школьной столовой</h1>

          <div className="user-profile-container">
            <button
              className="user-avatar-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Профиль"
            >
              {user.name?.[0]?.toUpperCase() || 'U'}
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user.name}</div>
                  <div className="dropdown-user-email">{user.email}</div>
                </div>

                <Link to="/personal" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                  <i className="fa-solid fa-user"></i>
                  Профиль
                </Link>

                <button onClick={logout} className="dropdown-item logout">
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
