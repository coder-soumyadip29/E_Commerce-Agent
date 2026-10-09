import { describe, it, expect } from "vitest";
import { handleMockChat } from "../lib/agent/mock";
import { generateRecipeBundleTool } from "../lib/agent/real";
import { getProductById } from "../lib/db";
import { ChatMessage, RecipeBundleMessagePayload } from "../lib/types";

describe("Recipe & Meal-to-Cart AI Bundler", () => {
  describe("Mock Shopping Agent (lib/agent/mock.ts)", () => {
    it("should generate a structured recipe bundle for high-protein oats breakfast", async () => {
      const messages: ChatMessage[] = [
        {
          id: "1",
          role: "user",
          content: "I want a high-protein recipe for superfood oats breakfast bowl with ingredients",
          timestamp: Date.now(),
        },
      ];

      const res = await handleMockChat(messages);

      expect(res.type).toBe("recipe_bundle");
      const bundle = res as RecipeBundleMessagePayload;

      expect(bundle.recipeName).toContain("Power Protein Superfood Oats");
      expect(bundle.servings).toBe(2);
      expect(bundle.prepTime).toBeDefined();
      expect(bundle.caloriesPerServing).toBeGreaterThan(0);
      expect(bundle.nutrition).toBeDefined();
      expect(bundle.nutrition?.protein).toBeDefined();
      expect(bundle.dietaryTags).toContain("100% Certified Organic");

      // Verify cooking instructions
      expect(bundle.instructions).toBeInstanceOf(Array);
      expect(bundle.instructions?.length).toBeGreaterThan(3);

      // Verify ingredient catalog grounding
      expect(bundle.ingredients).toBeInstanceOf(Array);
      expect(bundle.ingredients.length).toBeGreaterThanOrEqual(3);

      for (const item of bundle.ingredients) {
        expect(item.product).toBeDefined();
        expect(typeof item.product.id).toBe("number");
        expect(item.requiredQty).toBeGreaterThanOrEqual(1);
        expect(item.unit).toBeDefined();
        expect(item.purpose).toBeDefined();

        // Zero-hallucination check against SQLite
        const dbProduct = getProductById(item.product.id);
        expect(dbProduct).not.toBeNull();
        expect(dbProduct?.id).toBe(item.product.id);
        expect(dbProduct?.price).toBe(item.product.price);
      }

      // Verify bundle math
      const expectedSubtotal = bundle.ingredients.reduce(
        (sum, item) => sum + item.product.price * item.requiredQty,
        0
      );
      expect(bundle.originalBundlePrice).toBe(expectedSubtotal);
      expect(bundle.totalBundlePrice).toBeLessThan(expectedSubtotal);
      expect(bundle.bundleDiscountPercent).toBe(12);

      // Verify trace
      expect(bundle.trace).toBeDefined();
      expect(bundle.trace?.steps.length).toBeGreaterThan(0);
    });

    it("should generate a structured Mediterranean Quinoa salad recipe for lunch/salad queries", async () => {
      const messages: ChatMessage[] = [
        {
          id: "1",
          role: "user",
          content: "Plan an organic quinoa salad recipe for healthy lunch with ingredients",
          timestamp: Date.now(),
        },
      ];

      const res = await handleMockChat(messages);

      expect(res.type).toBe("recipe_bundle");
      const bundle = res as RecipeBundleMessagePayload;

      expect(bundle.recipeName).toContain("Mediterranean");
      expect(bundle.recipeName).toContain("Quinoa");
      expect(bundle.servings).toBe(2);
      expect(bundle.ingredients.some((i) => i.product.name.includes("Quinoa"))).toBe(true);
      expect(bundle.ingredients.some((i) => i.product.name.includes("Olive Oil"))).toBe(true);
    });
  });

  describe("Real Shopping Agent Tool (lib/agent/real.ts)", () => {
    it("should execute generate_recipe_bundle tool and return grounded ingredients", async () => {
      const toolRes = await generateRecipeBundleTool({
        dish_name: "Gourmet Avocado Honey Smoothie Bowl",
        dish_type: "Post-Workout Smoothie",
        servings: 2,
        ingredient_keywords: ["honey", "almonds", "chia"],
        prep_time: "8 mins",
        calories: 360,
      });

      expect(toolRes.toolName).toBe("generate_recipe_bundle");
      expect(toolRes.traceStep.status).toBe("complete");

      const bundle = toolRes.result as RecipeBundleMessagePayload;
      expect(bundle.type).toBe("recipe_bundle");
      expect(bundle.recipeName).toBe("Gourmet Avocado Honey Smoothie Bowl");
      expect(bundle.servings).toBe(2);
      expect(bundle.prepTime).toBe("8 mins");
      expect(bundle.caloriesPerServing).toBe(360);

      expect(bundle.ingredients.length).toBeGreaterThanOrEqual(2);
      for (const item of bundle.ingredients) {
        expect(typeof item.product.id).toBe("number");
        const dbProduct = getProductById(item.product.id);
        expect(dbProduct).not.toBeNull();
      }

      expect(bundle.totalBundlePrice).toBeGreaterThan(0);
      expect(bundle.bundleDiscountPercent).toBe(12);
    });
  });
});
