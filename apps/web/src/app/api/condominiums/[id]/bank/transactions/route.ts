import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: condominiumId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/bank/transactions?condominiumId=${condominiumId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    const transactions = await response.json();
    
    // Transform to match frontend interface
    const transformed = transactions.map((tx: any) => ({
      id: tx.id,
      date: tx.transactionDate,
      label: tx.description || tx.counterpartyName || 'Transaction',
      amount: Math.abs(parseFloat(tx.amount || 0)),
      type: parseFloat(tx.amount || 0) >= 0 ? 'credit' : 'debit',
      status: tx.reconciliationStatus === 'matched' ? 'matched' : 'pending',
      matchedTo: tx.matchedPaymentId || null,
    }));
    
    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
