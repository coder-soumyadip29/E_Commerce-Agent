import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { handleImage } from "../lib/agent";

describe("Offline & Low-Bandwidth Test Images (tests/images)", () => {
  const imagesDir = path.join(process.cwd(), "tests", "images");

  it("should have tests/images directory populated with local test images", () => {
    expect(fs.existsSync(imagesDir)).toBe(true);
    const files = fs.readdirSync(imagesDir);
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it("should verify honey.png exists and contains valid PNG header bytes", () => {
    const honeyPath = path.join(imagesDir, "honey.png");
    expect(fs.existsSync(honeyPath)).toBe(true);
    const buffer = fs.readFileSync(honeyPath);
    expect(buffer.length).toBeGreaterThan(1000);
    // PNG Magic Header: 0x89 0x50 0x4E 0x47 (89 50 4E 47 in hex)
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  it("should verify oats.png exists and contains valid image data", () => {
    const oatsPath = path.join(imagesDir, "oats.png");
    expect(fs.existsSync(oatsPath)).toBe(true);
    const buffer = fs.readFileSync(oatsPath);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("should verify avocado_oil.png exists and is accessible locally without internet", () => {
    const oilPath = path.join(imagesDir, "avocado_oil.png");
    expect(fs.existsSync(oilPath)).toBe(true);
    const stats = fs.statSync(oilPath);
    expect(stats.size).toBeGreaterThan(5000);
  });

  it("should verify low-bandwidth fallback SVG images exist for offline mode", () => {
    const requiredSvgs = [
      "placeholder_low_bandwidth.svg",
      "mobiles_fallback.svg",
      "electronics_fallback.svg",
      "appliances_fallback.svg",
      "fashion_fallback.svg",
      "beauty_fallback.svg",
      "food_health_fallback.svg",
      "home_fallback.svg",
      "toys_baby_fallback.svg",
      "auto_fallback.svg",
      "sports_fallback.svg",
    ];

    for (const svgFile of requiredSvgs) {
      const fullPath = path.join(imagesDir, svgFile);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content).toContain("<svg");
      expect(content).toContain("</svg>");
    }
  });

  it("should successfully process local honey.png via handleImage() without internet", async () => {
    const res = await handleImage(path.join(imagesDir, "honey.png"));
    expect(res.type).toBe("image_analysis");
    if (res.type === "image_analysis") {
      expect(res.tags).toBeInstanceOf(Array);
      expect(res.tags.length).toBeGreaterThan(0);
      expect(res.tags).toContain("Organic Raw Honey");
      expect(res.description).toContain("Honey");
      expect(res.matchedProducts).toBeDefined();
      expect(res.matchedProducts!.length).toBeGreaterThan(0);
    }
  });

  it("should successfully process local oats.png via handleImage() offline", async () => {
    const res = await handleImage(path.join(imagesDir, "oats.png"));
    expect(res.type).toBe("image_analysis");
    if (res.type === "image_analysis") {
      expect(res.tags).toContain("Whole Grain Oats");
      expect(res.description).toContain("Oats");
      expect(res.matchedProducts).toBeDefined();
      expect(res.matchedProducts!.length).toBeGreaterThan(0);
    }
  });

  it("should successfully process image Buffer via handleImage() without crashing", async () => {
    const buffer = fs.readFileSync(path.join(imagesDir, "honey.png"));
    const res = await handleImage(buffer);
    expect(res.type).toBe("image_analysis");
    if (res.type === "image_analysis") {
      expect(res.tags).toBeInstanceOf(Array);
      expect(res.matchedProducts).toBeDefined();
    }
  });

  it("should gracefully handle unrecognized test images with valid store fallback", async () => {
    const res = await handleImage("tests/images/unknown_random_item.png");
    expect(res.type).toBe("image_analysis");
    if (res.type === "image_analysis") {
      expect(res.tags.length).toBeGreaterThan(0);
      expect(res.description).toBeDefined();
    }
  });
});
