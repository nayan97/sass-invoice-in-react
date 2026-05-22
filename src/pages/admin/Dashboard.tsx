import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  ShoppingBag
} from "lucide-react";

const Dashboard: React.FC = () => {
  const stats = [
    { title: "Total Users", value: "2,543", change: "+12.5%", trendingUp: true, icon: Users, color: "blue" },
    { title: "Revenue", value: "$45,231", change: "+8.2%", trendingUp: true, icon: DollarSign, color: "emerald" },
    { title: "Products", value: "128", change: "-2.4%", trendingUp: false, icon: Package, color: "purple" },
    { title: "Active Orders", value: "43", change: "+5.7%", trendingUp: true, icon: ShoppingBag, color: "orange" },
  ];

  const recentOrders = [
    { id: "#7812", user: "John Doe", product: "RTX 4090", price: "$1,599", status: "Delivered", date: "2 mins ago" },
    { id: "#7811", user: "Sarah Smith", product: "Ryzen 9 7950X", price: "$549", status: "Processing", date: "15 mins ago" },
    { id: "#7810", user: "Alex Reed", product: "Samsung 990 Pro", price: "$179", status: "Shipped", date: "1 hour ago" },
    { id: "#7809", user: "Emma Wilson", product: "Intel i9-14900K", price: "$589", status: "Delivered", date: "3 hours ago" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const colorClasses = {
            blue: "bg-primary/10 border-primary/20 text-primary",
            emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
            purple: "bg-purple-50 border-purple-100 text-purple-600",
            orange: "bg-orange-50 border-orange-100 text-orange-600",
          }[stat.color as keyof typeof colorClasses];

          return (
            <motion.div 
              key={idx}
              variants={item}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl border group-hover:rotate-6 transition-transform", colorClasses.split(' ').slice(0, 2).join(' '))}>
                  <stat.icon className={cn("w-6 h-6", colorClasses.split(' ').pop())} />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", stat.trendingUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                  {stat.trendingUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.title}</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            <button className="text-sm text-primary hover:opacity-80 font-bold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-4 font-black">Order ID</th>
                  <th className="pb-4 font-black">Customer</th>
                  <th className="pb-4 font-black">Product</th>
                  <th className="pb-4 font-black text-right">Amount</th>
                  <th className="pb-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm font-bold text-primary">{order.id}</td>
                    <td className="py-4 text-sm font-bold text-slate-900">{order.user}</td>
                    <td className="py-4 text-sm text-slate-500 font-medium">{order.product}</td>
                    <td className="py-4 text-sm font-black text-slate-900 text-right">{order.price}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'Processing' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 font-mono">Activity Feed</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-900 font-bold leading-none mb-1">New system update installed</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Successfully deployed version 2.4.1 to production server.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                    <p className="text-[10px] text-primary uppercase font-black tracking-tighter">14 Oct 2026</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
            LOAD MORE ACTIVITY
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
