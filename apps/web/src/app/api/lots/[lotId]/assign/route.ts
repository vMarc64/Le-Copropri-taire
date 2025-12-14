import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

interface RouteParams {
  params: Promise<{ lotId: string }>;
}

// PATCH /api/lots/[lotId]/assign - Assign a lot to an owner
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { lotId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/condominiums/lots/${lotId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || "Erreur lors de l'assignation du lot" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error assigning lot:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
