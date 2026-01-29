import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import { useNotification } from '../../hooks/useNotification'

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Index() {
  const [menu, setMenu] = useState(null)
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStart, setWeekStart] = useState(getMondayOfWeek(today))
  const { user } = useAuth()
  const { notify } = useNotification()

  const BREAKFAST_PRICE = 150
  const LUNCH_PRICE = 300
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [alergens, setAlergens] = useState([]);

  const fetchMenu = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await axios.get(`/api/index?date=${dateStr}`)
      setMenu(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
      setMenu(null)
    }
  }

  const fetchAll = async () => {
          try {
            const response = await axios.get('/api/cook/all');
            setDishes(response.data[0]);
            setProducts(response.data[1]);
            setAlergens(response.data[2]);
          } catch (error) {
            console.error('Error fetching products and dishes:', error);
          }
      }

  useEffect(() => {
    fetchMenu(selectedDate);
    fetchAll();
  }, [selectedDate])

  const getWeekDates = (weekStart) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  const weekDates = getWeekDates(weekStart);

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setWeekStart(newWeekStart);
  }

  const goToNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setWeekStart(newWeekStart);
  }

  const selectDate = (date) => {
    setSelectedDate(date);
  }

  const formatDate = (date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  }

  const formatMonthYear = (date) => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  const handleBuyBreakfast = async () => {
    if (!user) return
    if (user.role !== 'student') {
      notify('Только ученики могут покупать завтрак', 'error')
      return
    }
    
    if (user.balance < BREAKFAST_PRICE) {
      notify(`Недостаточно средств. Необходимо ${BREAKFAST_PRICE} ₽, у вас ${user.balance} ₽`, 'error')
      return
    }

    try {
      const response = await axios.post('/api/users/buy/breakfast')
      notify(`Завтрак куплен! Баланс: ${response.data.balance} ₽`, 'success')
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при покупке', 'error')
    }
  }

  const handleBuyLunch = async () => {
    if (!user) return
    if (user.role !== 'student') {
      notify('Только ученики могут покупать обед', 'error')
      return
    }
    
    if (user.balance < LUNCH_PRICE) {
      notify(`Недостаточно средств. Необходимо ${LUNCH_PRICE} ₽, у вас ${user.balance} ₽`, 'error')
      return
    }

    try {
      const response = await axios.post('/api/users/buy/lunch')
      notify(`Обед куплен! Баланс: ${response.data.balance} ₽`, 'success')
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при покупке', 'error')
    }
  }

  function GetName(table, id) {
    let name = "";
    table.forEach(element => {
      if (element.id==id)
      {
        name = element.name;
        return
      }
    });
    return name
  }

  return (
    <div>
      <h2 className="page-title">Меню столовой</h2>
      
      {user?.role === 'student' && (
        <div className="user-balance-display">
          Ваш баланс: <strong>{user.balance} ₽</strong>
        </div>
      )}

      <div className="month-year-header">
        {formatMonthYear(weekStart)}
      </div>

      <div className="week-selector">
        <button onClick={goToPreviousWeek} className="week-nav-btn week-nav-prev">
          ‹‹
        </button>
        
        <div className="week-dates">
          {weekDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => selectDate(date)}
              className={`week-date-btn ${
                date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
                  ? 'active'
                  : ''
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
        
        <button onClick={goToNextWeek} className="week-nav-btn week-nav-next">
          ››
        </button>
      </div>

      {menu ? (
        <div className="menu-container">
          <div className="menu-section">
            <h3>Завтрак</h3>
            <ul className="menu-list">
              {menu.breakfast.split('#').map((item, index) => (
                <li key={index}>{GetName(dishes, parseInt(item))}</li>
              ))}
            </ul>
            {user?.role === 'student' && (
              <button 
                onClick={handleBuyBreakfast}
                className="buy-button"
              >
                Купить завтрак - {BREAKFAST_PRICE} ₽
              </button>
            )}
          </div>

          <div className="menu-section">
            <h3>Обед</h3>
            <ul className="menu-list">
              {menu.lunch.split('#').map((item, index) => (
                <li key={index}>{GetName(dishes, parseInt(item))}</li>
              ))}
            </ul>
            {user?.role === 'student' && (
              <button 
                onClick={handleBuyLunch}
                className="buy-button"
              >
                Купить обед - {LUNCH_PRICE} ₽
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="menu-container">
          <div className="no-menu-message">
            <p>Меню на {formatDate(selectedDate)} не составлено 👹</p>
            <p className="text-secondary">Выберите другую дату или попробуйте позже.</p>
          </div>
        </div>
      )}
    </div>
  )
}
