"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getFallbackRecommendations } from "@/lib/products";
import type { SkinAnalysis } from "@/lib/types";

const sampleAnalysis: SkinAnalysis = {
  skinType: "Balanced combination",
  fitzpatrickScale: "III",
  concerns: [
    { name: "mild dehydration", severity: 2, description: "Skin may benefit from more humectant support." },
    { name: "uneven texture", severity: 2, description: "A gentle exfoliation cadence may help smooth texture." },
    { name: "visible pores", severity: 2, description: "Oil-balancing ingredients can help refine the look of pores." },
  ],
  recommendedIngredients: ["niacinamide", "hyaluronic acid", "azelaic acid"],
  recommendations: getFallbackRecommendations(["dehydration", "texture", "pores"]),
};

function overallScore(analysis: SkinAnalysis) {
  const concerns = analysis.concerns ?? [];
  if (!concerns.length) return 92;
  const avgSeverity = concerns.reduce((sum, concern) => sum + concern.severity, 0) / concerns.length;
  return Math.max(35, Math.min(99, Math.round(104 - avgSeverity * 13)));
}

export default function ResultsPage() {
  const [analysis] = useState<SkinAnalysis>(() => {
    if (typeof window === "undefined") {
      return sampleAnalysis;
    }

    const stored = sessionStorage.getItem("skin-analysis");
    if (!stored) return sampleAnalysis;

    try {
      return JSON.parse(stored) as SkinAnalysis;
    } catch {
      sessionStorage.removeItem("skin-analysis");
      return sampleAnalysis;
    }
  });

  const recommendations = useMemo(() => {
    if (!analysis) return [];
    const products = analysis.recommendations?.length
      ? analysis.recommendations
      : getFallbackRecommendations(analysis.concerns);
    return products.slice(0, 6);
  }, [analysis]);
  const score = overallScore(analysis);

  return (
    <main className="min-h-screen px-5 py-5 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <Link
            href="/scan"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-black"
          >
            <Camera size={16} />
            New scan
          </Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25 lg:sticky lg:top-5 lg:self-start">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-emerald-300 text-black">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/75">Analysis</p>
                <h1 className="text-2xl font-semibold text-white">Your skin read</h1>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/50">Skin type</p>
                <p className="mt-2 text-3xl font-semibold text-white">{analysis.skinType}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/50">Fitzpatrick scale</p>
                <p className="mt-2 text-2xl font-semibold text-white">{analysis.fitzpatrickScale ?? "Not detected"}</p>
              </div>
              <div className="rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-4">
                <p className="text-sm text-emerald-50/65">Overall score</p>
                <p className="mt-2 text-4xl font-semibold text-emerald-100">{score}</p>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Concerns</h2>
              <div className="mt-3 grid gap-3">
                {analysis.concerns.map((concern) => (
                  <div
                    key={concern.name}
                    className="rounded-lg border border-emerald-200/15 bg-emerald-200/10 p-3 text-sm text-emerald-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{concern.name}</span>
                      <span className="text-xs text-emerald-50/60">{concern.severity}/5</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
                      <div
                        className="h-full rounded-full bg-emerald-300"
                        style={{ width: `${Math.max(8, concern.severity * 20)}%` }}
                      />
                    </div>
                    {concern.description && (
                      <p className="mt-2 text-xs leading-5 text-emerald-50/65">{concern.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {analysis.recommendedIngredients?.length ? (
              <div className="mt-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Recommended ingredients</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.recommendedIngredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-6 rounded-lg border border-amber-200/15 bg-amber-200/10 p-3 text-sm leading-6 text-amber-50/80">
              This analysis is cosmetic guidance, not a diagnosis. See a dermatologist for persistent irritation, pain, changing moles, or medical concerns.
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/75">Routine match</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Recommended products</h2>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/55">
                6 picks
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((product, index) => (
                <ProductCard key={`${product.name}-${index}`} product={product} index={index} />
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
              >
                <ShoppingBag size={18} />
                Shop These Products
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
