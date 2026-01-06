import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Register from './Register'
import UserList from './UserList'

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }
  
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }

  return (
    <div>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>Школьная столовая</h1>
        {user && (
          <div>
            <span style={{ marginRight: '15px' }}>Здравствуйте, {user.name}!</span>
            <button onClick={logout} style={{ padding: '5px 15px' }}>
              Выйти
            </button>
          </div>
        )}
      </div>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={
          <PrivateRoute>
            <UserList />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
