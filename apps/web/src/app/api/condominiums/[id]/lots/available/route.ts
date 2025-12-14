import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/condominiums/[id]/lots/available - Get available lots for a condominium
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forOwner = searchParams.get("forOwner");

    const url = forOwner 
      ? `${API_URL}/condominiums/${id}/lots/available?forOwner=${forOwner}`
      : `${API_URL}/condominiums/${id}/lots/available`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || "Erreur" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching available lots:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
