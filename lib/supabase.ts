import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

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
