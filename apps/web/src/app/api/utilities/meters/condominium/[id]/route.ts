import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-url";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const url = type 
    ? `${API_URL}/utilities/meters/condominium/${id}?type=${type}`
    : `${API_URL}/utilities/meters/condominium/${id}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
