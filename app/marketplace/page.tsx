import Link from "next/link";
import { Sparkles, ShoppingBag, Star } from "lucide-react";

type Product = {
  name: string;
  brand: string;
  price: string;
  rating: number;
  category: string;
  gradient: string;
};

const ALL_PRODUCTS: Product[] = [
  { name: "Moisturizing Cream", brand: "CeraVe", price: "$18", rating: 4.8, category: "Moisturizer", gradient: "from-blue-300/30 to-cyan-300/15" },
  { name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary", price: "$7", rating: 4.6, category: "Serum", gradient: "from-stone-300/25 to-amber-200/15" },
  { name: "Toleriane Double Repair", brand: "La Roche-Posay", price: "$24", rating: 4.7, category: "Moisturizer", gradient: "from-sky-300/30 to-indigo-200/15" },
  { name: "BHA Liquid Exfoliant", brand: "Paula's Choice", price: "$34", rating: 4.9, category: "Exfoliant", gradient: "from-rose-300/30 to-pink-200/15" },
  { name: "Lala Retro Whipped Cream", brand: "Drunk Elephant", price: "$60", rating: 4.7, category: "Moisturizer", gradient: "from-orange-300/30 to-amber-200/15" },
  { name: "Dewy Skin Cream", brand: "Tatcha", price: "$68", rating: 4.8, category: "Treatment", gradient: "from-purple-300/25 to-pink-200/15" },
  { name: "Snail Mucin 96% Essence", brand: "COSRX", price: "$25", rating: 4.8, category: "Essence", gradient: "from-emerald-300/30 to-teal-200/15" },
  { name: "Hydro Boost Gel Cream", brand: "Neutrogena", price: "$22", rating: 4.6, category: "Moisturizer", gradient: "from-cyan-300/25 to-blue-200/15" },
  { name: "Foaming Facial Cleanser", brand: "CeraVe", price: "$15", rating: 4.7, category: "Cleanser", gradient: "from-teal-300/30 to-green-200/15" },
  { name: "Hyaluronic Acid 2% + B5", brand: "The Ordinary", price: "$9", rating: 4.5, category: "Serum", gradient: "from-amber-300/25 to-yellow-200/15" },
  { name: "Anthelios UV Correct SPF 60", brand: "La Roche-Posay", price: "$38", rating: 4.8, category: "Sunscreen", gradient: "from-yellow-300/30 to-amber-200/15" },
  { name: "C15 Super Booster", brand: "Paula's Choice", price: "$49", rating: 4.7, category: "Antioxidant", gradient: "from-lime-300/30 to-emerald-200/15" },
  { name: "Protini Polypeptide Cream", brand: "Drunk Elephant", price: "$68", rating: 4.8, category: "Moisturizer", gradient: "from-indigo-300/25 to-purple-200/15" },
  { name: "Rice Wash Foam Cleanser", brand: "Tatcha", price: "$38", rating: 4.6, category: "Cleanser", gradient: "from-pink-300/25 to-rose-200/15" },
  { name: "AHA 30% + BHA 2% Peel", brand: "COSRX", price: "$12", rating: 4.5, category: "Exfoliant", gradient: "from-violet-300/25 to-purple-200/15" },
  { name: "Rapid Wrinkle Repair Serum", brand: "Neutrogena", price: "$29", rating: 4.6, category: "Treatment", gradient: "from-fuchsia-300/25 to-pink-200/15" },
];

// Split 16 products across 4 columns of 4
const COLUMNS = [
  ALL_PRODUCTS.slice(0, 4),
  ALL_PRODUCTS.slice(4, 8),
  ALL_PRODUCTS.slice(8, 12),
  ALL_PRODUCTS.slice(12, 16),
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={11}
          className={star <= Math.round(rating) ? "fill-amber-300 text-amber-300" : "fill-white/10 text-white/10"}
        />
      ))}
      <span className="ml-1 text-xs text-white/50">{rating}</span>
    </div>
  );
}

function MarketplaceCard({ product }: { product: Product }) {
  return (
    <article className="flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/30 backdrop-blur-sm">
      <div className={`h-32 bg-gradient-to-br ${product.gradient} flex items-end justify-between p-3`}>
        <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/75">
          {product.category}
        </span>
        <div className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
          <ShoppingBag size={16} className="text-white/80" />
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">{product.brand}</p>
        <h3 className="mt-0.5 text-sm font-semibold leading-snug text-white">{product.name}</h3>
        <div className="mt-2">
          <StarRating rating={product.rating} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-white">{product.price}</span>
          <button
            type="button"
            className="rounded-lg bg-emerald-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-emerald-200"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </article>
  );
}

export default function MarketplacePage() {
  return (
    <main className="h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-300 text-black">
            <Sparkles size={18} />
          </span>
          Skincare AI
        </Link>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Collection</p>
          <h1 className="text-lg font-semibold text-white">Product Marketplace</h1>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Get Your Scan
        </Link>
      </header>

      {/* 4-column auto-scroll grid */}
      <div className="flex-1 grid grid-cols-4 gap-3 px-4 py-4 overflow-hidden">
        {COLUMNS.map((products, colIndex) => {
          const scrollClass = colIndex % 2 === 0 ? "animate-scroll-down" : "animate-scroll-up";
          return (
            <div key={colIndex} className="overflow-hidden">
              <div className={`${scrollClass} flex flex-col gap-3`}>
                {/* Doubled list for seamless infinite loop */}
                {[...products, ...products].map((product, i) => (
                  <MarketplaceCard key={`${colIndex}-${i}`} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
