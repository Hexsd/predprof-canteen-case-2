import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../../hooks/useNotification'

export default function CreateApplications() {
    const applictaiontemplate = {
        list_of_products: "",
        amount_of_products: "",
        price_of_products: "",
    };

    const [products, setProducts] = useState([]);
    const { notify } = useNotification();
    const [application, setApplication] = useState(applictaiontemplate);
    const [myapplications, setMyApplications] = useState([]);

    useEffect(() => {
        fetchAll();
        fetchmyapplications();
    }, []);

    const fetchAll = async () => {
        try {
            const response = await axios.get('/api/cook/all');
            setProducts(response.data[1]);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchmyapplications = async () => {
        try {
            const response = await axios.get('/api/cook/my_apps');
            setMyApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const confirmApplication = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/cook/new_application', application);
            await fetchmyapplications();
            setApplication(applictaiontemplate);
            notify("Заявка успешно отправлена", "success");
        } catch (error) {
            notify(error.response?.data?.detail || 'Ошибка отправки заявки', 'error');
        }
    };

    function findposition(id, table) {
        let elem = {};
        table.forEach(element => {
            if (element.id==id)
            {
                elem = element
            }
        });
        //console.log(elem);
        return elem
    }

    const getStatusColor = (status) => {
        if (status.trim() === 'Одобрена') return 'var(--color-success)';
        if (status.trim() === 'Отклонена') return 'var(--color-error)';
        if (status.trim() === 'На рассмотрении') return 'var(--color-unsure)';
        return 'var(--color-text-secondary)';
    };

    const removeProduct = (index, productss, amounts, prices) => {
        productss.splice(index, 1);
        amounts.splice(index, 1);
        prices.splice(index, 1);
        setApplication({
            list_of_products: productss.join('#'),
            amount_of_products: amounts.join('#'),
            price_of_products: prices.join('#'),
        });
    };

    return (
        <div className="cook-container">
            <div className="cook-section">
                <h2>Создать заявку на закупку</h2>
                <form onSubmit={confirmApplication} className="menu-builder">
                    <table className="cook-table" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Продукт</th>
                                <th>Количество, шт.</th>
                                <th>Цена, руб (за шт.)</th>
                                <th>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const productss = application.list_of_products.split('#');
                                const amounts = application.amount_of_products.split('#');
                                const prices = application.price_of_products.split('#');
                                
                                if (application.list_of_products.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                                Добавьте продукты для создания заявки
                                            </td>
                                        </tr>
                                    );
                                }
                                
                                return productss.map((product, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <select 
                                                value={parseInt(product)} 
                                                onChange={(e) => {
                                                    const newProducts = [...productss];
                                                    newProducts[index] = e.target.value;
                                                    setApplication(prev => ({
                                                        ...prev,
                                                        list_of_products: newProducts.join('#')
                                                    }));
                                                }}
                                                className="form-input"
                                            >
                                                {products.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={amounts[index]}
                                                onChange={(e) => {
                                                    const newAmounts = [...amounts];
                                                    newAmounts[index] = e.target.value;
                                                    setApplication(prev => ({
                                                        ...prev,
                                                        amount_of_products: newAmounts.join('#')
                                                    }));
                                                }}
                                                className="form-input"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={prices[index]}
                                                onChange={(e) => {
                                                    const newPrices = [...prices];
                                                    newPrices[index] = e.target.value;
                                                    setApplication(prev => ({
                                                        ...prev,
                                                        price_of_products: newPrices.join('#')
                                                    }));
                                                }}
                                                className="form-input"
                                            />
                                        </td>
                                        <td>
                                            <button 
                                                type="button" 
                                                onClick={() => removeProduct(index, [...productss], [...amounts], [...prices])}
                                                className="remove-btn"
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                    
                    <button 
                        type="button" 
                        onClick={() => {
                            const baseProduct = "1";
                            const baseAmount = "1";
                            const basePrice = "100";
                            
                            setApplication(prev => ({
                                list_of_products: prev.list_of_products 
                                    ? prev.list_of_products+'#'+baseProduct
                                    : baseProduct,
                                amount_of_products: prev.amount_of_products 
                                    ? prev.amount_of_products+'#'+baseAmount
                                    : baseAmount,
                                price_of_products: prev.price_of_products 
                                    ? prev.price_of_products+'#'+basePrice
                                    : basePrice,
                            }));
                        }}
                        className="add-dish-btn" style={{ marginBottom: '15px' }}
                    >
                        + Добавить продукт
                    </button>
                    
                    <button 
                        type="submit" 
                        className="add-dish-btn" 
                        disabled={!application.list_of_products || application.list_of_products === ""}
                        style={{ marginTop: '0', marginBottom: '15px', marginLeft: '10px' }}
                    >
                        Отправить заявку
                    </button>
                </form>
            </div>
            
            <div className="cook-section">
                <h2>Ваши заявки</h2>
                {myapplications.length === 0 ? (
                    <div className="no-menu-message">
                        <p>Вы ещё не составляли ни одной заявки</p>
                        <p className="text-secondary">Создайте первую заявку на закупку продуктов</p>
                    </div>
                ) : (
                    <table className="cook-table">
                        <thead>
                            <tr>
                                <th>Дата подачи</th>
                                <th>Продукты (количество × цена)</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myapplications.map((app, index) => {
                                const statusColor = getStatusColor(app.status);
                                return (
                                    <tr key={index}>
                                        <td>{app.date}</td>
                                        <td>
                                            {app.list_of_products.split('#').map((productId, idx) => {
                                                const product = findposition(parseInt(productId), products);
                                                const amount = app.amount_of_products.split('#')[idx] || 0;
                                                const price = app.price_of_products.split('#')[idx] || 0;
                                                return (
                                                    <div key={idx} style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                        {product.name} × {amount} ({price} ₽/шт.)
                                                    </div>
                                                );
                                            })}
                                        </td>
                                        <td>
                                            <span 
                                                style={{ 
                                                    color: statusColor,
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                                    borderRadius: '4px',
                                                    backgroundColor: `${statusColor}15`
                                                }}
                                            >
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}