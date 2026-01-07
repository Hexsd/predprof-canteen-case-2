import React from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../pages/auth/AuthContext'

export default function UserLayout() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }

  return (
    <div>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0'
      }}>
        <h1 style={{ margin: 0 }}><Link to="/index" style={{ textDecoration: 'none', color: 'inherit' }}>Школьная столовая</Link></h1>
        {user ? (
          <div>
            <span style={{ marginRight: '15px' }}>Здравствуйте, {user.name}!</span>
            <button onClick={logout} style={{ padding: '5px 15px' }}>
              Выйти
            </button>
          </div>
        ) : (
          <div>
            <span style={{ marginRight: '15px' }}>Вы не вошли в акканут</span>
            <button onClick={() => window.location.href = '/auth/login'} style={{ padding: '5px 15px' }}>
              Войти
            </button>
            <button style={{ marginLeft: '15px', padding: '5px 15px' }} onClick={() => window.location.href = '/auth/register'}>
              Зарегистрироваться
            </button>
          </div>
        )}
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
