import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/condominiums/[id]/settings - Get condominium settings
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const response = await fetch(`${API_URL}/condominiums/${id}/settings`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Paramètres non trouvés" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// PUT /api/condominiums/[id]/settings - Update condominium settings
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/condominiums/${id}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Impossible de sauvegarder les paramètres" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
