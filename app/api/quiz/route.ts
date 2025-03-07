import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch("https://api.jsonserve.com/Uw5CrX");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { error: "Failed to fetch quiz data" },
      { status: 500 }
    );
  }
}