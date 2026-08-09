import React from "react";
import { Check } from "lucide-react";

type StepperStatus = "processing" | "confirmed" | "delivered" | "cancelled" | string;

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

  const steps = ["Confirmed", "Packed", "Shipped", "Delivered"];

  // Map database status to active step index
  // processing -> Confirmed (0)
  // confirmed -> Shipped (2) (Assuming packed happens quickly)
  // delivered -> Delivered (3)
  let activeIndex = 0;
  if (status === "processing") activeIndex = 0;
  else if (status === "confirmed") activeIndex = 2; // Let's highlight 'Shipped' when confirmed by farmer
  else if (status === "delivered") activeIndex = 3;

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
            <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 bg-transparent">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-300 text-gray-300"
                } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[9px] sm:text-xs font-bold absolute -bottom-5 whitespace-nowrap ${
                  isCurrent ? "text-emerald-700" : isCompleted ? "text-gray-800" : "text-gray-400"
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
