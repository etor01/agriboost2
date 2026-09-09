import React from "react";
import { Check } from "lucide-react";

type StepperStatus =
  | "processing"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | string;

export function OrderStepper({ status }: { status: StepperStatus }) {
  if (status === "cancelled") {
    return (
      <div className="w-full flex items-center justify-center py-2">
        <span className="text-sm font-bold text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-200">
          Order Cancelled
        </span>
      </div>
    );
  }

  const steps = ["Received", "Confirmed", "Packed", "Shipped", "Delivered"];

  // Map database status to active step index
  const statusToIndex: Record<string, number> = {
    processing: 0,
    confirmed: 1,
    packed: 2,
    shipped: 3,
    delivered: 4,
  };

  const activeIndex = statusToIndex[status] ?? 0;

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />

        {/* Active Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-1.5 bg-transparent"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-300 text-gray-300"
                } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span className="text-[9px] font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[8px] sm:text-[10px] font-bold absolute -bottom-5 whitespace-nowrap ${
                  isCurrent
                    ? "text-emerald-700"
                    : isCompleted
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
