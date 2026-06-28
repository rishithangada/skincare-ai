import Link from "next/link";
import { ArrowRight, Camera, ShieldCheck, ShoppingBag, Sparkles, Star } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: <Camera size={20} />,
    title: "Capture a selfie",
    desc: "Take a clear photo in natural light — no filters. The AI reads your actual skin, not an edited version.",
    photo: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
  },
  {
    n: "02",
    icon: <Sparkles size={20} />,
    title: "AI maps your skin",
    desc: "Gemini Vision identifies skin type, Fitzpatrick scale, and up to 5 visible concerns each with a severity score.",
    photo: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=400&q=80",
  },
  {
    n: "03",
    icon: <ShoppingBag size={20} />,
    title: "Get your routine",
    desc: "6 targeted product picks matched to your concerns — cleanser, serum, moisturizer, SPF, and more.",
    photo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
  },
];

const MOCK_CONCERNS = [
  { name: "Mild hyperpigmentation", severity: 2 },
  { name: "Dehydration lines",       severity: 3 },
  { name: "Enlarged pores (T-zone)", severity: 2 },
];

const MOCK_INGREDIENTS = ["Niacinamide", "Hyaluronic acid", "Vitamin C", "SPF 50+"];

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-6xl">

        {/* Nav */}
        <nav className="flex items-center justify-between py-1 anim-fade-up">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-black glow-pulse">
              <Sparkles size={17} />
            </span>
            <span style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>Lumis</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white">
              <ShoppingBag size={14} /> Marketplace
            </Link>
            <Link href="/scan"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/20">
              <Camera size={14} /> Scan skin
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          {/* Left */}
          <div className="max-w-2xl anim-fade-up-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <ShieldCheck size={12} /> Private · No account · No data stored
            </div>

            <h1 className="text-5xl font-black leading-[0.93] tracking-tight text-white sm:text-[4.5rem]"
              style={{ letterSpacing: "-0.045em" }}>
              A selfie.<br />
              <span className="text-emerald-300">A full routine.</span><br />
              30 seconds.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/48 sm:text-lg">
              AI vision reads your skin type, maps visible concerns with severity scores, and builds a focused 6-product routine — no quiz, no guesswork.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/scan"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 py-3 font-bold text-black transition hover:bg-emerald-200 active:scale-95">
                <Camera size={17} /> Scan Your Skin <ArrowRight size={15} />
              </Link>
              <div className="flex items-center gap-2 text-sm text-white/38">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <span>4.8 · 2,400+ scans</span>
              </div>
            </div>
          </div>

          {/* Right: result card with real photo */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 anim-float anim-fade-up-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(80,216,169,0.18),transparent_55%)]" />

            <div className="relative">
              {/* Photo + score row */}
              <div className="mb-4 flex items-center gap-4">
                <div className="scan-ring relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Skin scan preview"
                    width={56} height={56}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-300/30"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Scan Result</div>
                  <div className="mt-0.5 text-sm font-bold text-white">Combination · Fitzpatrick III</div>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300 ring-1 ring-emerald-300/20">
                  <span className="text-lg font-black leading-none">78</span>
                </div>
              </div>

              {/* Concerns */}
              <div className="mb-4 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-2">Concerns mapped</div>
                {MOCK_CONCERNS.map(({ name, severity }, i) => (
                  <div key={name} className={`anim-fade-up-${i + 1} flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2.5`}>
                    <div className="flex-1 text-sm text-white/68">{name}</div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className={`h-1.5 w-4 rounded-full ${j < severity ? "bg-emerald-400" : "bg-white/10"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-2">Key ingredients</div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_INGREDIENTS.map((ing) => (
                    <span key={ing} className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link href="/scan" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-300/[0.08] border border-emerald-300/15 px-4 py-3 transition hover:bg-emerald-300/15">
                <ShoppingBag size={14} className="text-emerald-300 shrink-0" />
                <span className="text-sm text-white/58">6 product recommendations ready</span>
                <ArrowRight size={13} className="ml-auto text-emerald-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-white/[0.06] pt-20 pb-20">
          <div className="mb-12 text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">How it works</div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl" style={{ letterSpacing: "-0.03em" }}>
              From selfie to routine in 3 steps
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ n, icon, title, desc, photo }) => (
              <div key={n} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]"
                style={{ borderTop: "1px solid rgba(80,216,169,0.25)" }}>
                {/* Step photo */}
                <div className="relative h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
                  <span className="absolute bottom-3 right-3 text-4xl font-black text-white/[0.12]">{n}</span>
                </div>

                {/* Text */}
                <div className="p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                    {icon}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-white leading-snug">{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mb-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8 justify-center sm:justify-start">
            {[
              { value: "2,400+", label: "Scans completed" },
              { value: "6",      label: "Products per routine" },
              { value: "0",      label: "Data stored" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <div className="text-2xl font-black text-white tracking-tight">{value}</div>
                <div className="text-xs text-white/32 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <Link href="/scan"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-200 active:scale-95">
            Start your scan <ArrowRight size={14} />
          </Link>
        </div>

      </section>
    </main>
  );
}
