import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Button, Table, Form, Modal, Spinner, Alert, Pagination } from "react-bootstrap";
import { UserContext } from "../UserContext";
import { canView } from "../utils/roleUtils";
import { useNavigate } from "react-router-dom";

interface Sale {
  id: number;
  car: number;
  car_model: string;
  customer: number;
  customer_name: string;
  quantity: number;
  total_price: string;
  sale_date: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const Sales = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    car: "",
    customer: "",
    quantity: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Pagination states
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Change this to fetch more than 5 records

  const token = localStorage.getItem("access_token");

  // Check user permissions on mount
  useEffect(() => {
    if (!user || !token) return;

    const normalizedRole = user.role?.toLowerCase?.() || "";

    console.log("Current user:", user);
    console.log("Normalized role:", normalizedRole);

    if (normalizedRole === "customer" || !canView(normalizedRole, "manage_sales")) {
      console.warn("Unauthorized access attempt by:", normalizedRole);
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Separate effect for fetching sales data
  useEffect(() => {
    if (!token || !user) return;
    
    const normalizedRole = user.role?.toLowerCase?.() || "";
    if (normalizedRole === "customer" || !canView(normalizedRole, "manage_sales")) return;
    
    fetchSales();
  }, [refreshKey, currentPage, pageSize, token, user]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Add page and page_size parameters to the request
      const timestamp = new Date().getTime();
      const res = await axios.get(`http://127.0.0.1:8000/api/sales/?page=${currentPage}&page_size=${pageSize}&_=${timestamp}`, {
        headers: { Authorization: `Token ${token}` },
      });

      console.log("API Response:", res);

      // Extract pagination info
      const pagination = {
        count: res.data.count || 0,
        next: res.data.next,
        previous: res.data.previous,
      };
      
      setPaginationInfo(pagination);

      // Extract results
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];

      console.log("Parsed sales data:", data);
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSales = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      // Use a very large page_size to effectively disable pagination
      const res = await axios.get(`http://127.0.0.1:8000/api/sales/?page_size=1000&_=${timestamp}`, {
        headers: { Authorization: `Token ${token}` },
      });

      console.log("API Response (All Sales):", res);

      // Extract results
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];

      console.log("All sales data:", data);
      setSales(data);
      
      // Set current page to 1 since we're showing all
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching all sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!token) return;
    setLoading(true);

    const url = editingSale
      ? `http://127.0.0.1:8000/api/sales/${editingSale.id}/`
      : "http://127.0.0.1:8000/api/sales/";

    const method = editingSale ? "put" : "post";

    try {
      const result = await axios[method](
        url,
        {
          car: Number(formData.car),
          customer: Number(formData.customer),
          quantity: Number(formData.quantity),
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      console.log("Sale saved successfully:", result.data);
      
      setShowModal(false);
      setEditingSale(null);
      setFormData({ car: "", customer: "", quantity: 1 });
      
      // Explicitly fetch new data after a slight delay to ensure backend processing
      setTimeout(() => {
        // Go to first page to see the newly added sale
        setCurrentPage(1);
        setRefreshKey(oldKey => oldKey + 1);
      }, 300);
    } catch (error) {
      console.error("Error saving sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      car: sale.car.toString(),
      customer: sale.customer.toString(),
      quantity: sale.quantity,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setLoading(true);

    try {
      await axios.delete(`http://127.0.0.1:8000/api/sales/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      
      console.log("Sale deleted successfully");
      
      // Explicitly fetch new data after a slight delay to ensure backend processing
      setTimeout(() => {
        setRefreshKey(oldKey => oldKey + 1);
      }, 300);
    } catch (error) {
      console.error("Error deleting sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSale(null);
    setFormData({ car: "", customer: "", quantity: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Calculate pagination items
  const getPaginationItems = () => {
    if (!paginationInfo.count) return [];
    
    const totalPages = Math.ceil(paginationInfo.count / pageSize);
    let items = [];
    
    // Always include first page
    items.push(
      <Pagination.Item 
        key={1} 
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Start ellipsis
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" />);
    }
    
    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're added separately
      items.push(
        <Pagination.Item 
          key={i} 
          active={currentPage === i}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // End ellipsis
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" />);
    }
    
    // Always include last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item 
          key={totalPages} 
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" className="pulse-spinner" />
      </div>
    );
  }

  const normalizedRole = user.role?.toLowerCase?.() || "";

  return (
    <div className="sales-container">
      {/* Embedded CSS for animations and styling */}
      <style>{`
        /* General Styling */
        .sales-container {
          background: linear-gradient(120deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding: 2rem 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .sales-header {
          position: relative;
          margin-bottom: 2.5rem;
          padding-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideInDown 0.7s ease-out forwards;
        }
        
        .sales-header h2 {
          position: relative;
          color: #2c3e50;
          font-weight: 600;
          display: inline-block;
        }
        
        .sales-header h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #4a6bff, #2ecc71);
          animation: expandWidth 1s ease-out forwards;
        }
        
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 60px; }
        }
        
        /* Button Styling */
        .add-sale-btn {
          background: linear-gradient(90deg, #4a6bff, #5e7dfb);
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(74, 107, 255, 0.3);
          padding: 0.6rem 1.2rem;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .add-sale-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: all 0.4s ease;
        }
        
        .add-sale-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(74, 107, 255, 0.4);
        }
        
        .add-sale-btn:hover::before {
          left: 100%;
        }
        
        /* Table Styling */
        .sales-table {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          animation: fadeIn 0.8s ease-out forwards;
          background-color: white;
        }
        
        .sales-table thead {
          background: linear-gradient(90deg, #2c3e50, #34495e);
          color: white;
        }
        
        .sales-table th {
          font-weight: 500;
          letter-spacing: 0.5px;
          padding: 1rem !important;
          border: none !important;
        }
        
        .sales-table td {
          padding: 0.9rem 1rem !important;
          vertical-align: middle;
          border-color: #ecf0f1;
          transition: background-color 0.2s ease;
        }
        
        .sales-table tbody tr {
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out forwards;
          animation-delay: calc(0.1s * var(--index));
          opacity: 0;
        }
        
        .sales-table tbody tr:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        /* Button Actions */
        .action-btn {
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.4rem 0.75rem;
          border: none;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .edit-btn {
          background: linear-gradient(90deg, #f39c12, #f1c40f);
          color: #fff;
        }
        
        .edit-btn:hover {
          background: linear-gradient(90deg, #e67e22, #f39c12);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
        }
        
        .delete-btn {
          background: linear-gradient(90deg, #e74c3c, #c0392b);
          color: #fff;
        }
        
        .delete-btn:hover {
          background: linear-gradient(90deg, #c0392b, #e74c3c);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
        }
        
        /* Modal Styling */
        .custom-modal .modal-content {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          border: none;
        }
        
        .custom-modal .modal-header {
          background: linear-gradient(90deg, #2c3e50, #34495e);
          color: white;
          border-bottom: none;
          padding: 1.2rem;
        }
        
        .custom-modal .modal-title {
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .custom-modal .close {
          color: white;
          opacity: 0.8;
          transition: all 0.2s ease;
        }
        
        .custom-modal .close:hover {
          opacity: 1;
          transform: rotate(90deg);
        }
        
        .custom-modal .modal-body {
          padding: 1.5rem;
        }
        
        .form-control {
          border-radius: 8px;
          padding: 0.6rem 1rem;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #4a6bff;
          box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.15);
        }
        
        .form-label {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }
        
        /* Animation Keyframes */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .pulse-spinner {
          animation: pulse 1.5s infinite;
        }
        
        /* Alert Styling */
        .custom-alert {
          border-radius: 8px;
          padding: 1rem 1.5rem;
          border: none;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          animation: slideInDown 0.5s ease-out forwards;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          animation: fadeIn 0.8s ease-out forwards;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }
        
        .empty-state-icon {
          font-size: 3rem;
          color: #bdc3c7;
          margin-bottom: 1rem;
        }
        
        .price-col {
          font-weight: 600;
          color: #2ecc71;
        }
        
        .date-col {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        /* Loading State */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
        
        .refresh-btn {
          margin-left: 15px;
          background: linear-gradient(90deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          font-weight: 500;
          transition: all 0.3s;
          box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
        }
        
        .refresh-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
        }
        
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .pagination {
          margin-bottom: 0;
        }
        
        .page-info {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .page-size-selector select {
          border-radius: 8px;
          padding: 0.4rem;
          border: 1px solid #e0e0e0;
        }
        
        .view-all-btn {
          background: linear-gradient(90deg, #9b59b6, #8e44ad);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.3s;
          box-shadow: 0 4px 10px rgba(155, 89, 182, 0.3);
          margin-left: 15px;
        }
        
        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(155, 89, 182, 0.4);
        }
      `}</style>

      <div className="container">
        <div className="sales-header">
          <h2>Sales Management</h2>
          <div>
            {canView(normalizedRole, "manage_sales") && (
              <Button className="add-sale-btn" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus-circle me-2"></i> Add New Sale
              </Button>
            )}
            <Button 
              className="refresh-btn" 
              onClick={() => setRefreshKey(old => old + 1)}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i> Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" className="pulse-spinner" />
          </div>
        ) : sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h4>No Sales Records Found</h4>
            <p className="text-muted">Start adding sales to see them appear here.</p>
          </div>
        ) : (
          <>
            <Table bordered hover className="sales-table">
              <thead>
                <tr>
                  <th>Car Model</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Sale Date</th>
                  {canView(normalizedRole, "manage_sales") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={`${sale.id}-${refreshKey}`} style={{ "--index": index } as React.CSSProperties}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="ms-2">{sale.car_model}</span>
                      </div>
                    </td>
                    <td>{sale.customer_name}</td>
                    <td className="text-center">{sale.quantity}</td>
                    <td className="price-col">${sale.total_price}</td>
                    <td className="date-col">{new Date(sale.sale_date).toLocaleString()}</td>
                    {canView(normalizedRole, "manage_sales") && (
                      <td className="text-center">
                        <Button
                          variant="warning"
                          size="sm"
                          className="action-btn edit-btn me-2"
                          onClick={() => handleEdit(sale)}
                        >
                          <i className="fas fa-edit me-1"></i> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(sale.id)}
                        >
                          <i className="fas fa-trash-alt me-1"></i> Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <div className="pagination-container">
              <div className="page-info">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, paginationInfo.count)} of {paginationInfo.count} sales
              </div>
              
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {getPaginationItems()}
                
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.next}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(Math.ceil(paginationInfo.count / pageSize))}
                  disabled={!paginationInfo.next}
                />
              </Pagination>
              
              <div className="page-size-selector">
                <span>Show</span>
                <Form.Select 
                  size="sm" 
                  value={pageSize} 
                  onChange={handlePageSizeChange}
                  style={{ width: '80px' }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Form.Select>
                <span>per page</span>
                
                <Button className="view-all-btn" onClick={fetchAllSales}>
                  View All
                </Button>
              </div>
            </div>
          </>
        )}

        <Modal 
          show={showModal} 
          onHide={handleModalClose}
          className="custom-modal"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{editingSale ? "Edit Sale" : "Add New Sale"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Car ID</Form.Label>
                <Form.Control
                  type="number"
                  name="car"
                  value={formData.car}
                  onChange={handleChange}
                  placeholder="Enter car ID"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Customer ID</Form.Label>
                <Form.Control
                  type="number"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  placeholder="Enter customer ID"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>

              <div className="d-grid mt-4">
                <Button className="add-sale-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {editingSale ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingSale ? "Update Sale" : "Create Sale"}</>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Sales;