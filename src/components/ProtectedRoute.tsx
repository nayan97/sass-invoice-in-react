import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import type { RootState } from "../store";

interface Props {
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<Props> = ({
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, roles } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has at least one of the allowed roles
  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;