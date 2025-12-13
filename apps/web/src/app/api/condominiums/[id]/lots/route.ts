import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/condominiums/[id]/lots - Get all lots of a condominium
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${API_URL}/condominiums/${id}/lots`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || "Erreur lors du chargement des lots" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching lots:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/condominiums/[id]/lots - Create a new lot in a condominium
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/condominiums/${id}/lots`, {
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
        { message: error.message || "Erreur lors de la création du lot" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating lot:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
