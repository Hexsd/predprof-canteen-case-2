import React, { useState } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'
import SideBar from './SideBar'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" />
  }

  return (
    <div className="layout">
      <SideBar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="main-content">
        <header className="header">
          <h1>Система управления школьной столовой</h1>
          
          <div className="user-info">
            <Link to="/personal" className="user-greeting">
              Здравствуйте, {user.name}!
            </Link>
            <button onClick={logout} className="logout-btn">
              Выйти
            </button>
          </div>
        </header>
        
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
