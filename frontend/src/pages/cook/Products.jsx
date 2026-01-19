import React, { useState, useEffect, use } from 'react'
import axios from 'axios'

export default function Products() {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
          const response = await axios.get('/api/cook/products');
          setProducts(response.data);
        } catch (error) {
          console.error('Error fetching menu:', error);
        }
    }
    useEffect(() =>
    {
        fetchProducts();
    },[])

    if (!products[0]) {
        return <div className="loading">Загрузка продуктов...</div>
    }
    return ( 
        <div>
            <ul>
                {/* <li>{products}</li> */}
                {/* <li>{products[0].name}</li> */}
                    {products.map((item, index) => (
                    // alert(item.name)
                    <li key={index}>{item}</li>
                    ))}
            </ul>
            

        </div>
    )
}