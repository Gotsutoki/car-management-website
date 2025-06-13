import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  stock: number;
}

const LowStock: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      navigate("/unauthorized");
      return;
    }

    const fetchLowStockCars = async () => {
      try {
        const response = await axiosInstance.get("/cars/low-stock/");
        console.log("Low stock cars response:", response.data);

        // Check if the response has the expected structure
        if (response.data && Array.isArray(response.data.low_stock_cars)) {
          setCars(response.data.low_stock_cars);
        } else if (Array.isArray(response.data)) {
          setCars(response.data);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setCars([]);
          setError("Received unexpected data format from server");
        }
      } catch (err) {
        console.error("Error fetching low stock cars:", err);
        setError("Failed to load low stock cars");
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockCars();
  }, [user, navigate]);

  return (
    <div className="low-stock-container">
      {/* Embedded CSS for styling and animations */}
      <style>{`
        /* General Styling */
        .low-stock-container {
          background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
          min-height: 100vh;
          padding: 2rem 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        /* Page Content Wrapper */
        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s ease forwards;
        }
        
        /* Header Styling */
        .page-header {
          background: linear-gradient(90deg, #334155 0%, #0f172a 100%);
          color: white;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .page-header h2 {
          margin: 0;
          font-weight: 600;
          position: relative;
          z-index: 2;
          animation: fadeInRight 0.8s ease forwards;
        }
        
        .page-header::before {
          content: '🚗';
          position: absolute;
          right: 3rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 3rem;
          opacity: 0.2;
          z-index: 1;
        }
        
        .page-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
          transform: scaleX(0);
          transform-origin: left;
          animation: expandWidth 1s ease-out 0.5s forwards;
        }
        
        /* Table Styling */
        .table-container {
          padding: 2rem;
        }
        
        .inventory-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .inventory-table thead {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
          color: white;
        }
        
        .inventory-table th {
          padding: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.85rem;
          border: none;
          text-align: left;
        }
        
        .inventory-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          background-color: white;
          opacity: 0;
          animation: fadeInRow 0.5s ease-out forwards;
          position: relative;
        }
        
        .inventory-table tbody tr:nth-child(1) { animation-delay: 0.1s; }
        .inventory-table tbody tr:nth-child(2) { animation-delay: 0.2s; }
        .inventory-table tbody tr:nth-child(3) { animation-delay: 0.3s; }
        .inventory-table tbody tr:nth-child(4) { animation-delay: 0.4s; }
        .inventory-table tbody tr:nth-child(5) { animation-delay: 0.5s; }
        .inventory-table tbody tr:nth-child(6) { animation-delay: 0.6s; }
        .inventory-table tbody tr:nth-child(7) { animation-delay: 0.7s; }
        .inventory-table tbody tr:nth-child(8) { animation-delay: 0.8s; }
        .inventory-table tbody tr:nth-child(9) { animation-delay: 0.9s; }
        .inventory-table tbody tr:nth-child(10) { animation-delay: 1s; }
        
        .inventory-table tbody tr::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: linear-gradient(180deg, #f59e0b, #ef4444);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .inventory-table tbody tr:hover::before {
          opacity: 1;
        }
        
        .inventory-table tbody tr:hover {
          background-color: #f8fafc;
          transform: translateX(3px);
        }
        
        .inventory-table td {
          padding: 1rem;
          vertical-align: middle;
          transition: all 0.3s ease;
        }
        
        .low-stock-row {
          background-color: rgba(239, 68, 68, 0.08) !important;
        }
        
        .low-stock-row:hover {
          background-color: rgba(239, 68, 68, 0.12) !important;
        }
        
        .stock-critical {
          color: #ef4444;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        
        .stock-warning {
          color: #f59e0b;
          font-weight: bold;
        }
        
        .brand-badge {
          display: inline-block;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          background: #e2e8f0;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .inventory-table tr:hover .brand-badge {
          background: #cbd5e1;
          transform: translateY(-2px);
        }
        
        .price-cell {
          font-weight: 600;
          color: #059669;
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          animation: fadeIn 0.8s ease forwards;
        }
        
        .empty-state-icon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          color: #cbd5e1;
        }
        
        .empty-state-message {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 2rem;
        }
        
        /* Error Alert */
        .error-alert {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          color: #b91c1c;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          animation: shake 0.5s ease-in-out;
        }
        
        /* Loading State */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }
        
        .custom-spinner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(239, 68, 68, 0.1);
          border-top-color: #ef4444;
          animation: spin 1s linear infinite;
        }
        
        /* Back Button */
        .back-button {
          background: linear-gradient(90deg, #334155, #475569);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 2rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .back-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          background: linear-gradient(90deg, #1e293b, #334155);
        }
        
        .back-button:active {
          transform: translateY(-1px);
        }
        
        .button-container {
          margin-top: 2rem;
          text-align: center;
          animation: fadeIn 1s ease-out forwards;
          animation-delay: 1s;
          opacity: 0;
        }
        
        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes expandWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>

      <div className="content-wrapper">
        <div className="page-header">
          <h2>Low Stock Vehicles</h2>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="custom-spinner" />
            </div>
          ) : error ? (
            <div className="error-alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚙</div>
              <h3>All Stocked Up!</h3>
              <p className="empty-state-message">
                All vehicles in your inventory have sufficient stock levels.
              </p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price (₹)</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr
                    key={car.id}
                    className={car.stock <= 3 ? "low-stock-row" : ""}
                  >
                    <td>#{car.id}</td>
                    <td>
                      <span className="brand-badge">{car.brand}</span>
                    </td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td className="price-cell">
                      ₹{car.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className={car.stock <= 2 ? "stock-critical" : "stock-warning"}>
                      {car.stock}
                      {car.stock <= 2 && (
                        <span className="ms-2">
                          <i className="fas fa-exclamation-triangle"></i>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="button-container">
        <button className="back-button" onClick={() => navigate("/home")}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LowStock;