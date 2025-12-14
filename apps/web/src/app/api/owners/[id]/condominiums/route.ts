import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

// GET /api/owners/[id]/condominiums - Get owner's condominiums
export async function GET(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const response = await fetch(`${API_URL}/owners/${id}/condominiums`, {
      headers,
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur lors de la récupération" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Owner condominiums GET error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}

// POST /api/owners/[id]/condominiums - Update owner's condominiums
export async function POST(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/owners/${id}/condominiums`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur lors de la mise à jour" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Owner condominiums POST error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}
