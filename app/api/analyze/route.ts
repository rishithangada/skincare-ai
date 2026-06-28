import { NextResponse } from "next/server";
import { getFallbackRecommendations } from "@/lib/products";
import type { Concern, SkinAnalysis } from "@/lib/types";
import { saveScanAnalysis } from "@/lib/supabase";

export const runtime = "nodejs";

type BioData = {
  skinTone: string;
  skinType: string;
  concerns: string[];
  ageRange: number;
};

const DERM_SYSTEM =
  "You are a licensed dermatologist reviewing a skin photo for cosmetic skincare guidance. " +
  "Be specific and clinically accurate. Never diagnose medical conditions or use disease terminology.";

const RESPONSE_SCHEMA = `Return strict JSON with this shape:
{
  "skinType": "oily | dry | combination | normal | sensitive — plus a short descriptor",
  "fitzpatrickScale": "I | II | III | IV | V | VI",
  "concerns": [
    { "name": "concern name", "severity": 1, "description": "one sentence about what is visible" }
  ],
  "recommendedIngredients": ["niacinamide", "retinol", "hyaluronic acid"],
  "avoidIngredients": ["alcohol", "fragrance"],
  "productCategories": ["cleanser", "serum", "moisturizer", "sunscreen"],
  "recommendations": [
    {
      "name": "plausible product name, not a medical drug",
      "category": "cleanser | serum | moisturizer | sunscreen | exfoliant | treatment",
      "why": "one short sentence tied to the concern",
      "keyIngredients": ["ingredient", "ingredient"],
      "routineStep": "when to use it"
    }
  ]
}
Return 3–5 concerns with severity 1 (mild) to 5 (severe). Return exactly 6 recommendations. Cosmetic guidance only.`;

const VISION_INSTRUCTIONS = `Analyze the visible facial skin. Identify: skin type, Fitzpatrick scale, visible concerns with severity, top ingredient recommendations, ingredients to avoid for this skin type, and appropriate product categories.\n\n${RESPONSE_SCHEMA}`;

function bioClinicalPrompt(bio: BioData): string {
  return `You are a skincare advisor. Based on this bio profile, provide personalized skincare recommendations.

Bio Profile:
- Skin Tone: ${bio.skinTone}
- Skin Type: ${bio.skinType}
- Primary Concerns: ${bio.concerns.length ? bio.concerns.join(", ") : "general skincare"}
- Age Range: ${bio.ageRange}

${RESPONSE_SCHEMA}`;
}

function parseDataUrl(image: unknown) {
  if (typeof image !== "string") {
    throw new Error("Image must be a base64 data URL.");
  }

  const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/);
  if (!match) {
    throw new Error("Image must be a JPEG, PNG, or WebP base64 data URL.");
  }

  return {
    mediaType: match[1] === "image/jpg" ? "image/jpeg" : match[1],
    data: match[2],
  };
}

function parseConcern(raw: unknown): Concern {
  if (typeof raw === "string") {
    return { name: raw, severity: 3, description: "" };
  }
  const c = raw as Record<string, unknown>;
  return {
    name: typeof c.name === "string" ? c.name : "concern",
    severity:
      typeof c.severity === "number" ? Math.min(5, Math.max(1, Math.round(c.severity))) : 3,
    description: typeof c.description === "string" ? c.description : "",
  };
}

function extractJson(text: string): SkinAnalysis {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced?.[1] ?? trimmed;
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON.");
  }

  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>;

  const rawConcerns = Array.isArray(parsed.concerns) ? parsed.concerns : [];
  const concerns: Concern[] = rawConcerns.map(parseConcern);

  const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

  return {
    skinType: typeof parsed.skinType === "string" ? parsed.skinType : "Unclear",
    fitzpatrickScale: typeof parsed.fitzpatrickScale === "string" ? parsed.fitzpatrickScale : undefined,
    concerns: concerns.length
      ? concerns
      : [
          { name: "skin balance", severity: 2, description: "" },
          { name: "hydration", severity: 2, description: "" },
          { name: "texture", severity: 2, description: "" },
        ],
    recommendedIngredients: Array.isArray(parsed.recommendedIngredients)
      ? (parsed.recommendedIngredients as string[])
      : undefined,
    avoidIngredients: Array.isArray(parsed.avoidIngredients)
      ? (parsed.avoidIngredients as string[])
      : undefined,
    productCategories: Array.isArray(parsed.productCategories)
      ? (parsed.productCategories as string[])
      : undefined,
    recommendations: recommendations.length >= 6
      ? recommendations.slice(0, 6)
      : getFallbackRecommendations(concerns),
  };
}

async function callGemini(
  apiKey: string,
  imageBase64: string,
  mediaType: string,
  textPrompt: string,
  system: string,
): Promise<SkinAnalysis> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: textPrompt },
        ]}],
        generationConfig: { maxOutputTokens: 2000 },
      }),
    },
  );
  const payload = await res.json() as { error?: { message?: string }; candidates?: { content: { parts: { text: string }[] } }[] };
  if (!res.ok) throw new Error(payload.error?.message ?? "Gemini analysis failed.");
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response did not include text.");
  return extractJson(text);
}

async function callGroq(prompt: string, system: string): Promise<SkinAnalysis> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("No GROQ_API_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  const payload = await res.json() as { error?: { message?: string }; choices?: { message: { content: string } }[] };
  if (!res.ok) throw new Error(payload.error?.message ?? "Groq analysis failed.");
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq response did not include text.");
  return extractJson(text);
}

async function callClaude(
  apiKey: string,
  content: unknown,
  system?: string,
): Promise<SkinAnalysis> {
  const body: Record<string, unknown> = {
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content }],
  };
  if (system) body.system = system;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json() as { error?: { message?: string }; content?: { type: string; text: string }[] };
  if (!response.ok) throw new Error(payload.error?.message ?? "Anthropic analysis failed.");
  const text = payload.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Anthropic response did not include text content.");
  return extractJson(text);
}

export async function POST(request: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const body = await request.json();
    const rawImage = body.imageData ?? body.image;
    const bioData = body.bioData as BioData | undefined;
    const sessionId = (body.sessionId as string | undefined) ?? "anonymous";

    if (rawImage) {
      if (!geminiKey && !anthropicKey) {
        return NextResponse.json({ error: "No vision API key configured. Add GEMINI_API_KEY to .env.local." }, { status: 500 });
      }
      const image = parseDataUrl(rawImage);
      const textPrompt = bioData
        ? `Bio context: skin tone ${bioData.skinTone}, type ${bioData.skinType}, age ${bioData.ageRange}.\n\n${VISION_INSTRUCTIONS}`
        : VISION_INSTRUCTIONS;

      // Prefer Gemini (free), fall back to Anthropic
      const result = geminiKey
        ? await callGemini(geminiKey, image.data, image.mediaType, textPrompt, DERM_SYSTEM)
        : await callClaude(anthropicKey!, [
            { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
            { type: "text", text: textPrompt },
          ], DERM_SYSTEM);

      saveScanAnalysis(result, sessionId).catch(() => {});
      return NextResponse.json(result);
    }

    if (bioData) {
      // Bio-only: Groq (free) → Anthropic fallback
      const result = await callGroq(bioClinicalPrompt(bioData), DERM_SYSTEM).catch(() =>
        anthropicKey ? callClaude(anthropicKey, bioClinicalPrompt(bioData)) : Promise.reject(new Error("No AI key available"))
      );
      saveScanAnalysis(result, sessionId).catch(() => {});
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Provide imageData or bioData." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze." },
      { status: 400 },
    );
  }
}
