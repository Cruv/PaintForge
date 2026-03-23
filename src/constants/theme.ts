// PaintForge Design Tokens

export const colors = {
  // Primary palette
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4A3DB8',

  // Background
  bg: '#F8F9FA',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Stock status
  stockStocked: '#10B981',
  stockLow: '#F59E0B',
  stockOut: '#EF4444',
  stockOnOrder: '#3B82F6',

  // Model status
  statusUnbuilt: '#9CA3AF',
  statusAssembled: '#6B7280',
  statusPrimed: '#8B5CF6',
  statusWip: '#F59E0B',
  statusPainted: '#10B981',

  // Borders & dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Misc
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Tab bar
  tabActive: '#6C5CE7',
  tabInactive: '#9CA3AF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const stockStatusColors: Record<string, string> = {
  stocked: colors.stockStocked,
  low: colors.stockLow,
  out: colors.stockOut,
  on_order: colors.stockOnOrder,
};

export const stockStatusLabels: Record<string, string> = {
  stocked: 'Stocked',
  low: 'Low',
  out: 'Out',
  on_order: 'On Order',
};

export const modelStatusColors: Record<string, string> = {
  unbuilt: colors.statusUnbuilt,
  assembled: colors.statusAssembled,
  primed: colors.statusPrimed,
  wip: colors.statusWip,
  painted: colors.statusPainted,
};

export const modelStatusLabels: Record<string, string> = {
  unbuilt: 'Unbuilt',
  assembled: 'Assembled',
  primed: 'Primed',
  wip: 'WIP',
  painted: 'Painted',
};

export const techniqueLabels: Record<string, string> = {
  prime: 'Prime',
  base: 'Base',
  wash: 'Wash',
  shade: 'Shade',
  layer: 'Layer',
  drybrush: 'Drybrush',
  edge: 'Edge Highlight',
  glaze: 'Glaze',
  contrast: 'Contrast',
  wetblend: 'Wet Blend',
  stipple: 'Stipple',
  sponge: 'Sponge',
  airbrush: 'Airbrush',
  oil_wash: 'Oil Wash',
  enamel_wash: 'Enamel Wash',
  pigment: 'Pigment',
  decal: 'Decal',
  varnish: 'Varnish',
  other: 'Other',
};
