import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Identifiants incorrects" },
        { status: response.status }
      );
    }

    // Create response with token in httpOnly cookie for security
    const nextResponse = NextResponse.json({
      accessToken: data.accessToken,
      user: data.user,
    });

    // Set httpOnly cookie for the token (more secure than localStorage)
    nextResponse.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
