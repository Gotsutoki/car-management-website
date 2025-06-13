// src/pages/Customers.tsx
import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

interface Customer {
  cust_id: number;
  name: string;
  phone: string;
  address: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({
    cust_id: Math.floor(100000 + Math.random() * 900000),
    name: "",
    phone: "",
    address: "",
  });
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [animateTable, setAnimateTable] = useState(false);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get("/customers/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setCustomers(data);
      // Trigger table animation after data is loaded
      setTimeout(() => setAnimateTable(true), 100);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/unauthorized");
    } else {
      fetchCustomers();
    }
  }, [user, navigate]);

  const handleAddCustomer = async () => {
    try {
      const customerToAdd = {
        ...newCustomer,
        cust_id: Math.floor(100000 + Math.random() * 900000), // ensure uniqueness
      };
      await axiosInstance.post("/customers/", customerToAdd);
      setNewCustomer({
        cust_id: Math.floor(100000 + Math.random() * 900000),
        name: "",
        phone: "",
        address: "",
      });
      setShowAddModal(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Make sure the phone number is unique.");
    }
  };

  const handleEditCustomer = async () => {
    if (!editCustomer) return;
    try {
      await axiosInstance.put(`/customers/${editCustomer.cust_id}/`, editCustomer);
      setEditCustomer(null);
      setShowEditModal(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer.");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axiosInstance.delete(`/customers/${id}/`);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Failed to delete customer.");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <div className="spinner-inner"></div>
        </div>
        <p className="loading-text">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <div className="header-section">
        <h2 className="title">Customer Management</h2>
        <button 
          className="add-button"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-people-fill empty-icon"></i>
          <p>No customers found in database</p>
          <button 
            className="add-button-empty"
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Customer
          </button>
        </div>
      ) : (
        <div className={`table-container ${animateTable ? 'table-animate' : ''}`}>
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, index) => (
                <tr key={c.cust_id} style={{animationDelay: `${index * 0.05}s`}} className="table-row">
                  <td>{c.cust_id}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td className="action-cell">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditCustomer(c);
                        setShowEditModal(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCustomer(c.cust_id)}
                    >
                      <i className="bi bi-trash"></i>
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      <div className={`modal-backdrop ${showAddModal ? 'show' : ''}`} onClick={() => setShowAddModal(false)}></div>
      <div className={`modal-container ${showAddModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Customer</h5>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => setShowAddModal(false)} 
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body">
            {["name", "phone", "address"].map((field) => (
              <div className="form-group" key={field}>
                <label htmlFor={`add-${field}`} className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={`add-${field}`}
                  className="form-control"
                  value={newCustomer[field as keyof typeof newCustomer]}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={`Enter customer ${field}`}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn-submit" onClick={handleAddCustomer}>
              <i className="bi bi-plus-circle me-2"></i>Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editCustomer && (
        <>
          <div className={`modal-backdrop ${showEditModal ? 'show' : ''}`} onClick={() => setShowEditModal(false)}></div>
          <div className={`modal-container ${showEditModal ? 'show' : ''}`}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Customer</h5>
                <button 
                  type="button" 
                  className="modal-close" 
                  onClick={() => setShowEditModal(false)} 
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="modal-body">
                {["name", "phone", "address"].map((field) => (
                  <div className="form-group" key={field}>
                    <label htmlFor={`edit-${field}`} className="form-label">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      id={`edit-${field}`}
                      className="form-control"
                      value={(editCustomer as any)[field]}
                      onChange={(e) =>
                        setEditCustomer((prev) =>
                          prev ? { ...prev, [field]: e.target.value } : null
                        )
                      }
                      placeholder={`Enter customer ${field}`}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn-submit" onClick={handleEditCustomer}>
                  <i className="bi bi-check-circle me-2"></i>Update Customer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Bootstrap Icons CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
      />
      
      {/* Add stylesheets */}
      <style>
        {`
        :root {
          --primary-color: #4361ee;
          --primary-light: #4361ee15;
          --primary-hover: #3a56d4;
          --success-color: #2ecc71;
          --warning-color: #f39c12;
          --danger-color: #e74c3c;
          --light-gray: #f8f9fa;
          --dark-gray: #343a40;
          --text-color: #495057;
          --border-color: #e9ecef;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
          --transition-fast: 0.2s ease;
          --transition-normal: 0.3s ease;
          --border-radius-sm: 6px;
          --border-radius-md: 10px;
          --border-radius-lg: 16px;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .customer-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: white;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }

        .customer-container:hover {
          box-shadow: var(--shadow-md);
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .title {
          font-size: 1.75rem;
          color: var(--dark-gray);
          margin: 0;
          font-weight: 600;
          position: relative;
          display: inline-block;
        }

        .title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          height: 3px;
          width: 40px;
          background-color: var(--primary-color);
          border-radius: 3px;
        }

        .add-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .add-button:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .add-button:active {
          transform: translateY(0);
        }

        .add-button-empty {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
          transition: all var(--transition-fast);
        }

        .add-button-empty:hover {
          background-color: var(--primary-hover);
          transform: scale(1.05);
        }

        .table-container {
          border-radius: var(--border-radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          opacity: 0;
          transform: translateY(20px);
        }

        .table-animate {
          opacity: 1;
          transform: translateY(0);
          transition: opacity var(--transition-normal), transform var(--transition-normal);
        }

        .customer-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          overflow: hidden;
        }

        .customer-table thead tr {
          background-color: var(--primary-color);
          color: white;
        }

        .customer-table th {
          text-align: left;
          padding: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customer-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-color);
          vertical-align: middle;
        }

        .table-row {
          background-color: white;
          transition: background-color var(--transition-fast);
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
        }

        .table-row:hover {
          background-color: var(--primary-light);
        }

        .table-row:last-child td {
          border-bottom: none;
        }

        .action-cell {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit, .btn-delete {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border: none;
          padding: 0.5rem 0.8rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-edit {
          background-color: var(--warning-color);
          color: white;
        }

        .btn-delete {
          background-color: var(--danger-color);
          color: white;
        }

        .btn-edit:hover, .btn-delete:hover {
          filter: brightness(110%);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-edit:active, .btn-delete:active {
          transform: translateY(0);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          background-color: var(--light-gray);
          border-radius: var(--border-radius-md);
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: var(--text-color);
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--transition-normal);
          z-index: 1000;
        }

        .modal-backdrop.show {
          opacity: 1;
          visibility: visible;
        }

        .modal-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          background-color: white;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg);
          width: 90%;
          max-width: 500px;
          opacity: 0;
          visibility: hidden;
          transition: all var(--transition-normal);
          z-index: 1001;
        }

        .modal-container.show {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, -50%) scale(1);
        }

        .modal-content {
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          font-size: 1.25rem;
          color: var(--dark-gray);
          margin: 0;
          font-weight: 600;
        }

        .modal-close {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: var(--text-color);
          transition: color var(--transition-fast);
        }

        .modal-close:hover {
          color: var(--danger-color);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-control {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          font-size: 1rem;
          color: var(--text-color);
        }

        .form-control:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-cancel {
          background-color: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 0.6rem 1.2rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-cancel:hover {
          background-color: var(--light-gray);
        }

        .btn-submit {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
        }

        .btn-submit:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--primary-color) 0%, rgba(255, 255, 255, 0.3) 60%);
          position: relative;
          animation: rotate 1.5s linear infinite;
        }

        .spinner-inner {
          position: absolute;
          top: 12.5%;
          left: 12.5%;
          width: 75%;
          height: 75%;
          background-color: white;
          border-radius: 50%;
        }

        .loading-text {
          margin-top: 1rem;
          color: var(--text-color);
          font-size: 1rem;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .header-section {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .title {
            margin-bottom: 1rem;
          }

          .action-cell {
            flex-direction: column;
            gap: 0.5rem;
          }

          .btn-edit, .btn-delete {
            width: 100%;
            justify-content: center;
          }

          .customer-table {
            font-size: 0.85rem;
          }

          .customer-table th, .customer-table td {
            padding: 0.75rem 0.5rem;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Customers;