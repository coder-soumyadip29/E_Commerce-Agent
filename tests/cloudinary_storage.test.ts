import { describe, it, expect, afterAll } from "vitest";
import {
  uploadImage,
  deleteImage,
  getOptimizedImageUrl,
  isCloudinaryConfigured,
} from "../lib/cloudinary";
import { POST } from "../app/api/upload/route";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

describe("Cloudinary Storage & Media Pipeline", () => {
  const testSampleBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  let createdPublicId = "";

  afterAll(() => {
    // Clean up local fallback files if created
    if (createdPublicId) {
      deleteImage(createdPublicId);
    }
  });

  describe("Configuration & Environment Checks", () => {
    it("reports configuration status cleanly", () => {
      const configured = isCloudinaryConfigured();
      expect(typeof configured).toBe("boolean");
    });
  });

  describe("Upload Operations", () => {
    it("uploads a base64 image data URI successfully (Cloudinary or local fallback)", async () => {
      const res = await uploadImage(testSampleBase64, {
        folder: "cartwise/test",
        tags: ["vitest", "test_run"],
      });

      expect(res.success).toBe(true);
      expect(res.url).toBeDefined();
      expect(res.publicId).toBeDefined();
      expect(["cloudinary", "local_fallback"]).toContain(res.source);

      createdPublicId = res.publicId;
    });

    it("uploads raw binary Buffer successfully", async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG signature
      const res = await uploadImage(buffer, {
        folder: "cartwise/test",
      });

      expect(res.success).toBe(true);
      expect(res.url).toBeDefined();
      expect(res.publicId).toBeDefined();

      if (res.publicId) {
        await deleteImage(res.publicId);
      }
    });

    it("handles remote image URLs directly", async () => {
      const remoteUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
      const res = await uploadImage(remoteUrl);

      expect(res.success).toBe(true);
      expect(res.url).toBeDefined();
    });
  });

  describe("URL Optimization & Transformations", () => {
    it("injects f_auto,q_auto into Cloudinary URLs", () => {
      const sampleCloudinaryUrl =
        "https://res.cloudinary.com/demo/image/upload/sample.jpg";
      const optimized = getOptimizedImageUrl(sampleCloudinaryUrl, {
        width: 800,
        height: 600,
        crop: "fill",
      });

      expect(optimized).toContain("f_auto");
      expect(optimized).toContain("q_auto");
      expect(optimized).toContain("w_800");
      expect(optimized).toContain("h_600");
      expect(optimized).toContain("c_fill");
    });

    it("returns standard URLs unharmed when non-Cloudinary", () => {
      const standardUrl = "https://example.com/photo.png";
      const result = getOptimizedImageUrl(standardUrl);
      expect(result).toBe(standardUrl);
    });
  });

  describe("Delete Operations", () => {
    it("deletes image by publicId gracefully", async () => {
      const uploadRes = await uploadImage(testSampleBase64);
      expect(uploadRes.success).toBe(true);

      const delRes = await deleteImage(uploadRes.publicId);
      expect(delRes.success).toBe(true);
    });
  });

  describe("Upload API Route Handler (/api/upload)", () => {
    it("processes JSON base64 upload request via POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: testSampleBase64,
          folder: "cartwise/api_tests",
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.url).toBeDefined();
      expect(json.publicId).toBeDefined();
    });

    it("rejects request when image payload is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/required/i);
    });
  });
});
