import { useEffect, useState } from 'react';
import axios from 'axios';
import MonthlyChart from '../../components/MonthlyChart';
import logger from '../../utils/logger'

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
        totalExpenses: 0,
        totalProfit: 0,
        attendance: 0,
        givenBreakfasts: 0,
        givenLunches: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today);
    const [weekStart, setWeekStart] = useState(getMondayOfWeek(today));

    useEffect(() => {
        fetchStats(selectedDate);
        
        // WebSocket для real-time обновлений
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/admin/ws/stats`;
        
        let ws;
        try {
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // Обновляем только состояние, без перезагрузки компонента
                setStats(prevStats => ({
                    ...prevStats,
                    totalPayments: data.totalPayments,
                    totalRevenue: data.totalRevenue,
                    totalExpenses: data.totalExpenses,
                    totalProfit: data.totalProfit,
                    attendance: data.attendance,
                    givenBreakfasts: data.givenBreakfasts,
                    givenLunches: data.givenLunches
                }));
            };
            
            ws.onerror = (error) => {
                logger.error('WebSocket error:', error);
            };
            
            ws.onclose = () => {
            };
        } catch (err) {
            logger.error('Failed to connect WebSocket:', err);
        }
        
        return () => {
            if (ws) {
                ws.close();
            }
        };
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

    const downloadReport = async (period) => {
        try {
            setExporting(true);
            const response = await axios.get(`/api/admin/export_stats?period=${period}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const date = new Date();
            const periodName = {
                'day': `день_${date.toISOString().split('T')[0]}`,
                'month': `месяц_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}`,
                'year': `год_${date.getFullYear()}`
            };
            
            link.setAttribute('download', `report_${periodName[period]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Ошибка при скачивании отчета');
        } finally {
            setExporting(false);
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
                    <h3>Выручка</h3>
                    <p className="stat-value">{stats.totalRevenue} ₽</p>
                </div>
                
                <div className="stat-card">
                    <h3>Расходы</h3>
                    <p className="stat-value">{stats.totalExpenses} ₽</p>
                </div>

                <div className="stat-card">
                    <h3>Прибыль</h3>
                    <p className="stat-value" style={{color: stats.totalProfit >= 0 ? '#4CAF50' : '#f44336'}}>
                        {stats.totalProfit} ₽
                    </p>
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

            <MonthlyChart />

            <div className="export-section">
                <h2>Скачать отчет</h2>
                <div className="export-buttons">
                    <button 
                        onClick={() => downloadReport('day')} 
                        disabled={exporting}
                        className="export-btn"
                    >
                        📊 За день
                    </button>
                    <button 
                        onClick={() => downloadReport('month')} 
                        disabled={exporting}
                        className="export-btn"
                    >
                        📊 За месяц
                    </button>
                    <button 
                        onClick={() => downloadReport('year')} 
                        disabled={exporting}
                        className="export-btn"
                    >
                        📊 За год
                    </button>
                </div>
            </div>
        </div>
    );
}