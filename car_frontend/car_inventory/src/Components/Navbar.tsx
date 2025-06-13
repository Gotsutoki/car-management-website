import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const Navbar: React.FC = () => {
  const { user } = useContext(UserContext);
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow sticky-top px-4 py-3">
      <Link className="navbar-brand fw-bold fs-4" to="/home">
        🚗 Car Inventory
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {/* Home link visible to all */}
          <li className="nav-item">
            <Link className="nav-link" to="/home">
              Home
            </Link>
          </li>

          {/* Expensive Cars link visible to everyone */}
          <li className="nav-item">
            <Link className="nav-link" to="/expensive">
              Expensive Cars
            </Link>
          </li>

          {/* Admin/Staff: Sales */}
          {(isAdmin || isStaff) && (
            <li className="nav-item">
              <Link className="nav-link" to="/sales">
                Sales
              </Link>
            </li>
          )}

          {/* Admin/Staff: Statistics */}
          {(isAdmin || isStaff) && (
            <li className="nav-item">
              <Link className="nav-link" to="/statistics">
                Statistics
              </Link>
            </li>
          )}
          
          {/* Admin/Staff: Low Stock */}
          {(isAdmin || isStaff) && (
            <li className="nav-item">
              <Link className="nav-link" to="/low-stock">
                Low Stock
              </Link>
            </li>
          )}

          {/* Admin only: Customers */}
          {isAdmin && (
            <li className="nav-item">
              <Link className="nav-link" to="/customers">
                Customers
              </Link>
            </li>
          )}
        </ul>

        <span className="navbar-text text-light fw-light">
          Logged in as <strong>{user?.username}</strong> <em>({user?.role})</em>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;