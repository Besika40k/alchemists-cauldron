import type { ICauldronValues, IRecipe, IRecipeRange, ParameterName } from '../types/game';

export const PARAMETER_NAMES: readonly ParameterName[] = ['temperature', 'density', 'magicPower'];

/**
 * The recipe range grown by the tolerance on both sides: 32..42 with ±8 is 24..50.
 */
export function widenRange(range: IRecipeRange, tolerance: number): IRecipeRange {
  return { min: range.min - tolerance, max: range.max + tolerance };
}

export function isInRange(value: number, range: IRecipeRange): boolean {
  return value >= range.min && value <= range.max;
}

/**
 * A brew succeeds when every value is inside its recipe range widened by the tolerance.
 */
export function isBrewSuccessful(
  values: ICauldronValues,
  recipe: IRecipe,
  tolerance: number,
): boolean {
  return PARAMETER_NAMES.every((parameter: ParameterName): boolean =>
    isInRange(values[parameter], widenRange(recipe[parameter], tolerance)),
  );
}
