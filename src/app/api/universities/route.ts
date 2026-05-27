import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const response = await fetch(
      `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Hipolabs API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
