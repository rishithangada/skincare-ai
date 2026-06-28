import { createClient } from "@supabase/supabase-js";
import type { Concern, Recommendation, SkinAnalysis } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type ScanHistoryRow = {
  id?: string;
  created_at?: string;
  skin_type?: string | null;
  concerns?: Concern[] | null;
  ingredients?: {
    recommended?: string[];
    avoid?: string[];
    categories?: string[];
    recommendations?: Recommendation[];
  } | null;
  score?: number | null;
  session_id?: string | null;
  severity?: string | null;
  overall_score?: number | null;
  recommendations?: Recommendation[] | null;
};

export type ScanRecord = {
  id?: string;
  session_id: string;
  created_at?: string;
  severity: string;
  overall_score: number;
  concerns: { name: string; severity: number | string; description: string }[];
  recommendations: object[];
  analysis_text?: string;
};

function getScore(concerns: Concern[]) {
  if (!concerns.length) return 94;
  const averageSeverity = concerns.reduce((sum, concern) => sum + concern.severity, 0) / concerns.length;
  return Math.min(99, Math.max(35, Math.round(104 - averageSeverity * 13)));
}

function getSeverity(concerns: Concern[]) {
  const max = concerns.reduce((highest, concern) => Math.max(highest, concern.severity), 0);
  if (max <= 1) return "clear";
  if (max <= 2) return "mild";
  if (max <= 4) return "moderate";
  return "severe";
}

export async function saveScanAnalysis(analysis: SkinAnalysis, sessionId: string) {
  const concerns = analysis.concerns ?? [];
  const score = getScore(concerns);
  const ingredients = {
    recommended: analysis.recommendedIngredients ?? [],
    avoid: analysis.avoidIngredients ?? [],
    categories: analysis.productCategories ?? [],
    recommendations: analysis.recommendations ?? [],
  };

  const requestedShape = {
    session_id: sessionId,
    skin_type: analysis.skinType,
    concerns,
    ingredients,
    score,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("scan_history").insert(requestedShape).select().single();
  if (!error) return data;

  const legacyShape = {
    session_id: sessionId,
    severity: getSeverity(concerns),
    overall_score: score,
    concerns,
    recommendations: analysis.recommendations ?? [],
  };
  const fallback = await supabase.from("scan_history").insert(legacyShape).select().single();
  if (fallback.error) console.error("saveScanAnalysis:", fallback.error.message);
  return fallback.data;
}

export async function getRecentScanHistory(sessionId: string): Promise<ScanHistoryRow[]> {
  const requested = await supabase
    .from("scan_history")
    .select("id, created_at, skin_type, concerns, ingredients, score")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!requested.error) return (requested.data ?? []) as ScanHistoryRow[];

  const legacy = await supabase
    .from("scan_history")
    .select("id, created_at, severity, overall_score, concerns, recommendations")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (legacy.error) {
    console.error("getRecentScanHistory:", legacy.error.message);
    return [];
  }
  return (legacy.data ?? []) as ScanHistoryRow[];
}

export async function saveScan(scan: Omit<ScanRecord, "id" | "created_at">) {
  const { data, error } = await supabase.from("scan_history").insert(scan).select().single();
  if (error) console.error("saveScan:", error.message);
  return data;
}

export async function getScans(sessionId: string): Promise<ScanRecord[]> {
  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("getScans:", error.message);
  return data ?? [];
}
