import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ShoppingCart,
  LogOut,
  Receipt,
  ChevronDown,
  Building2,
  CreditCard,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { logout } from "../../store/authSlice";


const Sidebar: React.FC = () => {
  const { roles } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = roles.includes("super-admin");
  const isAdmin = roles.includes("admin");
  const companyId = useSelector((state: RootState) => state.auth.company_id);
  // console.log("Company ID from URL:", companyId);

  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ Separate state for each dropdown
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm">
      {/* Logo */}
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

        {/* Dashboard */}
        <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" location={location.pathname} exact />

        {/* Subscriptions — super-admin only */}
        {isSuperAdmin && (
          <DropdownMenu
            label="Subscriptions"
            icon={CreditCard}
            isOpen={isSubscriptionsOpen}
            onToggle={() => setIsSubscriptionsOpen((prev) => !prev)}
            location={location.pathname}
            items={[
              { name: "Subscription Plan", href: "/dashboard/subscriptions/plan" },
              { name: "Coupons", href: "/dashboard/subscriptions/coupons" },
              { name: "Subscriptions", href: "/dashboard/subscriptions/list" },
              { name: "Transactions", href: "/dashboard/subscriptions/transactions" },
              { name: "Invoices", href: "/dashboard/subscriptions/invoices" },
              { name: "Usage", href: "/dashboard/subscriptions/usage" },
            ]}
          />
        )}

        {/* Company — super-admin + admin */}
        {(isSuperAdmin || isAdmin) && (
          <DropdownMenu
            label="Company"
            icon={Building2}
            isOpen={isCompanyOpen}
            onToggle={() => setIsCompanyOpen((prev) => !prev)}
            location={location.pathname}
            items={[
              { name: "Company", href: "/dashboard/company/list" },

              ...(isAdmin
                ? [
                  {
                    name: "Company Address",
                    href: `/dashboard/company/${companyId}/address`,
                  },
                  {
                    name: "Company Users",
                    href: `/dashboard/company/${companyId}/users`,
                  },
                ]
                : []),
            ]}
          />
        )}

        {/* Products */}
        <NavLink href="/dashboard/products" icon={Package} label="Products" location={location.pathname} />

        {/* Orders */}
        <NavLink href="/dashboard/orders" icon={ShoppingCart} label="Orders" location={location.pathname} />

        {/* Users */}
        <NavLink href="/dashboard/users" icon={Users} label="Users" location={location.pathname} />

        {/* Settings */}
        <NavLink href="/dashboard/settings" icon={Settings} label="Settings" location={location.pathname} />
      </nav>

      {/* Logout */}
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

// ─── Reusable NavLink ───────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  location: string;
  exact?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, location, exact }) => {
  const isActive = exact ? location === href : location === href;
  return (
    <Link
      to={href}
      className={cn(
        "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
    </Link>
  );
};

// ─── Reusable DropdownMenu ──────────────────────────────────────────────────

interface DropdownItem {
  name: string;
  href: string;
}

interface DropdownMenuProps {
  label: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  location: string;
  items: DropdownItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  label,
  icon: Icon,
  isOpen,
  onToggle,
  location,
  items,
}) => {
  const isAnyActive = items.some((item) => location === item.href);

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          "group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 border border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
          isAnyActive && "bg-slate-50/50 font-semibold text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5 transition-colors text-slate-400 group-hover:text-primary", isAnyActive && "text-primary")} />
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200 text-slate-400 group-hover:text-slate-600",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="pl-11 pr-2 space-y-1">
          {items.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span>{item.name}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;