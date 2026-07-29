// app/(buyer)/orders/page.tsx
"use client";

import { Package, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";

type OrderStatus = "processing" | "confirmed" | "delivered" | "cancelled";

interface MockOrder {
  id: string;
  product: string;
  farmer: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  status: OrderStatus;
  date: string;
  image: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-001",
    product: "Fresh Tomatoes",
    farmer: "Kwame Asante Farms",
    qty: 10,
    unit: "kg",
    price: 5.5,
    total: 55,
    status: "delivered",
    date: "2026-07-22",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
  },
  {
    id: "ORD-002",
    product: "Organic Plantains",
    farmer: "Ama Serwaa Harvest Co.",
    qty: 5,
    unit: "bunch",
    price: 8.0,
    total: 40,
    status: "confirmed",
    date: "2026-07-27",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80&h=80&fit=crop",
  },
  {
    id: "ORD-003",
    product: "Garden Eggs",
    farmer: "Mensah Family Farm",
    qty: 3,
    unit: "kg",
    price: 4.0,
    total: 12,
    status: "processing",
    date: "2026-07-28",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=80&h=80&fit=crop",
  },
  {
    id: "ORD-004",
    product: "Sweet Peppers",
    farmer: "Volta Valley Agro",
    qty: 2,
    unit: "kg",
    price: 6.5,
    total: 13,
    status: "cancelled",
    date: "2026-07-15",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=80&h=80&fit=crop",
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  processing: {
    label: "Processing",
    color: "text-amber-600",
    bg: "bg-amber-50",
    Icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    Icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
    Icon: XCircle,
  },
};

export default function BuyerOrdersPage() {
  const totalSpent = MOCK_ORDERS.filter((o) => o.status !== "cancelled").reduce(
    (s, o) => s + o.total,
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your purchase history.
          </p>
        </div>
        <div className="text-right bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-3">
          <p className="text-xs text-gray-400 font-medium">Total Spent</p>
          <p className="text-xl font-bold text-emerald-700">
            GH₵ {totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = MOCK_ORDERS.filter((o) => o.status === status).length;
          const Icon = cfg.Icon;
          return (
            <div
              key={status}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100/80 flex items-center gap-2">
          <Package className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-gray-800">Order History</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {MOCK_ORDERS.map((order) => {
                const { label, color, bg, Icon } = STATUS_CONFIG[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 font-semibold">
                      {order.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.image}
                          alt={order.product}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{order.product}</p>
                          <p className="text-xs text-gray-400">{order.farmer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {order.qty} {order.unit}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      GH₵ {order.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(order.date).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100/80">
          {MOCK_ORDERS.map((order) => {
            const { label, color, bg, Icon } = STATUS_CONFIG[order.status];
            return (
              <div key={order.id} className="px-4 py-4 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.image}
                  alt={order.product}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {order.product}
                      </p>
                      <p className="text-xs text-gray-400">{order.farmer}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                      GH₵ {order.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">{order.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
