import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Index() {
  const [menu, setMenu] = useState(null)
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [alergens, setAlergens] = useState([]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/index')
      setMenu(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
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
    fetchMenu();
    fetchAll();
  }, [])

  if (!menu) {
    return <div className="loading">Загрузка меню...</div>
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
      <p>seregakrasava</p>
      <div className="menu-container">
        <div className="menu-section">
          <h3>Завтрак</h3>
          <ul className="menu-list">
            {menu.breakfast.split('#').map((item, index) => (
              <li key={index}>{GetName(dishes, parseInt(item))}</li>
            ))}
          </ul>
        </div>

        <div className="menu-section">
          <h3>Обед</h3>
          <ul className="menu-list">
            {menu.lunch.split('#').map((item, index) => (
              <li key={index}>{GetName(dishes, parseInt(item))}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
