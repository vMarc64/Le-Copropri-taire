import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface RouteParams {
  params: Promise<{ id: string; ownerId: string }>;
}

// POST /api/condominiums/[id]/owners/[ownerId]/lots - Update owner's lots in a condominium
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { id: condoId, ownerId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/condominiums/${condoId}/owners/${ownerId}/lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
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
    console.error("Error updating owner lots:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
