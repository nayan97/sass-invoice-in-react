import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ShoppingCart,
  LogOut,
  Receipt,
  ChevronDown
} from "lucide-react";
import { cn } from "../../lib/utils";
import { logout } from "../../store/authSlice";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Subscriptions",
      icon: Package,
      isDropdown: true,
      subItems: [
        { name: "Subscription Plan", href: "/dashboard/subscriptions/plan" },
        { name: "Subscription Coupons", href: "/dashboard/subscriptions/coupons" },
        { name: "Subscriptions", href: "/dashboard/subscriptions/list" },
        { name: "Transactions", href: "/dashboard/subscriptions/transactions" },
        { name: "Invoices", href: "/dashboard/subscriptions/invoices" },
        { name: "Usage", href: "/dashboard/subscriptions/usage" },
      ]
    },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-8">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-[0_4px_12px_rgba(247,148,29,0.2)]">
            <Receipt className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">BusinessInvoice</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Main Menu</p>
        </div>
        {menuItems.map((item) => {
          if (item.isDropdown) {
            const isAnySubItemActive = item.subItems?.some(sub => location.pathname === sub.href);
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setIsSubscriptionsOpen(!isSubscriptionsOpen)}
                  className={cn(
                    "group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent",
                    isAnySubItemActive && "bg-slate-50/50 font-semibold text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5 transition-colors text-slate-400 group-hover:text-primary", isAnySubItemActive && "text-primary")} />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400 group-hover:text-slate-600", isSubscriptionsOpen && "rotate-180")} />
                </button>
                
                {isSubscriptionsOpen && (
                  <div className="pl-11 pr-2 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                            isSubActive
                              ? "bg-primary/5 text-primary"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <span>{subItem.name}</span>
                          {isSubActive && <div className="w-1 h-1 rounded-full bg-primary" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href!}
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                <span className="font-semibold text-sm">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => {
            dispatch(logout());
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;