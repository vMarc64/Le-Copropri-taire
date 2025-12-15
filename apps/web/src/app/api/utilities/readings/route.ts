import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const body = await request.json();

  const response = await fetch(`${API_URL}/utilities/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
