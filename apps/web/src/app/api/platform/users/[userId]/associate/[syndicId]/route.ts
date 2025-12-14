import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/api-url";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  
  if (!accessToken) {
    return null;
  }
  
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };
}

interface RouteParams {
  params: Promise<{ userId: string; syndicId: string }>;
}

// POST /api/platform/users/[userId]/associate/[syndicId] - Associate user to syndic
export async function POST(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { userId, syndicId } = await params;

  try {
    const response = await fetch(
      `${API_URL}/platform/users/${userId}/associate/${syndicId}`,
      {
        method: "POST",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur serveur" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Associate user error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}
