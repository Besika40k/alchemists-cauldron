import type { IIngredient } from '../types/game';

/**
 * The full ordered catalogue from the task README. A difficulty puts the first
 * `shelfSize` entries on the shelf, so the order matters.
 */
export const INGREDIENTS: readonly IIngredient[] = [
  { id: 'dragon-tears', name: 'Dragon Tears', temperature: 25, density: 8, magicPower: 10 },
  { id: 'fairy-dust', name: 'Fairy Dust', temperature: 12, density: 9, magicPower: 12 },
  { id: 'frost-lotus', name: 'Frost Lotus', temperature: -18, density: 4, magicPower: 14 },
  { id: 'mandrake-root', name: 'Mandrake Root', temperature: -5, density: 20, magicPower: 8 },
  { id: 'caustic-acid', name: 'Caustic Acid', temperature: 10, density: 14, magicPower: 22 },
  {
    id: 'essence-of-the-void',
    name: 'Essence of the Void',
    temperature: -20,
    density: -10,
    magicPower: 40,
  },
  { id: 'phoenix-feather', name: 'Phoenix Feather', temperature: 50, density: -10, magicPower: 30 },
  { id: 'toad-slime', name: 'Toad Slime', temperature: 5, density: 30, magicPower: 0 },
];
