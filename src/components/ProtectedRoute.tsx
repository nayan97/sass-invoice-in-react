// src/components/ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import type { RootState } from "../store";

interface Props {
  allowedRoles?: Array<"super-admin" |  "admin" | "staff" | "user">;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<Props> = ({
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Logged in but wrong role → go to unauthorized
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;