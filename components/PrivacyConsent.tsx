"use client";

import { ShieldCheck } from "lucide-react";

type Props = {
  onConsent: () => void;
  onBioInstead: () => void;
};

const PRIVACY_POINTS = [
  "Your photo is processed in real-time and never stored",
  "We don't share your image with third parties",
  "Analysis happens via Claude AI Vision — image sent to Anthropic's API, then discarded",
  "You can use Bio Profile mode instead if you prefer not to use camera",
];

export function PrivacyConsent({ onConsent, onBioInstead }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#060807] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-emerald-300/15 text-emerald-300">
            <ShieldCheck size={22} />
          </span>
          <h2 className="text-lg font-semibold text-white">Before we analyze your skin</h2>
        </div>

        <ul className="mb-6 space-y-3">
          {PRIVACY_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-white/75">
              <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-emerald-300" />
              {point}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onConsent}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-300 px-4 font-semibold text-black transition hover:bg-emerald-200"
          >
            I understand, continue
          </button>
          <button
            type="button"
            onClick={onBioInstead}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Use Bio Profile instead
          </button>
        </div>
      </div>
    </div>
  );
}
