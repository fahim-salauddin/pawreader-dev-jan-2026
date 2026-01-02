import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { licenseKey } = await req.json();
    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: "License key required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.gumroad.com/v2/licenses/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          product_id: "lwcY-f_UeZhQkmkZwg3Aww==", // Update to your exact Gumroad product ID
          license_key: licenseKey,
        }),
      }
    );

    const data = await response.json();
    console.log("GUMROAD RESPONSE:", data);

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.message || "Invalid license" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: data.purchase,
    });
  } catch (err) {
    console.error("VERIFY LICENSE ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
