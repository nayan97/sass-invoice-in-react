import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import {
  Users,
  FileText,
  CheckSquare,
  Play
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const Dashboard: React.FC = () => {
  // 1. Top Mini Metrics Map
  const stats = [
    {
      title: "Clients Added",
      value: "197",
      change: "1.15%",
      trendingUp: true,
      icon: Users,
      progress: 65
    },
    {
      title: "Contracts Signed",
      value: "634",
      change: "1.15%",
      trendingUp: false,
      icon: CheckSquare,
      progress: 75
    },
    {
      title: "Invoice Sent",
      value: "512",
      change: "3.14%",
      trendingUp: true,
      icon: FileText,
      progress: 45
    },
  ];

  // 2. Payment Activity Mock Data (Bar Chart)
  const activityData = [
    { name: "Jan", value: 38 },
    { name: "Feb", value: 48 },
    { name: "Mar", value: 41 },
    { name: "Apr", value: 52 },
    { name: "May", value: 22 },
    { name: "Jun", value: 43 },
    { name: "Jul", value: 36 },
    { name: "Aug", value: 48 },
    { name: "Sep", value: 24 },
    { name: "Oct", value: 28 },
    { name: "Nov", value: 36 },
    { name: "Dec", value: 44 },
  ];

  // 3. Structure Breakdown Mock Data (Donut Chart)
  const structureData = [
    { name: "Invoiced", value: 56236, percentage: "56.3%", color: "#2f8bcc", change: "+0.2%", trendUp: true },
    { name: "Collected", value: 12596, percentage: "25.4%", color: "#2287cf", change: "-0.7%", trendUp: false },
    { name: "Outstanding", value: 1568, percentage: "18.3%", color: "#D1E2DE", change: "+0.4%", trendUp: true },
  ];

  // Framer Motion layout orchestration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 } as const
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6 bg-[#F8F9FA] min-h-screen text-slate-800"
    >
      {/* HEADER BAR */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase font-mono">Dashboard</h1>
        <div className="text-xs text-slate-500 font-medium">
          Dashboard <span className="mx-1 text-slate-400">&gt;</span> <span className="text-slate-800 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* TOP ROW: AD BANNER & OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome Callout Banner */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-white border border-slate-100 rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[160px]"
        >
          <div className="max-w-[65%] z-10">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Professional Invoices Made Easy.</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Quickly understand who your best customers little and motivation to pay thair bills.
            </p>
          </div>
          <button className="mt-4 px-4 py-2 bg-[#2f8bcc] text-white font-medium text-xs rounded-lg w-max flex items-center gap-1.5 hover:bg-[#246355] transition-colors z-10">
            <Play className="w-3 h-3 fill-current" /> Watch Tutorial
          </button>

          {/* Decorative Vector Graphic placement wrapper */}
          <div className="absolute right-2 bottom-0 w-[140px] h-[140px] opacity-95 pointer-events-none">
            <img
              src="https://illustrations.popsy.co/flat/working-from-home.svg"
              alt="Illustration"
              className="object-contain w-full h-full object-bottom"
            />
          </div>
        </motion.div>

        {/* This Week's Overview Aggregators */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-900">This Week's Overview</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="font-medium text-slate-400">SORT BY:</span>
              <span className="font-semibold text-slate-700 cursor-pointer flex items-center gap-0.5">
                Current Week <span className="text-[10px]">▼</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between border-r last:border-0 border-slate-100 pr-2 last:pr-0">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.title}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      stat.trendingUp ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">since last week</span>
                  </div>
                </div>

                {/* Minimalist Radial Donut Loop */}
                <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="18" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="24" cy="24" r="18"
                      stroke={stat.trendingUp ? "#2f8bcc" : "#DE6B6B"}
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * stat.progress) / 100}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM ROW: CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Activity Column */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-8 bg-white border border-slate-100 rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Payment Activity</h3>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">$23,590.00</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#2f8bcc] text-sm">$584k</span>
                  <span className="text-slate-400 font-medium ml-1.5">Incomes</span>
                </div>
                <div className="border-l border-slate-200 h-4" />
                <div>
                  <span className="font-bold text-[#2287cf] text-sm">$324k</span>
                  <span className="text-slate-400 font-medium ml-1.5">Expenses</span>
                </div>
              </div>

              {/* Time Frame Filter Pill */}
              <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-100 text-[11px] font-bold">
                {["ALL", "1M", "6M", "1Y"].map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-colors",
                      tab === "1Y" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart Block */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  domain={[0, 60]}
                  ticks={[0, 10, 20, 30, 40, 50, 60]}
                />
                <Bar
                  dataKey="value"
                  fill="#2f8bcc"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Structure Allocation Column */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900">Structure</h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="font-medium text-slate-400">SORT BY:</span>
              <span className="font-semibold text-slate-700 cursor-pointer flex items-center gap-0.5">
                Weekly <span className="text-[10px]">▼</span>
              </span>
            </div>
          </div>

          {/* Donut Layout Area */}
          <div className="h-44 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={structureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {structureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Explicit Placement overlays to exactly mirror label positions inside the ring */}
            <div className="absolute text-[10px] font-bold text-white bg-[#2f8bcc]/90 px-1 rounded top-[45%] right-[18%]">56.3%</div>
            <div className="absolute text-[10px] font-bold text-white bg-[#2287cf]/90 px-1 rounded bottom-[40%] left-[20%]">25.4%</div>
            <div className="absolute text-[10px] font-bold text-slate-500 bg-slate-100/90 px-1 rounded top-[16%] left-[38%]">18.3%</div>
          </div>

          {/* Breakdown Ledger Cards */}
          <div className="space-y-2 pt-2">
            {structureData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b last:border-0 border-slate-50 pb-2 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-500 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">${item.value.toLocaleString()}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 w-14 justify-center",
                    item.trendUp ? "bg-emerald-50 text-[#2f8bcc]" : "bg-red-50 text-red-500"
                  )}>
                    {item.trendUp ? "+" : ""}{item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;