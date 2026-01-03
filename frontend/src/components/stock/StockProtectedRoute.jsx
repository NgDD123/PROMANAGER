import React from "react";
import { Navigate } from "react-router-dom";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

export default function StockProtectedRoute({ children, roles = null, departments = null }) {
  const { user, loading, hasRole, inDepartment } = useStockAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/stock/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-bold text-red-600">
          Access Denied: You do not have the required role.
        </p>
      </div>
    );
  }

  if (departments && !inDepartment(departments)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-bold text-red-600">
          Access Denied: You do not belong to the required department.
        </p>
      </div>
    );
  }

  return children;
}
