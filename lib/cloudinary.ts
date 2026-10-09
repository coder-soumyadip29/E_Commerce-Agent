import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Initialize Cloudinary config with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  publicId?: string;
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  source: "cloudinary" | "local_fallback";
  error?: string;
}

/**
 * Checks if Cloudinary credentials are fully configured in the environment
 */
export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads an image (Buffer, base64 data URI, remote URL, or local path) to Cloudinary.
 * Automatically falls back to local storage if Cloudinary credentials are not configured.
 */
export async function uploadImage(
  fileInput: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const folder = options.folder || "cartwise/products";

  // Check if Cloudinary is configured
  if (isCloudinaryConfigured()) {
    try {
      let uploadPayload: string;

      if (Buffer.isBuffer(fileInput)) {
        // Convert Buffer to data URI
        const base64 = fileInput.toString("base64");
        uploadPayload = `data:image/jpeg;base64,${base64}`;
      } else {
        uploadPayload = fileInput;
      }

      const uploadOptions: Record<string, any> = {
        folder,
        resource_type: "image",
        tags: options.tags || ["cartwise", "ecommerce"],
      };

      if (options.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      if (options.width || options.height) {
        uploadOptions.transformation = [
          {
            width: options.width,
            height: options.height,
            crop: options.crop || "limit",
            quality: options.quality || "auto",
            fetch_format: options.format || "auto",
          },
        ];
      }

      const res = await cloudinary.uploader.upload(uploadPayload, uploadOptions);

      return {
        success: true,
        url: res.secure_url || res.url,
        publicId: res.public_id,
        width: res.width,
        height: res.height,
        format: res.format,
        bytes: res.bytes,
        source: "cloudinary",
      };
    } catch (err: any) {
      console.warn("Cloudinary upload failed, using local fallback:", err?.message || err);
    }
  }

  // Graceful Local Fallback: saves file to public/uploads
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueId = options.publicId || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${uniqueId}.jpg`;
    const targetPath = path.join(uploadsDir, filename);

    if (Buffer.isBuffer(fileInput)) {
      fs.writeFileSync(targetPath, fileInput);
    } else if (typeof fileInput === "string" && fileInput.startsWith("data:")) {
      const base64Data = fileInput.split(",")[1];
      if (base64Data) {
        fs.writeFileSync(targetPath, Buffer.from(base64Data, "base64"));
      } else {
        fs.writeFileSync(targetPath, Buffer.from(fileInput));
      }
    } else if (typeof fileInput === "string" && (fileInput.startsWith("http://") || fileInput.startsWith("https://"))) {
      // Remote image url passed, return it directly
      return {
        success: true,
        url: fileInput,
        publicId: uniqueId,
        source: "local_fallback",
      };
    } else {
      fs.writeFileSync(targetPath, Buffer.from(fileInput));
    }

    const localUrl = `/uploads/${filename}`;
    return {
      success: true,
      url: localUrl,
      publicId: uniqueId,
      source: "local_fallback",
    };
  } catch (err: any) {
    return {
      success: false,
      url: "",
      publicId: "",
      source: "local_fallback",
      error: err?.message || "Failed to save file in local fallback",
    };
  }
}

/**
 * Deletes an image from Cloudinary or local storage by publicId
 */
export async function deleteImage(
  publicId: string,
  options: { resourceType?: "image" | "raw" | "video" } = {}
): Promise<{ success: boolean; result?: string; error?: string }> {
  if (isCloudinaryConfigured()) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: options.resourceType || "image",
      });
      return {
        success: res.result === "ok" || res.result === "not found",
        result: res.result,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Cloudinary delete error" };
    }
  }

  // Local fallback deletion
  try {
    const filename = `${publicId}.jpg`;
    const targetPath = path.join(process.cwd(), "public", "uploads", filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return { success: true, result: "deleted_locally" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Local delete error" };
  }
}

/**
 * Generates an automatic optimized and transformed Cloudinary image URL
 * Applies WebP/AVIF auto-format (f_auto) and intelligent compression (q_auto)
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "fit" | "thumb" | "scale";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "png" | "jpg";
  } = {}
): string {
  if (!publicIdOrUrl) return "";

  // If already a Cloudinary URL, inject transformations
  if (publicIdOrUrl.includes("res.cloudinary.com") && publicIdOrUrl.includes("/image/upload/")) {
    const parts = publicIdOrUrl.split("/image/upload/");
    const transformations: string[] = ["f_auto", "q_auto"];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);

    return `${parts[0]}/image/upload/${transformations.join(",")}/${parts[1]}`;
  }

  // If it's a raw public ID and Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && !publicIdOrUrl.startsWith("/") && !publicIdOrUrl.startsWith("http")) {
    const transformations: string[] = ["f_auto", "q_auto"];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(",")}/${publicIdOrUrl}`;
  }

  // Otherwise return url as-is
  return publicIdOrUrl;
}
