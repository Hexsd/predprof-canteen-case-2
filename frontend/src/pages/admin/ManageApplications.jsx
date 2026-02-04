import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../../hooks/useNotification'

export default function ManageApplications() {
    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const [applications, setApplications] = useState([]);
    const [showDenied, setShowDenied] = useState(true);
    const [showAllowed, setShowAllowed] = useState(true);
    const [users, setUsers] = useState([]);
    

    const { notify } = useNotification();

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

    const fetchApps = async () => {
        try {
            const response = await axios.get('/api/admin/appsas_all');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error(error.response?.data?.detail || 'Ошибка загрузки пользователей');
        } 
    }
    
    useEffect(() => {
        fetchAll();
        fetchApps();
        fetchUsers();
    }, []);

    const confirmApps = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/apps_confirm', applications);
            notify("Изменение статуса заявок выполнено", "success");
        } catch (error) {
            console.error('Error uploading applications:', error);
        }
    };

    function findposition(id, table) {
        let elem = {};
        table.forEach(element => {
            if (element.id == id) {
                elem = element;
            }
        });
        return elem;
    }
    
    return (
        <div className="cook-container">
            <form onSubmit={confirmApps}>
                <button type="submit" className="add-dish-btn">
                    Подтвердить изменения
                </button>
                
                <div className="week-selector">
                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                checked={showDenied}
                                onChange={(e) => setShowDenied(e.target.checked)}
                            />
                            Показывать отклонённые
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                checked={showAllowed}
                                onChange={(e) => setShowAllowed(e.target.checked)}
                            />
                            Показывать одобренные
                        </label>
                    </div>
                </div>

                <table className="cook-table">
                    <thead>
                        <tr>
                            <th>Дата создания заявки</th>
                            <th>Пользователь</th>
                            <th>Продукты (количество × цена)</th>
                            <th>Итоговая цена</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app, index) => {
                            let summary = 0;
                            
                            if (app.status === "Одобрена" && !showAllowed) return null;
                            if (app.status === "Отклонена" && !showDenied) return null;
                            
                            const user = findposition(parseInt(app.user_id), users);
                            
                            return (
                                <tr key={app.id || index}>
                                    <td>{app.date}</td>
                                    <td>{user.name} ({user.email})</td>
                                    <td>
                                        {app.list_of_products.split('#').map((productId, idx) => {
                                            const product = findposition(parseInt(productId), products);
                                            const amount = app.amount_of_products.split('#')[idx];
                                            const price = app.price_of_products.split('#')[idx];
                                            summary += parseInt(amount) * parseInt(price);
                                            return (
                                                <div key={idx}>
                                                    {product?.name || 'Неизвестный продукт'} × {amount} ({price} ₽/шт.)
                                                </div>
                                            );
                                        })}
                                    </td>
                                    <td>{summary} ₽</td>
                                    <td>
                                        <select 
                                            value={app.status} 
                                            onChange={(e) => {
                                                const newApplications = [...applications];
                                                newApplications[index] = {...app, status: e.target.value};
                                                setApplications(newApplications);
                                            }}
                                            className="form-input"
                                        >
                                            <option value="На рассмотрении">На рассмотрении</option>
                                            <option value="Одобрена">Одобрена</option>
                                            <option value="Отклонена">Отклонена</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </form>
        </div>
    );
}