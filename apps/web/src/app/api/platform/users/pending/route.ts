import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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

// GET /api/platform/users/pending - List pending users
export async function GET(request: NextRequest) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const url = `${API_URL}/platform/users/pending${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur serveur" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Platform users GET error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}
