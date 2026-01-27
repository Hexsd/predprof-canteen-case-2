import React, { useState, useEffect, use } from 'react'
import axios from 'axios'

export default function Products() {
    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);

    const fetchAll = async () => {
        try {
          const response = await axios.get('/api/cook/all');
          setDishes(response.data[0]);
          setProducts(response.data[1]);
        } catch (error) {
          console.error('Error fetching products and dishes:', error);
        }
    }
    useEffect(() =>
    {
        fetchAll();
    },[])
    function Join(dish) {
        const product_names = [];
        dish.forEach(element => {
            console.log(element);
            products.forEach(product => {
                if (parseInt(element)==product.id)
                {
                    console.log("sovpadenye")
                    product_names.push(product.name)
                    return;
                }
            })
        });
        return product_names
    }
    if (!dishes[0]) {
        return <div className="loading">Загрузка продуктов...</div>
    }
    return ( 

        <div>
            <table>
                <tr>
                    <th>Тип</th>
                    <th>Название</th>
                    <th>Компоненты</th>
                    <th>Количество</th>
                </tr>
                {dishes.map((item, index) => (
                    <tr>
                        <th>Блюдо</th>
                        <th>{item.name}</th>
                        <th>
                            {Join(item.products.split('#')).map((product, index) => (
                                <p>{product}</p>
                            ))}
                        </th>
                        <th>{item.amount}</th>
                    </tr>
                    
                    ))}
                {/* {products.map((item, index) => (
                    // alert(item.name)
                    <tr>
                        <th>Продукт</th>
                        <th>{item.name}</th>
                        <th>
                            {item.products.split('#').map((product, index) => (
                                    <p>{parseInt(product)}</p>
                            ))}
                        </th>
                        <th>{item.amount}</th>
                    </tr>
                    ))} */}
            </table>
                   
            

        </div>
    )
}