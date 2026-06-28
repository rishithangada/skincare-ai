import { Droplets, FlaskConical, Sparkles } from "lucide-react";
import type { Recommendation } from "@/lib/types";

type ProductCardProps = {
  product: Recommendation;
  index: number;
};

const colorPairs = [
  "from-emerald-300/25 to-amber-200/15",
  "from-sky-300/20 to-emerald-200/15",
  "from-rose-300/20 to-stone-100/10",
  "from-lime-200/20 to-cyan-200/15",
  "from-orange-200/20 to-emerald-200/10",
  "from-fuchsia-200/15 to-teal-200/15",
];

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20">
      <div className={`h-28 bg-gradient-to-br ${colorPairs[index % colorPairs.length]} p-4`}>
        <div className="flex h-full items-end justify-between">
          <div className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs text-white/80">
            {product.category}
          </div>
          <div className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
            {index % 3 === 0 ? <Droplets size={22} /> : index % 3 === 1 ? <FlaskConical size={22} /> : <Sparkles size={22} />}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">{product.why}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.keyIngredients.slice(0, 3).map((ingredient) => (
            <span
              key={ingredient}
              className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/65"
            >
              {ingredient}
            </span>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 text-xs uppercase tracking-[0.18em] text-emerald-200/80">
          {product.routineStep}
        </div>
      </div>
    </article>
  );
}
