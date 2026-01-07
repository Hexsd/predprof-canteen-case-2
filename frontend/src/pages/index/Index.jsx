import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

function Index() {
  const [menu, setMenu] = useState(null)

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/index')
      setMenu(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }
  useEffect(() => {
    fetchMenu()
  }, [])
  if (!menu) {
    return <div style={{ padding: '20px' }}>Вы не вошли и не имеете доступа к некоторым функциям</div>
  }
  return (
    <div>
      <div>
        <h1>Добро пожаловать на главную страницу сайта столовой!</h1>
        <h2>Меню на сегодня:</h2>
      </div>
      <p>Завтрак</p>
      <div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menu.breakfast.split('#').map((item) => (<li key={item}>{item}</li>))}
        </ul>
      </div>
      <p>Обед</p>
      <div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menu.lunch.split('#').map((item) => (<li key={item}>{item}</li>))}
        </ul>
      </div>
    </div>
    
  )
}

export default Index