// routes/CustomerProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const CustomerProtectedRoute: React.FC = () => {
  const token = useSelector((state: RootState) => state.customerAuth.token);
  return token ? <Outlet /> : <Navigate to="/customer/login" replace />;
};

export default CustomerProtectedRoute;