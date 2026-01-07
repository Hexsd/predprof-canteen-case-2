import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Загрузка пользователей...</div>
  }

  return (
    <div>
      <h2 className="page-title">Все пользователи</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-date">{formatDate(user.birth_date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
