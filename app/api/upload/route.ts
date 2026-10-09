import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "cartwise/uploads";
      const tagsString = (formData.get("tags") as string) || "";
      const tags = tagsString ? tagsString.split(",").map((t) => t.trim()) : undefined;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadImage(buffer, {
        folder,
        tags,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Upload failed." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        source: result.source,
      });
    }

    // 2. JSON Payload (Base64 data URI or remote image URL)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const imagePayload = body.image || body.base64 || body.url;
      const folder = body.folder || "cartwise/uploads";
      const tags = body.tags;

      if (!imagePayload) {
        return NextResponse.json(
          { error: "Image data (base64 string or url) is required." },
          { status: 400 }
        );
      }

      const result = await uploadImage(imagePayload, {
        folder,
        tags,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Upload failed." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        source: result.source,
      });
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Please use multipart/form-data or application/json." },
      { status: 415 }
    );
  } catch (error: any) {
    console.error("Upload API route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
