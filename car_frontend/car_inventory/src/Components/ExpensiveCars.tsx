import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  stock: number;
}

const ExpensiveCars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpensiveCars = async () => {
      try {
        const res = await axiosInstance.get("/cars/expensive/");
        console.log("Fetched expensive cars:", res.data);
        setCars(res.data.expensive_cars || []);
      } catch (err: any) {
        console.error("Error fetching expensive cars:", err);
        setError("Failed to load expensive cars.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpensiveCars();
  }, []);

  return (
    <div className="expensive-cars-container">
      {/* Embedded CSS for styling and animations */}
      <style>{`
        /* General Styling */
        .expensive-cars-container {
          background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
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
          background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
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
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .header-icon {
          animation: pulse 2s infinite;
        }
        
        .page-header::before {
          content: '💎';
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
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          transform: scaleX(0);
          transform-origin: left;
          animation: expandWidth 1s ease-out 0.5s forwards;
        }
        
        .header-subtitle {
          font-size: 1rem;
          opacity: 0.8;
          margin-top: 0.5rem;
          font-weight: normal;
          animation: fadeInRight 0.8s ease forwards;
          animation-delay: 0.2s;
          opacity: 0;
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
          background: linear-gradient(90deg, #2563eb, #3b82f6);
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
          transition: all 0.3s ease;
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
          background: linear-gradient(180deg, #3b82f6, #2563eb);
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
        
        .car-id {
          font-family: monospace;
          font-size: 0.9rem;
          color: #64748b;
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .inventory-table tr:hover .car-id {
          background: #f1f5f9;
        }
        
        .price-cell {
          font-weight: 600;
          color: #0f172a;
          background: rgba(59, 130, 246, 0.08);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          display: inline-block;
          transition: all 0.3s ease;
        }
        
        .inventory-table tr:hover .price-cell {
          background: rgba(59, 130, 246, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .stock-available {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          color: #065f46;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .stock-unavailable {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: #b91c1c;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .inventory-table tr:hover .stock-available,
        .inventory-table tr:hover .stock-unavailable {
          transform: translateY(-2px);
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
          border: 3px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          margin-top: 1.5rem;
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        /* Action Button */
        .action-button {
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 2rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
          background: linear-gradient(90deg, #1d4ed8, #2563eb);
        }
        
        .action-button:active {
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
          <h2>
            <span className="header-icon">💎</span> Premium Collection
          </h2>
          <p className="header-subtitle">
            Explore our exclusive selection of luxury vehicles
          </p>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="custom-spinner" />
              <p className="loading-text">Discovering luxury vehicles...</p>
            </div>
          ) : error ? (
            <div className="error-alert">
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💎</div>
              <h3>Premium Collection</h3>
              <p className="empty-state-message">
                No premium vehicles currently available in inventory.
                Please check back soon for new arrivals.
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
                  <tr key={car.id}>
                    <td>
                      <span className="car-id">#{car.id}</span>
                    </td>
                    <td>
                      <span className="brand-badge">{car.brand}</span>
                    </td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>
                      <span className="price-cell">
                        ₹{car.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      {car.stock > 0 ? (
                        <span className="stock-available">
                          {car.stock} Available
                        </span>
                      ) : (
                        <span className="stock-unavailable">
                          Out of Stock
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

      
    </div>
  );
};

export default ExpensiveCars;