import { createBrowserRouter, RouterProvider } from "react-router";

import "./App.css";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Subscriptions from "./pages/admin/subcriptions/Subscriptions";
import SubscriptionPlan from "./pages/admin/subcriptions/SubscriptionPlan";
import CouponsPage from "./pages/admin/subcriptions/CouponsPage";

// Optional Placeholder Pages
// Replace these with your real components later
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6 text-2xl font-semibold">{title}</div>
);

const router = createBrowserRouter([
  // =========================
  // Auth Routes
  // =========================
  {
    path: "/login",
    element: <Login />,
  },

  // =========================
  // Dashboard Routes
  // =========================
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      // Dashboard Home
      {
        index: true,
        element: <Dashboard />,
      },

      // =========================
      // Subscription Module
      // =========================
      {
        path: "subscriptions",
        children: [
          {
            path: "plan",
            element: <SubscriptionPlan />,
          },
          {
            path: "coupons",
            element: <CouponsPage />,
          },
          {
            path: "list",
            element: <Subscriptions />,
          },
          {
            path: "transactions",
            element: <Placeholder title="Transactions" />,
          },
          {
            path: "invoices",
            element: <Placeholder title="Invoices" />,
          },
          {
            path: "usage",
            element: <Placeholder title="Usage Analytics" />,
          },
        ],
      },

      // =========================
      // Product Routes
      // =========================
      {
        path: "products",
        element: <Placeholder title="Products" />,
      },

      // =========================
      // Order Routes
      // =========================
      {
        path: "orders",
        element: <Placeholder title="Orders" />,
      },

      // =========================
      // User Routes
      // =========================
      {
        path: "users",
        element: <Placeholder title="Users" />,
      },

      // =========================
      // Settings Routes
      // =========================
      {
        path: "settings",
        element: <Placeholder title="Settings" />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;