import { createBrowserRouter, RouterProvider } from "react-router";

import Login from "./pages/Login";

import "./App.css";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layouts/AdminLayout";

const router = createBrowserRouter([

  {
    path: "/login",
    element: <Login />,
  },
    {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // {
      //   path: "products",
      //   element: <Products />,
      // },

    ],
  },

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
