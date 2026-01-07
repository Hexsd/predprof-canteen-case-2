import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
export default function UserList() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = axios.defaults.headers.common['Authorization']
      if (!token) {
        throw new Error('No authorization token')
      }
      
      const res = await axios.get('/api/users')
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error.response?.data?.detail || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole })
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Ошибка изменения роли:', error)
      setError(error.response?.data?.detail || 'Ошибка обновления роли пользователя')
    }
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

  const isAdmin = currentUser?.role === 'admin'

  if (loading) {
    return <div className="loading">Загрузка пользователей...</div>
  }

  return (
    <div>
      <h2 className="page-title">Управление ролями</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{getRoleName(user.role)}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-date">{formatDate(user.birth_date)}</div>
              {isAdmin && user.id !== currentUser.id && (
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="student">Ученик</option>
                  <option value="cook">Повар</option>
                  <option value="admin">Администратор</option>
                </select>
              )}
              {user.id === currentUser.id && (<div className="note">(Это вы)</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
