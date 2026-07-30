import { createBrowserRouter, RouterProvider } from "react-router";

import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import SubscriptionPlansPage from "./pages/admin/subcriptions/SubscriptionPlansPage";
import CouponsPage from "./pages/admin/subcriptions/CouponsPage";
import SubscriptionsPage from "./pages/admin/subcriptions/SubscriptionsPage";
import TransactionsPage from "./pages/admin/subcriptions/TransactionsPage";
import InvoicesPage from "./pages/admin/subcriptions/InvoicesPage";
import PricingPage from "./pages/user/PricingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";

import CompanyUsersPage from "./pages/admin/company/CompanyUsersPage";
import CompaniesPage from "./pages/admin/company/CompaniesPage";
import CompanyAddressesPage from "./pages/admin/company/CompanyAddressesPage";
import CurrenciesPage from "./pages/admin/Currencies/CurrenciesPage";

// ── Invoice pages ──
import CompanyInvoicesPage from "./pages/admin/Invoices/CompanyInvoicesPage";
import AddInvoicePageWrapper from "./pages/admin/Invoices/AddInvoicePageWrapper";
import InvoiceDetailPageWrapper from "./pages/admin/Invoices/InvoiceDetailPageWrapper";
import PublicInvoicePage from "./pages/user/PublicInvoicePage";
import CustomersPage from "./pages/admin/customers/CustomersPage";
import CustomerGroupsPage from "./pages/admin/customers/CustomerGroupsPage";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerProfile from "./pages/user/CustomerProfile";

// // ── Product pages ──
// import ProductsPageWrapper from "./pages/admin/Products/ProductsPageWrapper";
// import AddProductPageWrapper from "./pages/admin/Products/AddProductPageWrapper";

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6 text-2xl font-semibold">{title}</div>
);

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/", element: <PricingPage /> },
  { path: "/customer/:company/login", element: <CustomerLogin /> },
  { path: "/pay/invoice/:token", element: <PublicInvoicePage /> },
  { path: "/unauthorized", element: <Placeholder title="403 — Unauthorized" /> },

  // ── super-admin + admin shared ──────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["super-admin", "admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },

          { path: "company/list", element: <CompaniesPage /> },

          { path: "orders", element: <Placeholder title="Orders" /> },
          { path: "users", element: <Placeholder title="Users" /> },
          { path: "settings", element: <Placeholder title="Settings" /> },
        ],
      },
    ],
  },

  // ── super-admin ONLY ────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["super-admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          {
            path: "subscriptions",
            children: [
              { path: "plan", element: <SubscriptionPlansPage /> },
              { path: "coupons", element: <CouponsPage /> },
              { path: "list", element: <SubscriptionsPage /> },
              { path: "transactions", element: <TransactionsPage /> },
              { path: "invoices", element: <InvoicesPage /> },
              { path: "usage", element: <Placeholder title="Usage Analytics" /> },
            ],
          },
          {
            path: "currencies",
            children: [
              { path: "add", element: <CurrenciesPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── admin ONLY ──────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/dashboard",
        element: <AdminLayout />,
        children: [
          {
            path: "company",
            children: [
              { path: ":companyId/address", element: <CompanyAddressesPage /> },
              { path: ":companyId/users", element: <CompanyUsersPage /> },

              {
                path: ":companyId/customer-groups",
                element: <CustomerGroupsPage />,
              },
              {
                path: ":companyId/customers",
                element: <CustomersPage />,
              },

              // ── Invoice routes ──
              { path: ":companyId/invoices", element: <CompanyInvoicesPage /> },
              { path: ":companyId/invoices/create", element: <AddInvoicePageWrapper /> },
              { path: ":companyId/invoices/:invoiceId", element: <InvoiceDetailPageWrapper /> },
            ],
          },

          // // ── Product routes ──
          // {
          //   path: "company/:companyId/branches/:branchId/products",
          //   children: [
          //     { index: true,         element: <ProductsPageWrapper /> },
          //     { path: "create",      element: <AddProductPageWrapper /> },
          //     { path: ":productId/edit", element: <AddProductPageWrapper /> },
          //   ],
          // },
        ],
      },
    ],
  },

  // ── user only ───────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["user"]} />,
    children: [
      { path: "/account", element: <Placeholder title="My Account" /> },
    ],
  },

  // ── any authenticated ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/profile", element: <Placeholder title="Profile" /> },
    ],
  },
  {
    path: "/customer/:company",
    element: <CustomerProtectedRoute />,
    children: [
      { path: "profile", element: <CustomerProfile /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;