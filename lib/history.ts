import type { Concern, SkinAnalysis } from "@/lib/types";

export const SCAN_HISTORY_KEY = "skincare_scans";

export type SeverityLabel = "clear" | "mild" | "moderate" | "severe";

export type ScanHistoryItem = {
  id: string;
  date: string;
  skinType: string;
  skinScore: number;
  severity: SeverityLabel;
  concerns: Concern[];
  photo?: string;
  fitzpatrickScale?: string;
  source: "camera" | "bio";
};

function normalizeConcern(raw: unknown): Concern {
  if (typeof raw === "string") {
    return { name: raw, severity: 2, description: "" };
  }

  if (!raw || typeof raw !== "object") {
    return { name: "skin balance", severity: 2, description: "" };
  }

  const concern = raw as Record<string, unknown>;
  const severity = typeof concern.severity === "number" ? concern.severity : 2;

  return {
    name: typeof concern.name === "string" ? concern.name : "skin balance",
    severity: Math.min(5, Math.max(1, Math.round(severity))),
    description: typeof concern.description === "string" ? concern.description : "",
  };
}

export function normalizeConcerns(raw: unknown): Concern[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeConcern);
}

export function getSeverityFromScore(score: number): SeverityLabel {
  if (score >= 88) return "clear";
  if (score >= 72) return "mild";
  if (score >= 52) return "moderate";
  return "severe";
}

export function getSeverityFromConcerns(concerns: Concern[]): SeverityLabel {
  const maxSeverity = concerns.reduce((max, concern) => Math.max(max, concern.severity), 0);
  if (maxSeverity <= 1) return "clear";
  if (maxSeverity <= 2) return "mild";
  if (maxSeverity <= 4) return "moderate";
  return "severe";
}

export function getSkinScore(concerns: Concern[]): number {
  if (!concerns.length) return 94;
  const averageSeverity = concerns.reduce((sum, concern) => sum + concern.severity, 0) / concerns.length;
  return Math.min(99, Math.max(35, Math.round(104 - averageSeverity * 13)));
}

export function normalizeHistoryEntry(raw: unknown): ScanHistoryItem | null {
  if (!raw || typeof raw !== "object") return null;

  const entry = raw as Record<string, unknown>;
  const concerns = normalizeConcerns(entry.concerns);
  const score = typeof entry.skinScore === "number" ? entry.skinScore : getSkinScore(concerns);
  const source = entry.source === "bio" ? "bio" : "camera";

  return {
    id: typeof entry.id === "string" ? entry.id : `${entry.date ?? Date.now()}`,
    date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
    skinType: typeof entry.skinType === "string" ? entry.skinType : "Unclear",
    skinScore: Math.min(100, Math.max(0, Math.round(score))),
    severity:
      entry.severity === "clear" ||
      entry.severity === "mild" ||
      entry.severity === "moderate" ||
      entry.severity === "severe"
        ? entry.severity
        : getSeverityFromScore(score),
    concerns,
    photo: typeof entry.photo === "string" ? entry.photo : undefined,
    fitzpatrickScale: typeof entry.fitzpatrickScale === "string" ? entry.fitzpatrickScale : undefined,
    source,
  };
}

export function readScanHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeHistoryEntry)
      .filter((entry): entry is ScanHistoryItem => Boolean(entry))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function saveScanToHistory(
  analysis: SkinAnalysis,
  options: { photo?: string; source: "camera" | "bio" },
) {
  if (typeof window === "undefined") return;

  const concerns = normalizeConcerns(analysis.concerns);
  const skinScore = getSkinScore(concerns);
  const entry: ScanHistoryItem = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    date: new Date().toISOString(),
    skinType: analysis.skinType,
    skinScore,
    severity: getSeverityFromConcerns(concerns),
    concerns,
    photo: options.photo,
    fitzpatrickScale: analysis.fitzpatrickScale,
    source: options.source,
  };

  const history = readScanHistory();
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, 30)));
}
