"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2, RotateCcw, ScanFace, User } from "lucide-react";
import { PrivacyConsent } from "@/components/PrivacyConsent";
import { saveScanToHistory } from "@/lib/history";
import { getSessionId } from "@/lib/session";
import type { SkinAnalysis } from "@/lib/types";

type CaptureState = "booting" | "ready" | "captured" | "analyzing" | "error";
type Tab = "camera" | "bio";

const SKIN_TONES = ["Very Fair", "Fair", "Medium", "Olive", "Brown", "Deep"];
const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const CONCERNS = ["Acne", "Wrinkles", "Hyperpigmentation", "Redness", "Dryness", "Large Pores"];

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [tab, setTab] = useState<Tab>("camera");
  const [state, setState] = useState<CaptureState>(() => {
    if (typeof window === "undefined") return "booting";
    return localStorage.getItem("skin-privacy-ok") ? "booting" : "error";
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("skin-privacy-ok");
  });

  // Bio form state
  const [skinTone, setSkinTone] = useState("Medium");
  const [skinType, setSkinType] = useState("Normal");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState(30);
  const [bioAnalyzing, setBioAnalyzing] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setState("booting");
    setPhoto(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser.");
      }

      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("ready");
    } catch (cameraError) {
      setState("error");
      setError(cameraError instanceof Error ? cameraError.message : "Unable to start the camera.");
    }
  }, [stopCamera]);

  // Initial camera boot
  useEffect(() => {
    let cancelled = false;

    const bootCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1440 } },
          audio: false,
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState("ready");
      } catch (cameraError) {
        if (cancelled) return;
        setState("error");
        setError(cameraError instanceof Error ? cameraError.message : "Unable to start the camera.");
      }
    };

    const consented = localStorage.getItem("skin-privacy-ok");
    if (!consented) {
      return;
    }
    void bootCamera();
    return () => { cancelled = true; stopCamera(); };
  }, [stopCamera]);

  const handleConsent = () => {
    localStorage.setItem("skin-privacy-ok", "1");
    setShowConsent(false);
    void startCamera();
  };

  const handleBioInstead = () => {
    setShowConsent(false);
    setTab("bio");
    stopCamera();
  };

  const switchToCamera = () => {
    setTab("camera");
    const consented = localStorage.getItem("skin-privacy-ok");
    if (!consented) { setShowConsent(true); return; }
    void startCamera();
  };

  const switchToBio = () => {
    setTab("bio");
    stopCamera();
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 900;
    const height = video.videoHeight || 1200;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const image = canvas.toDataURL("image/jpeg", 0.86);
    setPhoto(image);
    setState("captured");
    stopCamera();
  };

  const retake = () => { setPhoto(null); void startCamera(); };

  const analyze = async () => {
    if (!photo) return;
    setState("analyzing");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: photo, sessionId: getSessionId() }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Analysis failed.");

      saveScanToHistory(payload as SkinAnalysis, { photo, source: "camera" });
      sessionStorage.setItem("skin-analysis", JSON.stringify(payload));
      router.push("/results");
    } catch (e) {
      setState("captured");
      setError(e instanceof Error ? e.message : "Analysis failed.");
    }
  };

  const analyzeBio = async () => {
    setBioAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bioData: { skinTone, skinType, concerns, ageRange },
          imageData: null,
          sessionId: getSessionId(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Analysis failed.");

      saveScanToHistory(payload as SkinAnalysis, { source: "bio" });
      sessionStorage.setItem("skin-analysis", JSON.stringify(payload));
      router.push("/results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBioAnalyzing(false);
    }
  };

  const toggleConcern = (c: string) =>
    setConcerns((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-lg flex-col">
        <header className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">Skin scan</p>
            <h1 className="text-lg font-semibold text-white">Capture a clear face photo</h1>
          </div>
          <div className="size-10" />
        </header>

        {/* Tab switcher */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={switchToCamera}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold tracking-wide transition ${
              tab === "camera" ? "bg-emerald-300 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            <Camera size={14} />
            CAMERA SCAN
          </button>
          <button
            type="button"
            onClick={switchToBio}
            className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold tracking-wide transition ${
              tab === "bio" ? "bg-emerald-300 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            <User size={14} />
            BIO PROFILE
          </button>
        </div>

        {tab === "camera" ? (
          <>
            <section className="relative flex-1 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/40">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Captured skin scan" className="h-full min-h-[480px] w-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="h-full min-h-[480px] w-full scale-x-[-1] object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-white/35" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-white/75 backdrop-blur">
                {state === "analyzing" ? <Loader2 className="animate-spin" size={14} /> : <ScanFace size={14} />}
                {state === "analyzing" ? "Analyzing" : state === "captured" ? "Photo ready" : "Camera"}
              </div>
            </section>

            {error ? (
              <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {state === "captured" ? (
                <div className="grid grid-cols-[0.42fr_0.58fr] gap-3">
                  <button
                    type="button"
                    onClick={retake}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 font-semibold text-white"
                  >
                    <RotateCcw size={18} />
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={analyze}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 font-semibold text-black"
                  >
                    Analyze
                    <ScanFace size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={state === "error" ? startCamera : takePhoto}
                  disabled={state === "booting" || state === "analyzing"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {state === "booting" ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  {state === "error" ? "Try Camera Again" : state === "booting" ? "Starting Camera" : "Take Photo"}
                </button>
              )}
              <p className="text-center text-xs leading-5 text-white/45">
                Use even lighting and remove heavy filters. This MVP provides cosmetic guidance only.
              </p>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          /* BIO PROFILE TAB */
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 rounded-lg border border-white/10 bg-white/[0.045] p-5">
              {/* Skin Tone */}
              <div>
                <label htmlFor="skin-tone" className="mb-2 block text-sm font-semibold text-white">
                  Skin Tone
                </label>
                <select
                  id="skin-tone"
                  value={skinTone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-300/50"
                >
                  {SKIN_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Skin Type */}
              <div>
                <p className="mb-3 text-sm font-semibold text-white">Skin Type</p>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPES.map((t) => (
                    <label key={t} className="cursor-pointer">
                      <input
                        type="radio"
                        name="skinType"
                        value={t}
                        checked={skinType === t}
                        onChange={() => setSkinType(t)}
                        className="sr-only"
                      />
                      <span className={`inline-block rounded-full border px-3 py-1.5 text-sm transition ${
                        skinType === t
                          ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-100"
                          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}>
                        {t}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary Concerns */}
              <div>
                <p className="mb-3 text-sm font-semibold text-white">Primary Concerns</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {CONCERNS.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={concerns.includes(c)}
                        onChange={() => toggleConcern(c)}
                        className="size-4 rounded border-white/20 accent-emerald-300"
                      />
                      <span className="text-sm text-white/80">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Age Range</p>
                  <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-0.5 text-sm text-emerald-100">
                    {ageRange}
                  </span>
                </div>
                <input
                  type="range"
                  min={13}
                  max={70}
                  value={ageRange}
                  onChange={(e) => setAgeRange(Number(e.target.value))}
                  className="w-full accent-emerald-300"
                />
                <div className="mt-1 flex justify-between text-xs text-white/35">
                  <span>13</span>
                  <span>70</span>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={analyzeBio}
              disabled={bioAnalyzing}
              className="mt-4 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-55"
            >
              {bioAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <ScanFace size={18} />}
              {bioAnalyzing ? "Analyzing..." : "Get Recommendations"}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-white/45">
              Profile-based AI recommendations — no camera required.
            </p>
          </div>
        )}
      </div>
      {showConsent ? (
        <PrivacyConsent onConsent={handleConsent} onBioInstead={handleBioInstead} />
      ) : null}
    </main>
  );
}
