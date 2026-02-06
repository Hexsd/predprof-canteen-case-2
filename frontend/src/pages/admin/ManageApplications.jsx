import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../../hooks/useNotification'
import logger from '../../utils/logger'

export default function ManageApplications() {
    const [dishes, setDishes] = useState([]);
    const [products, setProducts] = useState([]);
    const [alergens, setAlergens] = useState([]);
    const [applications, setApplications] = useState([]);
    const [prevApplications, setPrevApplications] = useState([]);
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
            logger.error('Error fetching products and dishes:', error);
        }
    }

    const fetchApps = async () => {
        try {
            const response = await axios.get('/api/admin/appsas_all');
            setApplications(response.data);
            setPrevApplications(response.data);
        } catch (error) {
            logger.error('Error fetching applications:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            logger.error('Error fetching users:', error);
            logger.error(error.response?.data?.detail || 'Ошибка загрузки пользователей');
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
            await fetchApps()
            notify("Изменение статуса заявок выполнено", "success");
        } catch (error) {
            logger.error('Error uploading applications:', error);
        }
    };

    const getStatusColor = (status) => {
        if (status.trim() === 'Одобрена') return 'var(--color-success)';
        if (status.trim() === 'Отклонена') return 'var(--color-error)';
        if (status.trim() === 'На рассмотрении') return 'var(--color-unsure)';
        return 'var(--color-text-secondary)';
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

                <div className="admin-filters">
                    <label className="admin-checkbox-styled">
                        <input
                            type="checkbox"
                            checked={showDenied}
                            onChange={(e) => setShowDenied(e.target.checked)}
                        />
                        <span className="checkbox-label">Показывать отклонённые</span>
                    </label>

                    <label className="admin-checkbox-styled">
                        <input
                            type="checkbox"
                            checked={showAllowed}
                            onChange={(e) => setShowAllowed(e.target.checked)}
                        />
                        <span className="checkbox-label">Показывать одобренные</span>
                    </label>
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

                            let status_color = getStatusColor(app.status);

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
                                                    {product?.name || 'Продукт отсутствует в базе (заявка недействительна)'} × {amount} ({price} ₽/шт.)
                                                </div>
                                            );
                                        })}
                                    </td>
                                    <td>{summary} ₽</td>
                                    <td>
                                        {prevApplications[index].status == "Одобрена" ? (
                                            <span
                                                style={{
                                                    color: status_color,
                                                    fontWeight: '600',
                                                    display: 'inline-block',
                                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                                    borderRadius: '4px',
                                                    backgroundColor: `${status_color}15`
                                                }}
                                            >
                                                Одобрена
                                            </span>
                                        ) : (<select
                                            value={app.status}
                                            onChange={(e) => {
                                                const newApplications = [...applications];
                                                newApplications[index] = { ...app, status: e.target.value };
                                                setApplications(newApplications);
                                            }}
                                            className="form-input"
                                        >
                                            <option value="На рассмотрении">На рассмотрении</option>
                                            <option value="Одобрена">Одобрена</option>
                                            <option value="Отклонена">Отклонена</option>
                                        </select>)}
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