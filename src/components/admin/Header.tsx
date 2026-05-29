import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-slate-500 hover:text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-sm w-full hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search analytics, orders..."
            className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Admin User</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center border border-white/20 shadow-md">
            <User className="text-white w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
