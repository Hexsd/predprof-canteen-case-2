import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
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
        <h1 style={{ margin: 0 }}>Школьная столовая</h1>
        {user ? (
          <div>
            <span style={{ marginRight: '15px' }}>Здравствуйте, {user.name}!</span>
            <button onClick={logout} style={{ padding: '5px 15px' }}>
              Выйти
            </button>
          </div>
        ) : null}
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
