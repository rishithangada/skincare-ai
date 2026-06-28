export type Concern = {
  name: string;
  severity: number; // 1–5
  description: string;
};

export type Recommendation = {
  name: string;
  category: string;
  why: string;
  keyIngredients: string[];
  routineStep: string;
};

export type SkinAnalysis = {
  skinType: string;
  fitzpatrickScale?: string;
  concerns: Concern[];
  recommendedIngredients?: string[];
  avoidIngredients?: string[];
  productCategories?: string[];
  recommendations: Recommendation[];
};

export type HistoryEntry = {
  date: string;
  skinType: string;
  skinScore: number;
  concerns: string[]; // names only
};
