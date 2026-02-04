import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState(null)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!birthDate) {
      setError('Укажите дату рождения')
      return
    }

    const birthDateStr = birthDate.toISOString().split('T')[0]

    try {
      await register(email, name, password, birthDateStr)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Регистрация</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input
              type="text"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              placeholder="qwerty123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Дата рождения</label>
            <DatePicker
              selected={birthDate}
              onChange={(date) => setBirthDate(date)}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="dd.MM.yyyy"
              placeholderText="Выберите дату"
              locale={ru}
              className="form-input"
            />
          </div>

          <button type="submit" className="form-button">
            Зарегистрироваться
          </button>
        </form>

        <p className="auth-link">
          Уже есть аккаунт? <Link to="/auth/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
