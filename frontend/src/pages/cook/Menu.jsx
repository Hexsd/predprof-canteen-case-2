import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


export default function Menu() {

    const [menuDate, setMenuDate] = useState('');
    const menuTemplate = {
        date: "",
        breakfast: "",
        given_breakfasts: 0,
        lunch: "",
        given_lunches: 0,
    }
    const [menu, setMenu] = useState(menuTemplate);
    const [error, setError] = useState('')
    const [fetchedMenu, setFetched] = useState(false);

    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const navigate = useNavigate()
    

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

    useEffect(() =>
        {
            fetchAll();
        },[])

    const fetchByDate = async (e) => {
        e.preventDefault();
        console.log(menuDate);
        try {
            const response = await axios.get(`/api/cook/menu_${menuDate}`);
            setMenu(response.data);
            console.log(response);
            setError('')
        } catch (error) {
            setMenu(menuTemplate);
            setError("Меню на эту дату не существует");
            console.error('Error fetching menu for this date:', error);
        }
        setFetched(true);
    }

    const confirmMenu = async (e) => {
        e.preventDefault();
        let build_menu = {...menu, date: menuDate};
        console.log("Внёс");
        console.log(build_menu);
        try {
            await axios.post('/api/cook/new_menu', build_menu)
            navigate('/cook/menu')
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка отправки данных в БД')
            console.error('Ошибка отправки данных в БД:', err);
        }
    }

    function changeDishBreakfast(index, id_new) {
        let breakfast_new = menu.breakfast.split("#");
        breakfast_new[index] = id_new;
        console.log(index, id_new, breakfast_new.join("#"));
        const new_menu = {...menu, breakfast: breakfast_new.join("#")}
        setMenu(new_menu)
    }

    function removeBreakfastDish(index) {
        let breakfast_new = menu.breakfast.split("#");
        breakfast_new.splice(index, 1);
        setMenu({...menu, breakfast: breakfast_new.join("#")})
    }

    function changeDishLunch(index, id_new) {
        let lunch_new = menu.lunch.split("#");
        lunch_new[index] = id_new;
        console.log(index, id_new, lunch_new.join("#"));
        const new_menu = {...menu, lunch: lunch_new.join("#")}
        setMenu(new_menu)
    }

    function removeLunchDish(index) {
        let lunch_new = menu.lunch.split("#");
        lunch_new.splice(index, 1);
        setMenu({...menu, lunch: lunch_new.join("#")})
    }

    return (
    <div className="cook-container">
        <div className="cook-section">
            <h2>Управление меню</h2>
            <form onSubmit={fetchByDate} className="date-input-group">
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  required
                  className="form-input"
                />
                <button type="submit" className="form-button">
                    Выбрать меню за эту дату
                </button>
            </form>
        </div>
        {!fetchedMenu && !error && (
            <h3>Выберите дату на которую хотите посмотреть/создать меню</h3>
        )}
        {fetchedMenu && (
            <div className="cook-section">
                <h3>Завтрак</h3>
                <form onSubmit={confirmMenu}>
                    <table className="cook-table">
                        <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Блюдо</th>
                            <th>Убрать позицию</th>
                        </tr>
                        </thead>
                        <tbody>
                        {menu.breakfast!="" && menu.breakfast.split('#').map((item, index) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>
                                    <select value={parseInt(item)} onChange={(e) => changeDishBreakfast(index, String(e.target.value))}>
                                        {dishes.map((dish, indexx) => (
                                            <option key={dish.id} value={dish.id}>{dish.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td><button type="button" onClick={() => removeBreakfastDish(index)} className="remove-btn">Удалить</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={() => (setMenu({...menu, breakfast: menu.breakfast === "" ? "1" : menu.breakfast+"#1"}))} className="add-dish-btn">
                        + Добавить блюдо
                    </button>
                    
                    <h3>Обед</h3>
                    <table className="cook-table">
                        <thead>
                            <tr>
                                <th>Номер</th>
                                <th>Блюдо</th>
                                <th>Убрать позицию</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menu.lunch!="" && menu.lunch.split('#').map((item, index) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>
                                        <select value={parseInt(item)} onChange={(e) => changeDishLunch(index, String(e.target.value))}>
                                            {dishes.map((dish, indexx) => (
                                                <option key={dish.id} value={dish.id}>{dish.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><button type="button" onClick={() => removeLunchDish(index)} className="remove-btn">Удалить</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <button type="button" onClick={() => (setMenu({...menu, lunch: menu.lunch === "" ? "1" : menu.lunch+"#1"}))} className="add-dish-btn">
                        + Добавить блюдо
                    </button>
                </form>
                <button onClick={confirmMenu} className="save-button">
                    Сохранить изменения
                </button>
            </div>
        )}
    </div>)
}