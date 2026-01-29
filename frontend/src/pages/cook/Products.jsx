import React, { useState, useEffect, use } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Products() {
    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const [type, setType] = useState("product");
    const [name, setName] = useState("");
    const [components, setComponents] = useState([]);
    const [amount, setAmount] = useState(1);

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

    const handleChanges = async (e) => {
        e.preventDefault();
        setError('')
        console.log("вроде начал постить");
        const data = {
            dishes: dishes,
            products: products,
            alergens: alergens
        }
        try {
            await axios.post('/api/cook/change', data)
            await fetchAll()
            } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка отправки данных в БД')
        }
    }

    function ChangeDishes(index, new_value) {
        const new_dishes = dishes.map((item, i) => {
            if (i === index) {
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
        console.log(`/api/cook/new_${type}`)
        setProducts(new_products);
    } 

    const CreateNew = async(e) =>  {
        e.preventDefault();
        setError('')
        console.log("вроде начал постить");
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
        console.log(data2);
        console.log(`/api/cook/new_${type}`)
        try {
            await axios.post(`/api/cook/new_${type}`, data2)
            await fetchAll()
            } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка отправки данных в БД')
        }
    }

    function Join_names(any_item, items1) {
        const any_item_names = [];
        items1.forEach(product => {
            any_item.forEach(element => {
                if (parseInt(element)==product.id)
                {
                    console.log("sovpadenye");
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
    if (!dishes[0]) {
        return <div className="loading">Загрузка продуктов...</div>
    }
    return ( 
        <div>
            <h1>Таблица блюд</h1>
            <form onSubmit={handleChanges}>
                <table style={{border: "1px solid black"}}>
                    <tr>
                        <th>Название</th>
                        <th>Продукты</th>
                        <th>Количество</th>
                    </tr>
                    {dishes.map((item, index) => (
                        <tr key={index}>
                            <th>{item.name}</th>
                            <th>
                                {item.products!="" && Join_names(item.products.split('#'), products).map((product, index) => (
                                    <p>{product}</p>
                                ))}
                            </th>
                            <th>
                                <input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => ChangeDishes(index, e.target.value)}
                                    required
                                ></input>
                            </th>
                        </tr>
                        ))}
                </table>
                <h1>Таблица продуктов</h1>
                <table style={{border: "1px solid black"}}>
                    <tr>
                        <th>Название</th>
                        <th>Аллергены</th>
                        <th>Количество</th>
                    </tr>
                    {products.map((item, index) => (
                        <tr key={index}>
                            <th>{item.name}</th>
                            <th>
                                {item.alergens!="" && Join_names(item.alergens.split('#'), alergens).map((alergen, index) => (
                                    <p>{alergen}</p>
                                ))}
                                {item.alergens==="" && (<p>Продукт гипоаллергеннен</p>) }
                            </th>
                            <th>
                                <input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => ChangeProducts(index, e.target.value)}
                                    required
                                ></input>
                            </th>
                        </tr>
                        ))}
                </table>
                <button type="submit" className="form-button">
                    Внести изменения
                </button>
            </form>

            <div>
                <form onSubmit={CreateNew} style={{border: "1px solid black"}}>
                    <table>
                        <tr>
                            <th>Тип</th>
                            <th>Название</th>
                            {type=="product" && (<div><th>Аллергены</th><th>Количество</th></div>)}
                            {type=="dish" && (<div><th>Продукты</th><th>Количество</th></div>)}
                        </tr>
                        <tr>
                                <th><select required={true} value={type} onChange={(e) => {setType(e.target.value); setComponents([])}}>
                                    <option value={"dish"}>Блюдо</option>
                                    <option value={"product"}>Продукт</option>
                                    <option value={"alergen"}>Аллерген</option>
                                </select></th>
                                <th><input
                                    type="string"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                ></input>
                                </th>
                                <th>
                                    {type=="product" && (
                                        <div>
                                            <th>
                                                <select multiple={true} onChange={(e)=> setComponents(Array.from(e.target.selectedOptions, option => option.value))}>
                                                    {alergens.map(alergen => (
                                                        <option key={alergen.id} value={alergen.id}>{alergen.name}</option>
                                                    ))}
                                                </select>
                                                <p>Выбрано {components.join(', ')}</p>
                                            </th>
                                            <th><input 
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required={true}
                                                ></input>
                                            </th>
                                        </div>
                                    )}
                                    {type=="dish" && (
                                        <div>
                                            <th>
                                                <select multiple={true} onChange={(e)=> setComponents(Array.from(e.target.selectedOptions, option => option.value))}>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>{product.name}</option>
                                                    ))}
                                                </select>
                                                <p>Выбрано {components.join(', ')}</p>
                                            </th>
                                            <th><input 
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required={true}
                                                ></input>
                                            </th>
                                        </div>
                                    )}
                                </th>
                                
                                
                            
                        </tr>
                        
                    </table>
                <button type="submit" className="form-button">
                    Создать новую позицию
                </button>
                </form>
            </div>
            

        </div>
    )
}