import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../auth/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import logger from '../../utils/logger'
import DishCard from '../../components/DishCard'

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
  const navigate = useNavigate()
  const location = useLocation()

  const BREAKFAST_PRICE = 150
  const LUNCH_PRICE = 300
  const SUBSCRIPTION_PRICE_PER_DAY = 50
  
  const [dishes, setDishes] = useState([])
  const [products, setProducts] = useState([])
  const [alergens, setAlergens] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [mealStatus, setMealStatus] = useState({ breakfast_status: null, lunch_status: null })
  const [breakfastSource, setBreakfastSource] = useState(null)
  const [lunchSource, setLunchSource] = useState(null)


  const [enoughDishesBr, setEnoughDishesBr] = useState(true);
  const [enoughDishesLu, setEnoughDishesLu] = useState(true);

  const fetchMenu = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await axios.get(`/api/index?date=${dateStr}`)
      setMenu(response.data)
    } catch (error) {
      logger.error('Error fetching menu:', error)
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
            logger.error('Error fetching products and dishes:', error);
          }
      }

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/users/subscription/status')
      setSubscription(response.data)
      setSubscriptionActive(response.data.is_active)
    } catch (error) {
      logger.error('Error fetching subscription:', error)
      setSubscriptionActive(false)
    }
  }

  const fetchMealStatus = async () => {
    try {
      const response = await axios.get('/api/users/meal/status')
      setMealStatus(response.data)
      

      const historyResponse = await axios.get('/api/users/meal/history?limit=10')
      const history = historyResponse.data
      
      const today = new Date().toISOString().split('T')[0]
      const breakfastEntries = history.filter(h => h.meal_type === 'breakfast' && h.date.startsWith(today))
      const lunchEntries = history.filter(h => h.meal_type === 'lunch' && h.date.startsWith(today))
      
      if (breakfastEntries.length > 0) {
        setBreakfastSource(breakfastEntries[0].source)
      } else {
        setBreakfastSource(null)
      }
      
      if (lunchEntries.length > 0) {
        setLunchSource(lunchEntries[0].source)
      } else {
        setLunchSource(null)
      }
    } catch (error) {
      logger.error('Error fetching meal status:', error)
    }
  }

  useEffect(() => {
    fetchMenu(selectedDate);
    fetchAll();
    if (user?.role === 'student') {
      fetchSubscriptionStatus()
      fetchMealStatus()
    }
  }, [selectedDate])

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMealStatus()
    }
  }, [user, location.key])

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
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await axios.post(`/api/users/buy/breakfast?delivery_date=${dateStr}`)
      notify(`Завтрак куплен! Баланс: ${response.data.user.balance} ₽`, 'success')
      
      const breakfastDishes = response.data.breakfast_dishes || []
      navigate('/review', {
        state: {
          meal_type: 'breakfast',
          dishes: breakfastDishes
        }
      })
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при покупке', 'error')
    }
  }

  const handleGetBreakfastWithSubscription = async () => {
    try {
      const response = await axios.post('/api/users/meal/breakfast-with-subscription')
      const mealType = response.data.meal_type
      const dishes = response.data.dishes || []
      
      notify('Завтрак получен! Оставьте отзыв', 'success')
      
      navigate('/review', {
        state: {
          meal_type: mealType,
          dishes: dishes
        }
      })
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при отметке', 'error')
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
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await axios.post(`/api/users/buy/lunch?delivery_date=${dateStr}`)
      notify(`Обед куплен! Баланс: ${response.data.user.balance} ₽`, 'success')
      
      const lunchDishes = response.data.lunch_dishes || []
      navigate('/review', {
        state: {
          meal_type: 'lunch',
          dishes: lunchDishes
        }
      })
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при покупке', 'error')
    }
  }

  const handleGetLunchWithSubscription = async () => {
    try {
      const response = await axios.post('/api/users/meal/lunch-with-subscription')
      const mealType = response.data.meal_type
      const dishes = response.data.dishes || []
      
      notify('Обед получен! Оставьте отзыв', 'success')
      
      navigate('/review', {
        state: {
          meal_type: mealType,
          dishes: dishes
        }
      })
    } catch (error) {
      notify(error.response?.data?.detail || 'Ошибка при отметке', 'error')
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
        <div className="index-info-section">
          <button 
            onClick={() => navigate('/history')}
            className="history-btn"
            title="Посмотреть историю покупок"
          >
            История покупок
          </button>
          {subscriptionActive && subscription && (
            <div className="subscription-banner">
              <span className="subscription-badge">Абонемент активен</span>
              <span className="subscription-days">Осталось {subscription.days_remaining} дней</span>
            </div>
          )}
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
                {(() => {
                  let unique_dishes_amounts = {};
                  let unique_dishes_br = new Set(menu.breakfast.split('#'))
                  let able_to_fulfill = [];
                  Array.from(unique_dishes_br).forEach(element => {
                    unique_dishes_amounts[element]=menu.breakfast.split('#').filter(item => item==element).length;
                  });
                  

                  return (
                    <>
                      <div className="dishes-scroll">
                        <div className="dishes-container">
                          {menu.breakfast.split('#').map((dishId, index) => {
                              const dish = dishes.find(d => d.id === parseInt(dishId))
                              if (!dish) return null
                              else {
                                if (unique_dishes_amounts[dishId]>dish.amount)
                                {
                                  able_to_fulfill.push(false)
                                }
                              }
                              return (
                                <DishCard
                                  key={index}
                                  dish={dish}
                                  products={products}
                                />
                              )
                            })}
                            {/* {(()=>{if (able_to_fulfill.includes(false)) {notify('В данный момент блюд недостаточно чтобы вы могли получить завтрак', 'error')};})()} */}
                        </div>
                      </div>
                      <button
                        onClick={subscriptionActive && !breakfastSource ? handleGetBreakfastWithSubscription : handleBuyBreakfast}
                        className={`meal-buy-btn ${(!user || user.role !== 'student') ? 'disabled' : ''}`}
                        disabled={!user || user.role !== 'student' || able_to_fulfill.includes(false)}
                        >
                        {subscriptionActive && !breakfastSource ? 'Получить завтрак' : `Купить завтрак - ${BREAKFAST_PRICE} ₽`}
                      </button>
                    </>
                  )
                })()}
          </div>

          <div className="menu-section">
            <h3>Обед</h3>
            {(()=>{
              let unique_dishes_amounts = {};
              let unique_dishes_br = new Set(menu.lunch.split('#'))
              let able_to_fulfill = [];
              Array.from(unique_dishes_br).forEach(element => {
                unique_dishes_amounts[element]=menu.lunch.split('#').filter(item => item==element).length;
              });
              

              return (
                <>
                  <div className="dishes-scroll">
                    <div className="dishes-container">
                      {menu.lunch.split('#').map((dishId, index) => {
                        const dish = dishes.find(d => d.id === parseInt(dishId))
                        if (!dish) return null
                        else {
                          if (unique_dishes_amounts[dishId]>dish.amount)
                          {
                            able_to_fulfill.push(false)
                          }
                        }
                        return (
                          <DishCard
                            key={index}
                            dish={dish}
                            products={products}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <button
                    onClick={subscriptionActive && !lunchSource ? handleGetLunchWithSubscription : handleBuyLunch}
                    className={`meal-buy-btn ${(!user || user.role !== 'student') ? 'disabled' : ''}`}
                    disabled={!user || user.role !== 'student' || able_to_fulfill.includes(false)}
                  >
                    {subscriptionActive && !lunchSource ? 'Получить обед' : `Купить обед - ${LUNCH_PRICE} ₽`}
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      ) : (
        <div className="menu-container">
          <div className="no-menu-message">
            <p>Меню на {formatDate(selectedDate)} не составлено</p>
            <p className="text-secondary">Выберите другую дату или попробуйте позже.</p>
          </div>
        </div>
      )}
    </div>
  )
}
