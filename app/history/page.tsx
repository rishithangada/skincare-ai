"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CalendarDays, ChevronRight, History, ImageIcon, TrendingUp } from "lucide-react";
import { readScanHistory, type ScanHistoryItem, type SeverityLabel } from "@/lib/history";

const severityStyles: Record<SeverityLabel, string> = {
  clear: "border-emerald-200/25 bg-emerald-300/15 text-emerald-100",
  mild: "border-lime-200/25 bg-lime-300/15 text-lime-100",
  moderate: "border-amber-200/25 bg-amber-300/15 text-amber-100",
  severe: "border-rose-200/25 bg-rose-300/15 text-rose-100",
};

function subscribeToHistoryUpdates(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ProgressFrame({
  scan,
  label,
}: {
  scan?: ScanHistoryItem;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</span>
        {scan ? (
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${severityStyles[scan.severity]}`}>
            {scan.severity}
          </span>
        ) : null}
      </div>
      {scan?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={scan.photo} alt={`${label} skin scan`} className="aspect-[4/5] w-full rounded-md object-cover" />
      ) : (
        <div className="grid aspect-[4/5] w-full place-items-center rounded-md border border-white/10 bg-white/[0.035]">
          <div className="text-center text-white/40">
            <ImageIcon className="mx-auto mb-2" size={24} />
            <p className="text-xs">{scan ? "Bio profile" : "No previous scan"}</p>
          </div>
        </div>
      )}
      {scan ? (
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{scan.skinType}</p>
            <p className="mt-0.5 text-xs text-white/45">{formatDate(scan.date)}</p>
          </div>
          <span className="text-2xl font-semibold text-white">{scan.skinScore}</span>
        </div>
      ) : null}
    </div>
  );
}

function ScanCard({
  scan,
  previous,
}: {
  scan: ScanHistoryItem;
  previous?: ScanHistoryItem;
}) {
  const delta = previous ? scan.skinScore - previous.skinScore : 0;

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <CalendarDays size={14} />
            <span>{formatDate(scan.date)} at {formatTime(scan.date)}</span>
          </div>
          <h2 className="mt-2 truncate text-xl font-semibold text-white">{scan.skinType}</h2>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityStyles[scan.severity]}`}>
          {scan.severity}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ProgressFrame scan={previous} label="Before" />
        <ChevronRight className="text-white/25" size={20} />
        <ProgressFrame scan={scan} label="After" />
      </div>

      <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/55">Skin score</span>
          <span className={delta >= 0 ? "text-emerald-200" : "text-rose-200"}>
            {previous ? `${delta >= 0 ? "+" : ""}${delta}` : "baseline"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-300" style={{ width: `${scan.skinScore}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {scan.concerns.slice(0, 5).map((concern) => (
          <span
            key={`${scan.id}-${concern.name}`}
            className="rounded-full border border-emerald-200/15 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-50"
          >
            {concern.name}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function HistoryPage() {
  const scans = useSyncExternalStore(subscribeToHistoryUpdates, readScanHistory, () => []);

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

        <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-emerald-300 text-black">
              <History size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/75">Progress tracker</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">Scan history</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Compare each scan with the previous entry, track severity, and watch cosmetic progress over time.
              </p>
            </div>
          </div>

          {scans.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/45">Total scans</p>
                <p className="mt-1 text-2xl font-semibold text-white">{scans.length}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/45">Latest score</p>
                <p className="mt-1 text-2xl font-semibold text-white">{scans[0].skinScore}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/45">Latest severity</p>
                <p className="mt-1 text-2xl font-semibold capitalize text-white">{scans[0].severity}</p>
              </div>
            </div>
          ) : null}
        </section>

        {scans.length ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {scans.map((scan, index) => (
              <ScanCard key={scan.id} scan={scan} previous={scans[index + 1]} />
            ))}
          </section>
        ) : (
          <section className="grid min-h-[48vh] place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid size-14 place-items-center rounded-lg bg-emerald-300/15 text-emerald-100">
                <TrendingUp size={24} />
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-white">Complete your first scan to track progress</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Your local scan history will appear here after a camera scan or bio profile analysis.
              </p>
              <Link
                href="/scan"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 font-semibold text-black"
              >
                <Camera size={17} />
                Start scan
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
