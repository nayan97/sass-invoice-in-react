import { Outlet, Navigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

const AdminLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
   <Sidebar />
      <div className="ml-72 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
