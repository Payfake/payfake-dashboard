"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStatsStore } from "@/stores/useStatsStore";
import { formatCurrency } from "@/lib/utils";
import { CardSkeleton } from "@/components/loader";
import {
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Webhook,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#6b7280"];

export default function OverviewPage() {
  const { stats, isLoading, fetchStats } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Volume",
      value: formatCurrency(stats.volume.total_amount),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Customers",
      value: stats.customers.total.toLocaleString(),
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Transactions",
      value: stats.transactions.total.toLocaleString(),
      icon: CreditCard,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Webhooks",
      value: stats.webhooks.total.toLocaleString(),
      icon: Webhook,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const statusCards = [
    {
      title: "Successful",
      value: stats.transactions.successful,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Failed",
      value: stats.transactions.failed,
      icon: XCircle,
      color: "text-red-500",
    },
    {
      title: "Pending",
      value: stats.transactions.pending,
      icon: Clock,
      color: "text-yellow-500",
    },
  ];

  const pieData = [
    { name: "Successful", value: stats.transactions.successful },
    { name: "Failed", value: stats.transactions.failed },
    { name: "Pending", value: stats.transactions.pending },
    { name: "Abandoned", value: stats.transactions.abandoned },
  ].filter((item) => item.value > 0);

  const chartData = stats.daily_activity.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-GH", { weekday: "short" }),
    volume: day.volume / 100,
    count: day.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Overview</h1>
        <p className="text-white/60">Your payment activity at a glance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-white/5 border border-white/10 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-white/60">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <h2 className="text-lg font-medium mb-4">Transaction Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `GHS ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  formatter={(value: number) => [
                    `GHS ${value.toFixed(2)}`,
                    "Volume",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#ffffff"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <h2 className="text-lg font-medium mb-4">Transaction Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-white/60">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {statusCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-white/60">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 bg-white/5 border border-white/10 rounded-xl"
      >
        <h2 className="text-lg font-medium mb-4">Success Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.transactions.success_rate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-green-500"
            />
          </div>
          <span className="text-sm font-medium">
            {stats.transactions.success_rate.toFixed(1)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}
