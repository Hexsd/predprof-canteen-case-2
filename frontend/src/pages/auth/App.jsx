import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './Login'
import Register from './Register'
import UserList from './UserList'

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }
  
  return token ? children : <Navigate to="/auth/login" />
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="users" element={
        <PrivateRoute>
          <UserList />
        </PrivateRoute>
      } />
      <Route path="" element={<Navigate to="login" />} />
    </Routes>
  )
}

export default function Auth_router() {
  return <AppRoutes />
}
