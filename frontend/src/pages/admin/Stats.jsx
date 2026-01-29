import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Stats() {
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalRevenue: 0,
        attendance: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Ошибка загрузки статистики');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка статистики...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="stats-container">
            <h1>Панель администратора</h1>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Всего оплат</h3>
                    <p className="stat-value">{stats.totalPayments}</p>
                </div>
                
                <div className="stat-card">
                    <h3>Общий доход</h3>
                    <p className="stat-value">{stats.totalRevenue}</p>
                </div>
                
                <div className="stat-card">
                    <h3>Посещаемость</h3>
                    <p className="stat-value">{stats.attendance}</p>
                </div>
            </div>
        </div>
    );
}