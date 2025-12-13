import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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

// GET /api/owners/[id] - Get a single owner
export async function GET(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const response = await fetch(`${API_URL}/owners/${id}`, { headers });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Propriétaire non trouvé" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Owner GET error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}

// PATCH /api/owners/[id] - Update an owner
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/owners/${id}`, {
      method: "PATCH",
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
    console.error("Owner PATCH error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/owners/[id] - Delete an owner
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const headers = await getAuthHeaders();
  
  if (!headers) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const response = await fetch(`${API_URL}/owners/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { message: data.message || "Erreur lors de la suppression" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Propriétaire supprimé" });
  } catch (error) {
    console.error("Owner DELETE error:", error);
    return NextResponse.json(
      { message: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
}
