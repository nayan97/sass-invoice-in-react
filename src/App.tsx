import { createBrowserRouter, RouterProvider } from "react-router";

import "./App.css";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import SubscriptionPlan from "./pages/admin/subcriptions/SubscriptionPlan";
import CouponsPage from "./pages/admin/subcriptions/CouponsPage";
import SubscriptionsPage from "./pages/admin/subcriptions/SubscriptionsPage";
import TransactionsPage from "./pages/admin/subcriptions/TransactionsPage";
import InvoicesPage from "./pages/admin/subcriptions/InvoicesPage";
import PricingPage from "./pages/user/PricingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CompaniesPage from "./pages/admin/company/CompaniesPage";

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6 text-2xl font-semibold">{title}</div>
);

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <PricingPage /> },
  { path: "/unauthorized", element: <Placeholder title="403 — Unauthorized" /> },

  // ✅ super-admin + admin shared routes
  {
    element: <ProtectedRoute allowedRoles={["super-admin", "admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },

          // Company — shared (super-admin + admin)
          {
            path: "company",
            children: [
              { path: "list", element: <CompaniesPage /> },
            ],
          },

          { path: "products", element: <Placeholder title="Products" /> },
          { path: "orders", element: <Placeholder title="Orders" /> },
          { path: "users", element: <Placeholder title="Users" /> },
          { path: "settings", element: <Placeholder title="Settings" /> },
        ],
      },
    ],
  },

  // ✅ super-admin ONLY routes
  {
    element: <ProtectedRoute allowedRoles={["super-admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          // Subscriptions — super-admin only
          {
            path: "subscriptions",
            children: [
              { path: "plan", element: <SubscriptionPlan /> },
              { path: "coupons", element: <CouponsPage /> },
              { path: "list", element: <SubscriptionsPage /> },
              { path: "transactions", element: <TransactionsPage /> },
              { path: "invoices", element: <InvoicesPage /> },
              { path: "usage", element: <Placeholder title="Usage Analytics" /> },
            ],
          },
        ],
      },
    ],
  },

  // ✅ admin ONLY routes
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          // Company address & users — admin only
          {
            path: "company",
            children: [
              { path: "address", element: <Placeholder title="Company Address" /> },
              { path: "users", element: <Placeholder title="Company Users" /> },
            ],
          },
        ],
      },
    ],
  },

  // ✅ User-only routes
  {
    element: <ProtectedRoute allowedRoles={["user"]} />,
    children: [
      { path: "/account", element: <Placeholder title="My Account" /> },
    ],
  },

  // ✅ Any authenticated user
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/profile", element: <Placeholder title="Profile" /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;