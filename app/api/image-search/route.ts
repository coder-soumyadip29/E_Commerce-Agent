import { NextRequest, NextResponse } from "next/server";
import { handleImage } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const imagePayload = body.image || body.base64 || body.imageName || body.url || "honey.png";
      const result = await handleImage(imagePayload);
      return NextResponse.json({ success: true, message: result });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await handleImage(buffer);
        return NextResponse.json({ success: true, message: result });
      }
      const result = await handleImage("honey.png");
      return NextResponse.json({ success: true, message: result });
    }

    const defaultResult = await handleImage("honey.png");
    return NextResponse.json({ success: true, message: defaultResult });

  } catch (error) {
    console.error("Image search API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing image." },
      { status: 500 }
    );
  }
}
