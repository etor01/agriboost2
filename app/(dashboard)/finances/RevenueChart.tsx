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
import {
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
} from "@/components/farmer/ui";
import { TrendingUp } from "lucide-react";

export default function RevenueChart({ transactions }: { transactions: any[] }) {
  const data = useMemo(() => {
    const earnings = transactions.filter(
      (tx) => tx.transaction_type === "escrow_release" && tx.status === "completed"
    );

    const grouped: Record<string, number> = {};

    earnings.forEach((tx) => {
      const dateKey = format(parseISO(tx.created_at), "MMM dd");
      const amount = Number(tx.sales_amount > 0 ? tx.sales_amount : tx.amount);
      if (!grouped[dateKey]) grouped[dateKey] = 0;
      grouped[dateKey] += amount;
    });

    const chartData = Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .reverse();

    if (chartData.length === 0) {
      return [{ date: format(new Date(), "MMM dd"), amount: 0 }];
    }

    return chartData;
  }, [transactions]);

  return (
    <FarmerCard className="p-0 overflow-hidden">
      <FarmerCardHeader
        title="Revenue & Earnings Velocity"
        description="Completed produce sales and released escrow payouts over time"
        action={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> Growth Trend
          </div>
        }
      />
      <FarmerCardContent className="p-5 pt-2">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(value) => `GH₵${value}`}
                dx={-4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderRadius: "6px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                itemStyle={{ color: "#34d399", fontWeight: 600 }}
                formatter={(value: number) => [`GH₵ ${value.toFixed(2)}`, "Earnings"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
                activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FarmerCardContent>
    </FarmerCard>
  );
}

