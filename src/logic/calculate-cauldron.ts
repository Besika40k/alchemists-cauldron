import type { ICauldronValues, IIngredient, IReaction } from '../types/game';

export const EMPTY_CAULDRON_VALUES: ICauldronValues = {
  temperature: 0,
  density: 0,
  magicPower: 0,
};

/**
 * The cauldron values are the sums of the values of every added ingredient, changed by
 * every active reaction in the order of the reaction table. They are worked out from
 * the ingredient list every time.
 */
export function calculateCauldron(
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[] = [],
): ICauldronValues {
  let temperature: number = EMPTY_CAULDRON_VALUES.temperature;
  let density: number = EMPTY_CAULDRON_VALUES.density;
  let magicPower: number = EMPTY_CAULDRON_VALUES.magicPower;

  for (const ingredient of ingredients) {
    temperature += ingredient.temperature;
    density += ingredient.density;
    magicPower += ingredient.magicPower;
  }

  let values: ICauldronValues = { temperature, density, magicPower };

  for (const reaction of reactions) {
    if (reaction.isActive(ingredients)) {
      values = reaction.apply(values);
    }
  }

  return values;
}
