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
    Authorization: `Bearer ${accessToken}`,
  };
}

// GET /api/owners/search?q=... - Search orphan owners
export async function GET(request: NextRequest) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  // Validate minimum search length
  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `${API_URL}/owners/search?q=${encodeURIComponent(query)}`,
      { headers }
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
    console.error("Owners search error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}
