import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api-url";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur lors de l'inscription" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Inscription réussie",
      user: data.user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
