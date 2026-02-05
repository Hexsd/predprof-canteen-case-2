import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import logger from '../../utils/logger'

export default function Products() {
    const [dishes, setDishes] = useState([]);
    const [old_dishes, setOldDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const navigate = useNavigate()
    const { notify } = useNotification()

    const [type, setType] = useState("product");
    const [name, setName] = useState("");
    const [components, setComponents] = useState([]);
    const [amount, setAmount] = useState(1);

    const fetchAll = async () => {
        try {
          const response = await axios.get('/api/cook/all');
          setDishes(response.data[0]);
          setOldDishes(response.data[0]);
          setProducts(response.data[1]);
          setAlergens(response.data[2]);
        } catch (error) {
            logger.error('Error fetching products and dishes:', error);
        }
    }
    useEffect(() =>
    {
        fetchAll();
    },[])

    const handleChanges = async (e) => {
        e.preventDefault();
        const data = {
            dishes: dishes,
            products: products,
            alergens: alergens
        }
        try {
            await axios.post('/api/cook/change', data)
            await fetchAll()
            notify("Изменения успешно сохранены", "success")
        } catch (err) {
            notify(err.response?.data?.detail || 'Ошибка отправки данных в БД', 'error')
        }
    }

    function ChangeDishes(index, new_value) {
        const new_dishes = dishes.map((item, i) => {
            if (i === index) {
                if (new_value > old_dishes[i].amount && new_value > item.amount) 
                {
                    let products_amount = new_value-item.amount>new_value-old_dishes[i].amount ? new_value-old_dishes[i].amount : new_value-item.amount;
                    let new_products = structuredClone(products);
                    let able = item.products.split('#').map((product, indexx) => {
                        if (new_products[findindex(parseInt(product), new_products)].amount-products_amount>=0)
                        {
                            new_products[findindex(parseInt(product), new_products)].amount-=products_amount;
                            return true
                        }
                        else {
                            return false
                        }
                    })
                    if (able.includes(false))
                    {
                        notify('Недостаточно продуктов для увеличения числа блюд', 'error')
                        return item
                    }
                    else
                    {
                        setProducts(new_products);
                    }
                }
                else if (new_value <= item.amount && new_value >= old_dishes[i].amount)
                {
                    let new_products = [...products];
                    item.products.split('#').map((product, indexx) => {
                        new_products[findindex(parseInt(product), new_products)].amount+=(item.amount-new_value);
                    })
                    setProducts(new_products);
                    if (new_value==old_dishes[i].amount)
                    {
                        notify(`Число блюд '${item.name}' и привязанных продуктов вернулось в изначальное состояние`, 'success')
                    }
                }
                else {
                    notify('Это действие не повлияет на число продуктов', 'error')
                }
                return { ...item, amount: new_value };
            }
            return item;
        });
        setDishes(new_dishes);
    } 

    function ChangeProducts(index, new_value) {
        const new_products = products.map((item, i) => {
            if (i === index) {
                return { ...item, amount: new_value };
            }
            return item;
        });
        setProducts(new_products);
    } 

    const CreateNew = async(e) =>  {
        e.preventDefault();
        let data2 = {
            name: name,
        }
        if (type==="dish")
        {
            data2 = {
                name: name,
                products: components.join('#'),
                amount: amount
            }
        }
        else if (type==="product")
        {
            data2 = {
                name: name,
                alergens: components.join('#'),
                amount: amount
            }
        }
        try {
            await axios.post(`/api/cook/new_${type}`, data2)
            await fetchAll()
            notify(`${type === 'dish' ? 'Блюдо' : 'Продукт'} успешно создано`, "success")
            setName('')
            setComponents([])
            setAmount(1)
        } catch (err) {
            notify(err.response?.data?.detail || 'Ошибка отправки данных в БД', 'error')
        }
    }

    function Join_names(any_item, items1) {
        const any_item_names = [];
        items1.forEach(product => {
            any_item.forEach(element => {
                if (parseInt(element)==product.id)
                {
                    any_item_names.push(product.name);
                    return;
                }
            })
            if (any_item_names.length==any_item.length)
            {
                return;
            }
        });
        return any_item_names
    }

    function findposition(id, table) {
        let elem = {};
        table.forEach(element => {
            if (element.id==id)
            {
                elem = element
            }
        });
        return elem
    }

    function findindex(id, table) {
        let elem_in = 0;
        table.map((element, index) => {
            if (element.id==id)
            {
                elem_in = index
            }
        });
        return elem_in
    }

    if (!dishes[0]) {
        return <div className="loading">Загрузка продуктов...</div>
    }
    return ( 
        <div className="cook-container">
            <div className="cook-section">
                <h2>Контроль продуктов</h2>
                <h3>Таблица блюд</h3>
                <form onSubmit={handleChanges}>
                    <table className="cook-table">
                        <thead>
                        <tr>
                            <th>Название</th>
                            <th>Продукты</th>
                            <th>Количество</th>
                        </tr>
                        </thead>
                        <tbody>
                    {dishes.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>
                                {item.products!="" && Join_names(item.products.split('#'), products).map((product, index) => (
                                    <p key={index}>{product}</p>
                                ))}
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => ChangeDishes(index, e.target.value)}
                                    required
                                />
                            </td>
                        </tr>
                        ))}
                        </tbody>
                </table>
                </form>
                <h3>Таблица продуктов</h3>
                <form onSubmit={handleChanges}>
                <table className="cook-table">
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th>Аллергены</th>
                        <th>Количество</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>
                                {item.alergens!="" && Join_names(item.alergens.split('#'), alergens).map((alergen, indexAler) => (
                                    <p key={indexAler}>{alergen}</p>
                                ))}
                                {item.alergens==="" && (<p>Продукт гипоаллергеннен</p>) }
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.amount}
                                    onChange={(e) => ChangeProducts(index, e.target.value)}
                                    required
                                />
                            </td>
                        </tr>
                        ))}
                        </tbody>
                </table>
                <button type="submit" className="save-button">
                    Внести изменения
                </button>
            </form>
            </div>
            <div className="cook-section">
                <h3>Создание новых позиций</h3>
                <form onSubmit={CreateNew} className="menu-builder">
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label className="form-label">Тип позиции</label>
                            <select required={true} value={type} onChange={(e) => {setType(e.target.value); setComponents([])}}>
                                <option value={"dish"}>Блюдо</option>
                                <option value={"product"}>Продукт</option>
                                <option value={"alergen"}>Аллерген</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {type=="product" && (
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label className="form-label">Аллергены</label>
                                <select multiple={true} onChange={(e)=> setComponents(Array.from(e.target.selectedOptions, option => option.value))}>
                                    {alergens.map(alergen => (
                                        <option key={alergen.id} value={alergen.id}>{alergen.name}</option>
                                    ))}
                                </select>
                                <p>Выбрано: {components.length > 0 ? components.map((comp, index) => {return findposition(parseInt(comp), alergens)?.name}).join(', ') : 'нет'}</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Количество</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required={true}
                                />
                            </div>
                        </div>
                    )}
                    {type=="dish" && (
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label className="form-label">Продукты</label>
                                <select multiple={true} onChange={(e)=> setComponents(Array.from(e.target.selectedOptions, option => option.value))}>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                                <p>Выбрано: {components.length > 0 ? components.map((comp, index) => {return findposition(parseInt(comp), products)?.name}).join(', ') : 'нет'}</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Количество</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required={true}
                                />
                            </div>
                        </div>
                    )}
                    <button type="submit" className="save-button">
                        Создать новую позицию
                    </button>
                </form>
            </div>
        </div>
    )
}