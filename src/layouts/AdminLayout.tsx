import { Outlet, Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      <div className="ml-72 flex flex-col min-h-screen">
  
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
