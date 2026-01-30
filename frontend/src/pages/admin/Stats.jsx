import { useEffect, useState } from 'react';
import axios from 'axios';

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Stats() {
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalRevenue: 0,
        attendance: 0,
        givenBreakfasts: 0,
        givenLunches: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today);
    const [weekStart, setWeekStart] = useState(getMondayOfWeek(today));

    useEffect(() => {
        fetchStats(selectedDate);
    }, [selectedDate]);

    const fetchStats = async (date) => {
        try {
            setLoading(true);
            const dateStr = date.toISOString().split('T')[0];
            const response = await axios.get(`/api/admin/stats?date=${dateStr}`);
            setStats(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Ошибка загрузки статистики');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (weekStart) => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(weekStart);

    const goToPreviousWeek = () => {
        const newWeekStart = new Date(weekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        setWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(weekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        setWeekStart(newWeekStart);
    };

    const selectDate = (date) => {
        setSelectedDate(date);
    };

    const formatDate = (date) => {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return `${days[date.getDay()]} ${date.getDate()}`;
    };

    const formatMonthYear = (date) => {
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    if (loading) return <div className="loading">Загрузка статистики...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="stats-container">
            <h1 className="page-title">Панель администратора</h1>
            
            <div className="month-year-header">
                {formatMonthYear(weekStart)}
            </div>

            <div className="week-selector">
                <button onClick={goToPreviousWeek} className="week-nav-btn week-nav-prev">
                    ‹‹
                </button>
                
                <div className="week-dates">
                    {weekDates.map((date) => (
                        <button
                            key={date.toISOString()}
                            onClick={() => selectDate(date)}
                            className={`week-date-btn ${
                                date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            {formatDate(date)}
                        </button>
                    ))}
                </div>
                
                <button onClick={goToNextWeek} className="week-nav-btn week-nav-next">
                    ››
                </button>
            </div>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Всего оплат</h3>
                    <p className="stat-value">{stats.totalPayments}</p>
                </div>
                
                <div className="stat-card">
                    <h3>Общий доход</h3>
                    <p className="stat-value">{stats.totalRevenue} ₽</p>
                </div>
                
                <div className="stat-card">
                    <h3>Уникальные посетители</h3>
                    <p className="stat-value">{stats.attendance}</p>
                </div>

                <div className="stat-card">
                    <h3>Завтраков выдано</h3>
                    <p className="stat-value">{stats.givenBreakfasts}</p>
                </div>

                <div className="stat-card">
                    <h3>Обедов выдано</h3>
                    <p className="stat-value">{stats.givenLunches}</p>
                </div>
            </div>
        </div>
    );
}