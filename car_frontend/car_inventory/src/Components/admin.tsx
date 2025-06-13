import React, { useState, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Type for a Sale record
type Sale = {
  id: number;
  customer: string;
  car: string;
  price: string;
};

// Only allow editing of these fields
type EditableField = "customer" | "car" | "price";

const Admin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [sales, setSales] = useState<Sale[]>([
    { id: 1, customer: "John Doe", car: "Tesla Model S", price: "$80,000" },
    { id: 2, customer: "Jane Smith", car: "BMW X5", price: "$75,000" },
  ]);

  // Handle Sales Update
  const handleEditSale = (
    index: number,
    field: EditableField,
    value: string
  ): void => {
    const updatedSales = [...sales];
    updatedSales[index] = {
      ...updatedSales[index],
      [field]: value,
    };
    setSales(updatedSales);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Panel</h2>

      {/* 🔍 Customer Search Section */}
      <div className="card p-4 shadow-lg mb-4">
        <h4 className="mb-3">Search Customer</h4>
        <input
          type="text"
          className="form-control"
          placeholder="Enter customer name, email, or phone..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>

      {/* 💰 Sales Editing Section */}
      <div className="card p-4 shadow-lg">
        <h4 className="mb-3">Edit Sales Records</h4>
        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>Customer</th>
              <th>Car</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={sale.id}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={sale.customer}
                    onChange={(e) =>
                      handleEditSale(index, "customer", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={sale.car}
                    onChange={(e) =>
                      handleEditSale(index, "car", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={sale.price}
                    onChange={(e) =>
                      handleEditSale(index, "price", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
