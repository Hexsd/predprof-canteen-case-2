import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import logger from '../utils/logger'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MonthlyChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleMetrics, setVisibleMetrics] = useState({
    revenue: true,
    expenses: true,
    profit: true,
    attendance: true,
    meals: true
  });

  const metricsConfig = {
    revenue: {
      label: 'Выручка (₽)',
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      yAxisID: 'y'
    },
    expenses: {
      label: 'Расходы (₽)',
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      yAxisID: 'y'
    },
    profit: {
      label: 'Прибыль (₽)',
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      yAxisID: 'y'
    },
    attendance: {
      label: 'Посетители',
      borderColor: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      yAxisID: 'y1'
    },
    meals: {
      label: 'Продано блюд',
      borderColor: '#F44336',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      yAxisID: 'y1'
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/admin/ws/stats`;
    
    let ws;
    let lastFetch = Date.now();
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const now = Date.now();
        if (now - lastFetch > 30000) {
          lastFetch = now;
          fetchMonthlyStats();
        }
      };
      
      ws.onerror = (error) => {
        logger.error('Chart WebSocket error:', error);
      };
    } catch (err) {
      logger.error('Failed to connect WebSocket for chart:', err);
    }
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chartData) {
      updateChartVisibility();
    }
  }, [visibleMetrics]);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats_monthly');
      processChartData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки графика');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const labels = data.map(d => {
      const date = new Date(d.date);
      return date.getDate();
    });

    const datasets = [];

    if (visibleMetrics.revenue) {
      datasets.push({
        label: metricsConfig.revenue.label,
        data: data.map(d => d.revenue),
        borderColor: metricsConfig.revenue.borderColor,
        backgroundColor: metricsConfig.revenue.backgroundColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: metricsConfig.revenue.yAxisID
      });
    }

    if (visibleMetrics.expenses) {
      datasets.push({
        label: metricsConfig.expenses.label,
        data: data.map(d => d.expenses),
        borderColor: metricsConfig.expenses.borderColor,
        backgroundColor: metricsConfig.expenses.backgroundColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: metricsConfig.expenses.yAxisID
      });
    }

    if (visibleMetrics.profit) {
      datasets.push({
        label: metricsConfig.profit.label,
        data: data.map(d => d.profit),
        borderColor: metricsConfig.profit.borderColor,
        backgroundColor: metricsConfig.profit.backgroundColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: metricsConfig.profit.yAxisID
      });
    }

    if (visibleMetrics.attendance) {
      datasets.push({
        label: metricsConfig.attendance.label,
        data: data.map(d => d.attendance),
        borderColor: metricsConfig.attendance.borderColor,
        backgroundColor: metricsConfig.attendance.backgroundColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: metricsConfig.attendance.yAxisID
      });
    }

    if (visibleMetrics.meals) {
      datasets.push({
        label: metricsConfig.meals.label,
        data: data.map(d => d.meals),
        borderColor: metricsConfig.meals.borderColor,
        backgroundColor: metricsConfig.meals.backgroundColor,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        yAxisID: metricsConfig.meals.yAxisID
      });
    }

    setChartData({
      labels,
      datasets
    });
  };

  const updateChartVisibility = () => {
    fetchMonthlyStats();
  };

  const toggleMetric = (metric) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Статистика за текущий месяц',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Сумма (₽)',
          font: {
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Количество',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  if (loading && !chartData) return <div className="loading">Загрузка графика...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="chart-container">
      <div className="chart-metrics-toggle">
        <h3>Показываемые метрики:</h3>
        <div className="metrics-buttons">
          {Object.entries(metricsConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`metric-btn ${visibleMetrics[key] ? 'active' : 'inactive'}`}
              style={{
                borderColor: config.borderColor,
                color: visibleMetrics[key] ? config.borderColor : '#ccc'
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {chartData && (
        <div className="chart-wrapper">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
