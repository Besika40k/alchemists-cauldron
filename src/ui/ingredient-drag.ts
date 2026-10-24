import { INGREDIENTS } from '../data/ingredients';
import type { IIngredient } from '../types/game';

/**
 * The drag data type of a shelf card; only a drag that carries it can drop into the
 * cauldron.
 */
export const INGREDIENT_DRAG_TYPE: string = 'application/x-alchemists-ingredient';

/**
 * The catalogue ingredient with this id, or undefined for anything else.
 */
export function findIngredient(id: string | undefined): IIngredient | undefined {
  return INGREDIENTS.find((ingredient: IIngredient): boolean => ingredient.id === id);
}

export function isIngredientDrag(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes(INGREDIENT_DRAG_TYPE) === true;
}
