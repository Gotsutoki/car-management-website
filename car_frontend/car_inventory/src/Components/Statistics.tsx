import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "./axiosInstance";
import { UserContext } from "../UserContext";

interface CarStats {
  total_cars: number;
  average_price: number;
  total_stock: number;
  unique_models: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<CarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await axiosInstance.get("/cars/statistics/");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Embedded CSS for animations and styling */}
      <style>{`
        .statistics-container {
          padding: 2rem 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          min-height: 100vh;
        }
        
        .stats-header {
          opacity: 0;
          animation: slideDown 0.8s ease-out forwards;
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }
        
        .stats-header::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #3498db, #5352ed);
          border-radius: 3px;
        }
        
        .stats-title {
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-size: 2.2rem;
        }
        
        .stats-subtitle {
          color: #7f8c8d;
          font-size: 1.1rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 0 1rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: transform 0.5s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card:hover::before {
          transform: scaleY(1);
        }
        
        .card-primary::before { background: #3498db; }
        .card-success::before { background: #2ecc71; }
        .card-warning::before { background: #f39c12; }
        .card-info::before { background: #1abc9c; }
        
        .stat-card-label {
          font-size: 1.1rem;
          color: #7f8c8d;
          margin-bottom: 0.8rem;
          font-weight: 500;
        }
        
        .stat-card-value {
          font-size: 2.2rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          transition: color 0.3s ease;
        }
        
        .stat-card:hover .stat-card-value {
          color: #3498db;
        }
        
        .stat-icon {
          font-size: 2rem;
          opacity: 0.15;
          position: absolute;
          bottom: 10px;
          right: 10px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .stat-card:hover .stat-icon {
          transform: scale(1.2) rotate(10deg);
          opacity: 0.25;
        }
        
        .error-alert {
          background-color: #ff7675;
          color: white;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          margin-bottom: 2rem;
          animation: shake 0.5s ease-in-out;
        }
        
        /* Animations */
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        
        .card-1 { animation: fadeUp 0.6s ease-out 0.2s forwards; }
        .card-2 { animation: fadeUp 0.6s ease-out 0.4s forwards; }
        .card-3 { animation: fadeUp 0.6s ease-out 0.6s forwards; }
        .card-4 { animation: fadeUp 0.6s ease-out 0.8s forwards; }
      `}</style>

      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title">📊 Inventory Analytics</h2>
          <p className="stats-subtitle">Real-time insights for your automotive inventory</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card card-primary card-1">
              <h5 className="stat-card-label">Total Vehicles</h5>
              <p className="stat-card-value">{stats.total_cars.toLocaleString()}</p>
              <div className="stat-icon">🚗</div>
            </div>

            <div className="stat-card card-success card-2">
              <h5 className="stat-card-label">Average Price</h5>
              <p className="stat-card-value">
                ₹{Number(stats.average_price).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="stat-icon">📈</div>
            </div>

            <div className="stat-card card-warning card-3">
              <h5 className="stat-card-label">Current Stock</h5>
              <p className="stat-card-value">{stats.total_stock.toLocaleString()}</p>
              <div className="stat-icon">📦</div>
            </div>

            <div className="stat-card card-info card-4">
              <h5 className="stat-card-label">Unique Models</h5>
              <p className="stat-card-value">{stats.unique_models.toLocaleString()}</p>
              <div className="stat-icon">🔍</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;