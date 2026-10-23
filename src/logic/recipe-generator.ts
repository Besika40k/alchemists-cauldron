import { RECIPES } from '../data/recipes';
import type { Difficulty, IRecipe, RandomSource } from '../types/game';

export function getRecipesByDifficulty(difficulty: Difficulty): readonly IRecipe[] {
  return RECIPES.filter((recipe: IRecipe): boolean => recipe.difficulty === difficulty);
}

/**
 * One random item of a list that is never empty.
 */
export function pickRandom<Item>(items: readonly [Item, ...Item[]], random: RandomSource): Item {
  const index: number = Math.floor(random() * items.length);

  return items[index] ?? items[0];
}

/**
 * A random recipe of the difficulty; every difficulty has recipes in the table.
 */
export function pickRecipe(difficulty: Difficulty, random: RandomSource = Math.random): IRecipe {
  const [first, ...rest]: readonly IRecipe[] = getRecipesByDifficulty(difficulty);

  if (!first) {
    throw new Error(`No recipes for the ${difficulty} difficulty`);
  }

  return pickRandom([first, ...rest], random);
}
