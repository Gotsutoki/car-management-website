import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/Login";
import Register from "./Components/Register";
import Home from "./Components/Home";
import Sales from "./Components/Sales";
import Customers from "./Components/Customers";
import Statistics from "./Components/Statistics";
import AveragePrice from "./Components/AveragePrice";
import ExpensiveCars from "./Components/ExpensiveCars";
import LowStock from "./Components/LowStock";

import { UserContext } from "./UserContext";

// ✅ Wrapper for private routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useContext(UserContext);

  // If the user is not logged in, redirect to the login page
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ✅ Role-based route wrapper
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: JSX.Element, 
  allowedRoles: string[] 
}) => {
  const { user } = useContext(UserContext);

  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />; // Redirect to home instead of unauthorized
  }

  return children;
};

function App() {
  const { user } = useContext(UserContext);

  // null means either not logged in or still fetching
  if (user === null) {
    const token = localStorage.getItem("access_token");
    if (token) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    } else {
      return (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ All roles: Home */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* ✅ Expensive Cars: Accessible to everyone */}
      <Route
        path="/expensive-cars"
        element={
          <PrivateRoute>
            <ExpensiveCars />
          </PrivateRoute>
        }
      />

      {/* ✅ Alternative route for Expensive Cars */}
      <Route
        path="/expensive"
        element={
          <PrivateRoute>
            <ExpensiveCars />
          </PrivateRoute>
        }
      />

      {/* ✅ Admin & Staff: Sales page */}
      <Route
        path="/sales"
        element={
          <RoleRoute allowedRoles={["admin", "staff"]}>
            <Sales />
          </RoleRoute>
        }
      />

      {/* ✅ Admin only: Customers page */}
      <Route
        path="/customers"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <Customers />
          </RoleRoute>
        }
      />

      {/* ✅ Admin & Staff: Stats pages */}
      <Route
        path="/statistics"
        element={
          <RoleRoute allowedRoles={["admin", "staff"]}>
            <Statistics />
          </RoleRoute>
        }
      />

      <Route
        path="/cars/average-price"
        element={
          <RoleRoute allowedRoles={["admin", "staff"]}>
            <AveragePrice />
          </RoleRoute>
        }
      />

      {/* ✅ Low Stock routes - support both paths */}
      <Route
        path="/cars/low-stock"
        element={
          <RoleRoute allowedRoles={["admin", "staff"]}>
            <LowStock />
          </RoleRoute>
        }
      />

      <Route
        path="/low-stock"
        element={
          <RoleRoute allowedRoles={["admin", "staff"]}>
            <LowStock />
          </RoleRoute>
        }
      />

      {/* ✅ Catch-all for 404 errors */}
      <Route 
        path="*" 
        element={
          <div className="container mt-5 text-center">
            <div className="alert alert-warning">
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for doesn't exist or has been moved.</p>
              <button 
                className="btn btn-primary mt-3" 
                onClick={() => window.location.href = '/home'}
              >
                Return to Home
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;