"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

export default function RevenueChart({ transactions }: { transactions: any[] }) {
  const data = useMemo(() => {
    // We want to chart 'escrow_release' transactions where status is 'completed'
    // or just any farmer earnings.
    const earnings = transactions.filter(
      (tx) => tx.transaction_type === "escrow_release" && tx.status === "completed"
    );

    const grouped: Record<string, number> = {};

    // Group by Date (YYYY-MM-DD)
    earnings.forEach((tx) => {
      const dateKey = format(parseISO(tx.created_at), "MMM dd");
      const amount = Number(tx.sales_amount > 0 ? tx.sales_amount : tx.amount);
      if (!grouped[dateKey]) grouped[dateKey] = 0;
      grouped[dateKey] += amount;
    });

    // Convert to array and sort
    const chartData = Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      // if there's no data, give a dummy point so the chart still renders
      .reverse(); // If transactions are descending, we might need to sort by date properly.

    if (chartData.length === 0) {
      return [
        { date: format(new Date(), "MMM dd"), amount: 0 },
      ];
    }
    
    return chartData;
  }, [transactions]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Revenue Earnings</h3>
        <p className="text-sm text-gray-500">Your completed sales over time</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(value) => `GH₵${value}`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#111827", fontWeight: "bold" }}
              formatter={(value: number) => [`GH₵${value.toFixed(2)}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
