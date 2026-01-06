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
      setError(error.response?.data?.detail || 'Failed to load users')
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

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка пользователей...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Все пользователи столовой</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {users.length === 0 ? (
        <p>Пользователи не найдены</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user) => (
            <li key={user.id} style={{ 
              padding: '10px', 
              margin: '5px 0', 
              background: '#f0f0f0'
            }}>
              <strong>{user.name}</strong> - {user.email} - {user.birth_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
