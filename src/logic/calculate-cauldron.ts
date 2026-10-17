import type { ICauldronValues, IIngredient } from '../types/game';

export const EMPTY_CAULDRON_VALUES: ICauldronValues = {
  temperature: 0,
  density: 0,
  magicPower: 0,
};

/**
 * The cauldron values are the sums of the values of every added ingredient.
 */
export function calculateCauldron(ingredients: readonly IIngredient[]): ICauldronValues {
  let temperature: number = EMPTY_CAULDRON_VALUES.temperature;
  let density: number = EMPTY_CAULDRON_VALUES.density;
  let magicPower: number = EMPTY_CAULDRON_VALUES.magicPower;

  for (const ingredient of ingredients) {
    temperature += ingredient.temperature;
    density += ingredient.density;
    magicPower += ingredient.magicPower;
  }

  return { temperature, density, magicPower };
}
