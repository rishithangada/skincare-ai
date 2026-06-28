import type { Recommendation } from "@/lib/types";

const productLibrary: Recommendation[] = [
  {
    name: "Barrier Balance Gel Cleanser",
    category: "Cleanser",
    why: "Low-foam cleanse that removes sunscreen and oil without leaving skin tight.",
    keyIngredients: ["green tea", "glycerin", "amino acids"],
    routineStep: "Morning and night",
  },
  {
    name: "Calm Reset Azelaic Serum",
    category: "Treatment",
    why: "Targets visible redness, uneven tone, and breakout-prone texture.",
    keyIngredients: ["azelaic acid", "panthenol", "allantoin"],
    routineStep: "Night, after cleansing",
  },
  {
    name: "Hydra Veil Essence",
    category: "Hydration",
    why: "Light layers of humectants help soften dehydration lines and dullness.",
    keyIngredients: ["hyaluronic acid", "betaine", "rice ferment"],
    routineStep: "Morning or night",
  },
  {
    name: "Pore Refine BHA Liquid",
    category: "Exfoliant",
    why: "Helps clear congestion and smooth rough texture without a scrub.",
    keyIngredients: ["salicylic acid", "willow bark", "niacinamide"],
    routineStep: "2-3 nights weekly",
  },
  {
    name: "Ceramide Cloud Cream",
    category: "Moisturizer",
    why: "Cushions dry or sensitized areas while supporting the skin barrier.",
    keyIngredients: ["ceramides", "squalane", "cholesterol"],
    routineStep: "Last step at night",
  },
  {
    name: "Daily Mineral SPF 40",
    category: "Sunscreen",
    why: "Daily UV protection helps prevent dark spots, redness, and collagen loss.",
    keyIngredients: ["zinc oxide", "vitamin E", "licorice root"],
    routineStep: "Every morning",
  },
  {
    name: "Bright Start Vitamin C",
    category: "Antioxidant",
    why: "Supports a more even-looking tone and helps defend against environmental stress.",
    keyIngredients: ["vitamin C", "ferulic acid", "tocopherol"],
    routineStep: "Morning, before SPF",
  },
  {
    name: "Recovery Cica Balm",
    category: "Repair",
    why: "A targeted comfort layer for flaky, irritated, or compromised patches.",
    keyIngredients: ["centella", "madecassoside", "oat extract"],
    routineStep: "As needed",
  },
];

export function getFallbackRecommendations(concerns: Array<{ name: string } | string> = []): Recommendation[] {
  const names = concerns.map((c) => (typeof c === "string" ? c : c.name));
  const normalized = names.join(" ").toLowerCase();
  const priority = productLibrary.filter((product) => {
    const text = `${product.why} ${product.keyIngredients.join(" ")}`.toLowerCase();
    return normalized && normalized.split(/\W+/).some((word) => word.length > 3 && text.includes(word));
  });

  const combined = [...priority, ...productLibrary];
  const unique = new Map(combined.map((product) => [product.name, product]));
  return Array.from(unique.values()).slice(0, 6);
}
