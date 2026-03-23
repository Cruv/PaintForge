import type { Paint } from '../types';
import { insertEntitiesBatch, hasSeedData } from './database';

// Seed paint database - a representative subset of major hobby paint lines.
// In production, this would be a much larger dataset (~2-3K paints) compiled
// from manufacturer catalogs and community resources.

const SEED_PAINTS: Omit<Paint, 'created' | 'updated'>[] = [
  // --- Citadel Base ---
  { id: 'paint_cit_abaddon_black', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Abaddon Black', format: 'pot', hex: '#231F20', stock: { status: 'stocked' }, equivalents: ['paint_val_72051'], notes: '', tags: ['black', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_mephiston_red', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Mephiston Red', format: 'pot', hex: '#9A1115', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['red', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_macragge_blue', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Macragge Blue', format: 'pot', hex: '#0D407F', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['blue', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_retributor', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Retributor Armour', format: 'pot', hex: '#C39E5C', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['gold', 'metallic', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_wraithbone', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Wraithbone', format: 'pot', hex: '#EBD9A7', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['white', 'bone', 'base', 'contrast-primer'], is_seed: true, owned: false },
  { id: 'paint_cit_leadbelcher', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Leadbelcher', format: 'pot', hex: '#888D91', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['silver', 'metallic', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_death_guard', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Death Guard Green', format: 'pot', hex: '#6D7741', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['green', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_corax_white', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Corax White', format: 'pot', hex: '#F0F0F0', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['white', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_zandri_dust', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Zandri Dust', format: 'pot', hex: '#B5A36C', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['brown', 'tan', 'base'], is_seed: true, owned: false },
  { id: 'paint_cit_naggaroth', type: 'paint', brand: 'Citadel', range: 'Base', name: 'Naggaroth Night', format: 'pot', hex: '#3D2451', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['purple', 'base'], is_seed: true, owned: false },

  // --- Citadel Layer ---
  { id: 'paint_cit_evil_sunz', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Evil Sunz Scarlet', format: 'pot', hex: '#C01411', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['red', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_calgar_blue', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Calgar Blue', format: 'pot', hex: '#2B5D90', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['blue', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_liberator', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Liberator Gold', format: 'pot', hex: '#D4A84B', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['gold', 'metallic', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_stormhost', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Stormhost Silver', format: 'pot', hex: '#CCCFD4', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['silver', 'metallic', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_pallid_wych', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Pallid Wych Flesh', format: 'pot', hex: '#CDCEBE', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['skin', 'flesh', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_ushabti_bone', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Ushabti Bone', format: 'pot', hex: '#BBB473', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['bone', 'layer'], is_seed: true, owned: false },
  { id: 'paint_cit_xereus_purple', type: 'paint', brand: 'Citadel', range: 'Layer', name: 'Xereus Purple', format: 'pot', hex: '#5B2667', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['purple', 'layer'], is_seed: true, owned: false },

  // --- Citadel Shade ---
  { id: 'paint_cit_nuln_oil', type: 'paint', brand: 'Citadel', range: 'Shade', name: 'Nuln Oil', format: 'pot', hex: '#14100E', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['black', 'shade', 'wash'], is_seed: true, owned: false },
  { id: 'paint_cit_agrax', type: 'paint', brand: 'Citadel', range: 'Shade', name: 'Agrax Earthshade', format: 'pot', hex: '#3B3222', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['brown', 'shade', 'wash'], is_seed: true, owned: false },
  { id: 'paint_cit_reikland', type: 'paint', brand: 'Citadel', range: 'Shade', name: 'Reikland Fleshshade', format: 'pot', hex: '#C47A4E', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['flesh', 'shade', 'wash'], is_seed: true, owned: false },
  { id: 'paint_cit_druchii', type: 'paint', brand: 'Citadel', range: 'Shade', name: 'Druchii Violet', format: 'pot', hex: '#7A468A', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['purple', 'shade', 'wash'], is_seed: true, owned: false },

  // --- Citadel Spray ---
  { id: 'paint_cit_chaos_black_spray', type: 'paint', brand: 'Citadel', range: 'Spray', name: 'Chaos Black', format: 'spray', size_ml: 400, hex: '#1A1A1A', stock: { status: 'stocked', quantity: 2, threshold: 1 }, equivalents: [], notes: '', tags: ['black', 'primer', 'spray'], is_seed: true, owned: false },
  { id: 'paint_cit_wraithbone_spray', type: 'paint', brand: 'Citadel', range: 'Spray', name: 'Wraithbone', format: 'spray', size_ml: 400, hex: '#EBD9A7', stock: { status: 'stocked', quantity: 1, threshold: 1 }, equivalents: [], notes: '', tags: ['white', 'bone', 'primer', 'spray'], is_seed: true, owned: false },

  // --- Vallejo Model Color ---
  { id: 'paint_val_70950', type: 'paint', brand: 'Vallejo', range: 'Model Color', name: 'Black', code: '70.950', format: 'dropper', size_ml: 17, hex: '#28251F', stock: { status: 'stocked' }, equivalents: ['paint_cit_abaddon_black'], notes: '', tags: ['black', 'base'], is_seed: true, owned: false },
  { id: 'paint_val_70951', type: 'paint', brand: 'Vallejo', range: 'Model Color', name: 'White', code: '70.951', format: 'dropper', size_ml: 17, hex: '#FCFCFC', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['white', 'base'], is_seed: true, owned: false },
  { id: 'paint_val_70957', type: 'paint', brand: 'Vallejo', range: 'Model Color', name: 'Flat Red', code: '70.957', format: 'dropper', size_ml: 17, hex: '#9B1E14', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['red', 'base'], is_seed: true, owned: false },
  { id: 'paint_val_70925', type: 'paint', brand: 'Vallejo', range: 'Model Color', name: 'Blue', code: '70.925', format: 'dropper', size_ml: 17, hex: '#004B7C', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['blue', 'base'], is_seed: true, owned: false },

  // --- Vallejo Game Color ---
  { id: 'paint_val_72051', type: 'paint', brand: 'Vallejo', range: 'Game Color', name: 'Black', code: '72.051', format: 'dropper', size_ml: 17, hex: '#1E1E1E', stock: { status: 'stocked' }, equivalents: ['paint_cit_abaddon_black'], notes: '', tags: ['black', 'base'], is_seed: true, owned: false },

  // --- Army Painter ---
  { id: 'paint_ap_matt_white', type: 'paint', brand: 'Army Painter', range: 'Warpaints', name: 'Matt White', code: 'WP1102', format: 'dropper', size_ml: 18, hex: '#FFFFFF', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['white', 'base'], is_seed: true, owned: false },
  { id: 'paint_ap_pure_red', type: 'paint', brand: 'Army Painter', range: 'Warpaints', name: 'Pure Red', code: 'WP1104', format: 'dropper', size_ml: 18, hex: '#C8102E', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['red', 'base'], is_seed: true, owned: false },
  { id: 'paint_ap_speedpaint_medium', type: 'paint', brand: 'Army Painter', range: 'Speedpaint', name: 'Speedpaint Medium', code: 'SP2000', format: 'dropper', size_ml: 18, hex: '#FFFFFF', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['medium', 'speedpaint'], is_seed: true, owned: false },

  // --- Colour Forge ---
  { id: 'paint_cf_matt_black', type: 'paint', brand: 'Colour Forge', range: 'Primer', name: 'Matt Black', format: 'spray', size_ml: 500, hex: '#1A1A1A', stock: { status: 'stocked', quantity: 1, threshold: 1 }, equivalents: ['paint_val_70950'], notes: 'Better coverage than Mechanicus in cold weather.', tags: ['primer', 'black', 'spray'], is_seed: true, owned: false },
  { id: 'paint_cf_matt_white', type: 'paint', brand: 'Colour Forge', range: 'Primer', name: 'Matt White', format: 'spray', size_ml: 500, hex: '#FAFAFA', stock: { status: 'stocked', quantity: 1, threshold: 1 }, equivalents: [], notes: '', tags: ['primer', 'white', 'spray'], is_seed: true, owned: false },

  // --- ProAcryl ---
  { id: 'paint_pa_bold_titanium_white', type: 'paint', brand: 'ProAcryl', range: 'ProAcryl', name: 'Bold Titanium White', format: 'dropper', size_ml: 22, hex: '#FEFEFE', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['white', 'base'], is_seed: true, owned: false },
  { id: 'paint_pa_dark_magenta', type: 'paint', brand: 'ProAcryl', range: 'ProAcryl', name: 'Dark Magenta', format: 'dropper', size_ml: 22, hex: '#8E2060', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['magenta', 'pink', 'base'], is_seed: true, owned: false },

  // --- Scale75 ---
  { id: 'paint_sc_black', type: 'paint', brand: 'Scale75', range: 'Scale Color', name: 'Black', code: 'SC-00', format: 'dropper', size_ml: 17, hex: '#191919', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['black', 'base'], is_seed: true, owned: false },

  // --- AK Interactive ---
  { id: 'paint_ak_black', type: 'paint', brand: 'AK Interactive', range: '3rd Gen', name: 'Black', code: 'AK11002', format: 'dropper', size_ml: 17, hex: '#1B1B1B', stock: { status: 'stocked' }, equivalents: [], notes: '', tags: ['black', 'base'], is_seed: true, owned: false },
];

export async function seedDatabase(): Promise<void> {
  const alreadySeeded = await hasSeedData();
  if (alreadySeeded) return;

  const now = new Date().toISOString();
  const paints: Paint[] = SEED_PAINTS.map((p) => ({
    ...p,
    created: now,
    updated: now,
  } as Paint));

  await insertEntitiesBatch(paints);
  console.log(`Seeded ${paints.length} paints`);
}
