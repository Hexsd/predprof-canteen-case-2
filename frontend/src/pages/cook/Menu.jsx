import React, { useState, useEffect } from 'react'
import axios from 'axios'
import logger from '../../utils/logger'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'


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
    const [fetchedMenu, setFetched] = useState(false);

    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [portions, setPortions] = useState(1);
    const [usedProducts, setUsedProducts] = useState({});
    const [considerCookedMeals, setCCM] = useState(true);

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

    useEffect(() => {
        fetchAll();
    }, [])

    useEffect(() => {
        let dict = {};
        products.forEach(element => {
            dict[element.id] = 0;
        })
        setUsedProducts(dict);
    }, [menu])
    const fetchByDate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`/api/cook/menu_${menuDate}`);
            setMenu(response.data);
        } catch (error) {
            setMenu(menuTemplate);
            notify("Меню на эту дату не существует", "error");
        }
        setFetched(true);
    }

    const confirmMenu = async (e) => {
        e.preventDefault();
        let build_menu = { ...menu, date: menuDate };
        try {
            await axios.post('/api/cook/new_menu', build_menu)
            notify("Меню успешно сохранено", "success")
            navigate('/cook/menu')
        } catch (err) {
            notify(err.response?.data?.detail || 'Ошибка отправки данных в БД', 'error')
        }
    }

    function changeDishBreakfast(index, id_new) {
        let breakfast_new = menu.breakfast.split("#");
        breakfast_new[index] = id_new;
        const new_menu = { ...menu, breakfast: breakfast_new.join("#") }
        setMenu(new_menu)
    }

    function removeBreakfastDish(index) {
        let breakfast_new = menu.breakfast.split("#");
        breakfast_new.splice(index, 1);
        setMenu({ ...menu, breakfast: breakfast_new.join("#") })
    }

    function changeDishLunch(index, id_new) {
        let lunch_new = menu.lunch.split("#");
        lunch_new[index] = id_new;
        const new_menu = { ...menu, lunch: lunch_new.join("#") }
        setMenu(new_menu)
    }

    function removeLunchDish(index) {
        let lunch_new = menu.lunch.split("#");
        lunch_new.splice(index, 1);
        setMenu({ ...menu, lunch: lunch_new.join("#") })
    }

    function findposition(id, table) {
        let elem = {};
        table.forEach(element => {
            if (element.id == id) {
                elem = element
            }
        });
        return elem
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
            {!fetchedMenu && (
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
                                {menu.breakfast != "" && menu.breakfast.split('#').map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
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
                        <button type="button" onClick={() => (setMenu({ ...menu, breakfast: menu.breakfast === "" ? "1" : menu.breakfast + "#1" }))} className="add-dish-btn">
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
                                {menu.lunch != "" && menu.lunch.split('#').map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
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

                        <button type="button" onClick={() => (setMenu({ ...menu, lunch: menu.lunch === "" ? "1" : menu.lunch + "#1" }))} className="add-dish-btn">
                            + Добавить блюдо
                        </button>
                    </form>
                    <button onClick={confirmMenu} className="save-button">
                        Сохранить изменения
                    </button>
                    {menu.breakfast !== "" && menu.lunch !== "" && (
                        <>
                            <h3>Расчет продуктов</h3>
                            <div className="calc-group">
                                <div className="form-group">
                                    <label className="form-label"><h4>Количество порций</h4></label>
                                    <input
                                        type="number"
                                        value={portions}
                                        onChange={(e) => setPortions(e.target.value)}
                                        className="form-input"
                                        min="1"
                                    />
                                </div>
                                <label className="cooked-meals-toggle">
                                    <input
                                        type="checkbox"
                                        checked={considerCookedMeals}
                                        onChange={(e) => setCCM(e.target.checked)}
                                    />
                                    <span>Учитывать уже приготовленные блюда</span>
                                </label>
                            </div>

                            {(() => {
                                let dict = { ...usedProducts };

                                return (
                                    <>
                                        <h4>Потребление блюд</h4>
                                        <table className="cook-table">
                                            <thead>
                                                <tr>
                                                    <th>Блюдо</th>
                                                    <th>Количество порций</th>
                                                    <th>Необходимо приготовить</th>
                                                    <th>Требуемые продукты (на нехватку)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from(new Set((menu.breakfast + '#' + menu.lunch).split('#'))).map((item, index) => {
                                                    const dish = findposition(parseInt(item), dishes);
                                                    const k = (menu.breakfast + '#' + menu.lunch).split('#').filter(m => m == item).length;
                                                    let dish_amount = considerCookedMeals ? dish.amount : 0

                                                    const dishesNeeded = portions * k - dish_amount;

                                                    return (
                                                        <tr key={index}>
                                                            <td>{dish.name}</td>
                                                            <td>{portions * k}</td>
                                                            <td>
                                                                {dishesNeeded > 0 ? (
                                                                    <span style={{ color: 'var(--color-error)', fontWeight: '500' }}>
                                                                        {dishesNeeded}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                                                                        Блюд хватает
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {dishesNeeded <= 0 ? (
                                                                    "Блюда уже укомплектованы"
                                                                ) : (
                                                                    <div>
                                                                        {dish.products.split('#').map((prodId) => {
                                                                            const product = findposition(parseInt(prodId), products);
                                                                            if (dict[product.id] !== undefined) {
                                                                                dict[product.id] += dishesNeeded;
                                                                            }
                                                                            return (
                                                                                <div key={prodId} style={{ marginBottom: '4px' }}>
                                                                                    {product.name}: {dishesNeeded}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        <h4>Итоговый расчет продуктов</h4>
                                        <table className="cook-table">
                                            <thead>
                                                <tr>
                                                    <th>Продукт</th>
                                                    <th>Необходимо закупить</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(dict).map(([key, value]) => {
                                                    const product = findposition(key, products);
                                                    const needed = value - product.amount;
                                                    return (
                                                        <tr key={key}>
                                                            <td>{product.name}</td>
                                                            <td>
                                                                {needed > 0 ? (
                                                                    <span style={{ color: 'var(--color-error)', fontWeight: '500' }}>
                                                                        {needed}
                                                                    </span>
                                                                ) : value > 0 ? (
                                                                    <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                                                                        Продуктов хватает
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                                                                        Продукты затрачены не будут
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </>
                                );
                            })()}
                        </>
                    )}
                </div>
            )}
        </div>)
}