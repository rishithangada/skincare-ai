"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionId } from "@/lib/session";
import { getRecentScanHistory, type ScanHistoryRow } from "@/lib/supabase";

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function topConcern(row: ScanHistoryRow) {
  const concerns = Array.isArray(row.concerns) ? row.concerns : [];
  return concerns[0]?.name ?? "No concern recorded";
}

function score(row: ScanHistoryRow) {
  return row.score ?? row.overall_score ?? 0;
}

function skinType(row: ScanHistoryRow) {
  return row.skin_type ?? "Unclear";
}

export default function HistoryPage() {
  const [rows, setRows] = useState<ScanHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getRecentScanHistory(getSessionId());
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen px-5 py-6 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm text-white/60 hover:text-white">Back</Link>
          <Link href="/scan" className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-black">
            New scan
          </Link>
        </header>

        <h1 className="text-3xl font-semibold">Scan history</h1>
        <p className="mt-2 text-sm text-white/55">Most recent 10 Supabase scan results.</p>

        <section className="mt-6 grid gap-3">
          {loading ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-white/55">Loading scans...</div>
          ) : rows.length ? (
            rows.map((row) => (
              <article key={row.id ?? row.created_at} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/45">{formatDate(row.created_at)}</p>
                    <h2 className="mt-1 text-lg font-semibold">{skinType(row)}</h2>
                    <p className="mt-1 text-sm text-white/60">Top concern: {topConcern(row)}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200/25 bg-emerald-300/15 px-3 py-1 text-sm font-semibold text-emerald-100">
                    {score(row)}/100
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
              <h2 className="text-xl font-semibold">No scans saved yet</h2>
              <p className="mt-2 text-sm text-white/55">Run a scan and it will be saved to Supabase history.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
