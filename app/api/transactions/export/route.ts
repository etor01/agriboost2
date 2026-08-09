import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "all";
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !transactions) {
    return new NextResponse("Failed to fetch transactions", { status: 500 });
  }

  const filteredTx = transactions.filter((tx: any) => {
    let matchTab = true;
    if (tab === "topup") matchTab = tx.transaction_type === "wallet_topup";
    else if (tab === "escrow") matchTab = tx.transaction_type === "escrow_hold" || tx.transaction_type === "escrow_release";
    else if (tab === "withdrawal") matchTab = tx.transaction_type === "farmer_withdrawal";

    let matchDate = true;
    const txDate = new Date(tx.created_at).getTime();
    if (start) {
      matchDate = matchDate && txDate >= new Date(start).getTime();
    }
    if (end) {
      matchDate = matchDate && txDate <= new Date(end).getTime() + 86400000; // Add 1 day to cover the end date
    }

    return matchTab && matchDate;
  });

  // Generate CSV
  let csv = "Date,Description,Type,Amount (GHS),Status\n";

  for (const tx of filteredTx) {
    const date = new Date(tx.created_at).toLocaleDateString("en-GH");
    // Escape quotes and wrap in quotes to handle commas in descriptions
    const desc = `"${(tx.service_name || "—").replace(/"/g, '""')}"`;
    const type = tx.transaction_type || "—";
    
    // Amount formatting
    let amountStr = "0.00";
    if (tx.transaction_type === "escrow_release" && tx.status === "completed") {
      amountStr = `+${Number(tx.sales_amount ?? 0).toFixed(2)}`;
    } else if (tx.transaction_type === "wallet_topup") {
      amountStr = `+${Number(tx.amount ?? 0).toFixed(2)}`;
    } else if (tx.transaction_type === "escrow_hold") {
      amountStr = `-${Number(tx.amount ?? 0).toFixed(2)}`;
    } else if (tx.transaction_type === "farmer_withdrawal") {
      amountStr = `-${Number(tx.amount ?? 0).toFixed(2)}`;
    } else {
      amountStr = Number(tx.amount ?? 0).toFixed(2);
    }
    
    const status = tx.status || "—";

    csv += `${date},${desc},${type},${amountStr},${status}\n`;
  }

  const filename = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
