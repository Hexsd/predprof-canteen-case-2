import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" />
  }
  const getRoleName = (role) => {
    const roles = {
      student: 'Ученик',
      cook: 'Повар',
      admin: 'Администратор'
    }
    return roles[role] || role
  }
  const getRoleColor = (role) => {
    const colors = {
      student: 'blue',
      cook: 'green',
      admin: 'red'
    }
    return colors[role] || 'gray'
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }
  return (
    // <div className="layout">
      
    //   <div className="main-content">
    //     <header className="header">
    //       <h1>Столовая школы №1150</h1>
          
    //       <div className="user-info">
    //         <span className="user-greeting">
    //           Здравствуйте, {user.name}!
    //         </span>
    //         <button onClick={logout} className="logout-btn">
    //           Выйти
    //         </button>
    //       </div>
    //     </header>
        
    //     <div className="content">
    //     </div>
    //   </div>
    // </div>
    <div>
      <h2 className="page-title"> Профиль</h2>
      <div className="user-card">
        <h3>Имя</h3>
        <div className="user-name">{user.name}</div>
        <h3>Статус</h3>
        <div className="user-role">{getRoleName(user.role)}</div>
        <h3>Почта</h3>
        <div className="user-email">{user.email}</div>
        <h3>Дата рождения</h3>
        <div className="user-date">{formatDate(user.birth_date)}</div>
      </div>
    </div>
  )
}