import type { IIngredient, IngredientId, RandomSource, ShelfStock } from '../types/game';

export const MIN_STOCK: number = 2;
export const MAX_STOCK: number = 15;

/**
 * A random whole number from `min` to `max`, both included.
 */
export function randomWholeNumber(min: number, max: number, random: RandomSource): number {
  return min + Math.floor(random() * (max - min + 1));
}

/**
 * Gives every shelf ingredient its own random stock from 2 to 15.
 */
export function createStock(
  ingredients: readonly IIngredient[],
  random: RandomSource = Math.random,
): ShelfStock {
  const stock: Partial<Record<IngredientId, number>> = {};

  for (const ingredient of ingredients) {
    stock[ingredient.id] = randomWholeNumber(MIN_STOCK, MAX_STOCK, random);
  }

  return stock;
}

/**
 * Portions left, 0 for an ingredient that is not on the shelf.
 */
export function getStock(stock: ShelfStock, id: IngredientId): number {
  return stock[id] ?? 0;
}

/**
 * A copy of the stock with one portion of the ingredient taken. Never goes below 0.
 */
export function takeFromStock(stock: ShelfStock, id: IngredientId): ShelfStock {
  return { ...stock, [id]: Math.max(getStock(stock, id) - 1, 0) };
}

/**
 * True when no ingredient on the shelf has a portion left.
 */
export function isShelfEmpty(stock: ShelfStock): boolean {
  return Object.values(stock).every((portions: number): boolean => portions === 0);
}
