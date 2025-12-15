import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-url";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const body = await request.json();

  const response = await fetch(`${API_URL}/utilities/bills`, {
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
