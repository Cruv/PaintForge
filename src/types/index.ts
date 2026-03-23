// PaintForge Entity Types
// Document-based data model with Obsidian-style backlink relationships

export type EntityType = 'paint' | 'model' | 'recipe' | 'scheme';

export type StockStatus = 'stocked' | 'low' | 'out' | 'on_order';

export type ModelStatus = 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted';

export type PaintFormat = 'pot' | 'dropper' | 'spray' | 'wash' | 'contrast' | 'technical' | 'dry' | 'air' | 'ink' | 'other';

export type Technique =
  | 'prime'
  | 'base'
  | 'wash'
  | 'shade'
  | 'layer'
  | 'drybrush'
  | 'edge'
  | 'glaze'
  | 'contrast'
  | 'wetblend'
  | 'stipple'
  | 'sponge'
  | 'airbrush'
  | 'oil_wash'
  | 'enamel_wash'
  | 'pigment'
  | 'decal'
  | 'varnish'
  | 'other';

// --- Paint ---

export interface PaintStock {
  status: StockStatus;
  quantity?: number;
  threshold?: number;
  ordered_date?: string;
}

export interface PaintCost {
  price?: number;
  currency?: string;
  supplier?: string;
}

export interface Paint {
  id: string;
  type: 'paint';
  brand: string;
  range: string;
  name: string;
  code?: string;
  format: PaintFormat;
  size_ml?: number;
  hex?: string;
  stock: PaintStock;
  cost?: PaintCost;
  equivalents: string[]; // paint IDs
  notes: string;
  tags: string[];
  is_seed: boolean; // true if from pre-seeded database
  owned: boolean; // true if user has added to collection
  created: string;
  updated: string;
}

// --- Model ---

export interface Model {
  id: string;
  type: 'model';
  name: string;
  faction?: string;
  game_system?: string;
  status: ModelStatus;
  base_size?: string;
  project?: string;
  schemes: string[]; // scheme IDs
  photos: string[]; // local file paths
  notes: string;
  tags: string[];
  created: string;
  updated: string;
}

// --- Recipe ---

export interface RecipeStep {
  order: number;
  technique: Technique;
  paint_id: string;
  notes: string;
}

export interface Recipe {
  id: string;
  type: 'recipe';
  model_id: string;
  scheme_id?: string;
  area: string;
  steps: RecipeStep[];
  result_photo?: string;
  rating?: number; // 1-5
  is_template: boolean;
  template_id?: string;
  tags: string[];
  notes: string;
  created: string;
  updated: string;
}

// --- Scheme ---

export interface Scheme {
  id: string;
  type: 'scheme';
  name: string;
  description: string;
  palette: string[]; // paint IDs
  tags: string[];
  created: string;
  updated: string;
}

// Union type for all entities
export type Entity = Paint | Model | Recipe | Scheme;

// --- UI Types ---

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  hex?: string;
  stockStatus?: StockStatus;
}

export interface Connection {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
}
