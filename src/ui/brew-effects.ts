import type { IBrewResult, IIngredient } from '../types/game';
import { createElement } from './dom';
import { createIngredientIcon } from './icons';

// the smoke puffs of a failed brew fly out in these directions, in degrees
const PUFF_ANGLES: readonly number[] = [0, 60, 120, 180, 240, 300];

function createPuff(angle: number): HTMLSpanElement {
  const puff: HTMLSpanElement = createElement('span', { className: 'brew-effect__puff' });

  puff.style.setProperty('--puff-angle', `${String(angle)}deg`);

  return puff;
}

/**
 * The picture of a brew result over the cauldron. It is a new element every time, so
 * its CSS animation plays from the start; the timing lives in CSS only.
 */
export function createBrewEffect(brewResult: IBrewResult, bonusSeconds: number): HTMLElement {
  return brewResult.isSuccess
    ? createElement('div', { className: 'brew-effect brew-effect--success' }, [
        createElement('span', { className: 'brew-effect__burst' }),
        createElement('span', { className: 'brew-effect__stamp', text: 'Delicious!' }),
        createElement('span', {
          className: 'brew-effect__bonus',
          text: `+${String(bonusSeconds)} s`,
        }),
      ])
    : createElement('div', { className: 'brew-effect brew-effect--failure' }, [
        ...PUFF_ANGLES.map((angle: number): HTMLSpanElement => createPuff(angle)),
        createElement('span', { className: 'brew-effect__stamp', text: 'Boom!' }),
      ]);
}

/**
 * The added ingredients bob on the stew, each one a little out of step.
 */
export function createFloatingIcons(ingredients: readonly IIngredient[]): HTMLElement[] {
  return ingredients.map((ingredient: IIngredient, index: number): HTMLElement => {
    const floater: HTMLSpanElement = createElement('span', { className: 'cauldron__floater' }, [
      createIngredientIcon(ingredient.id, 'cauldron__floater-icon'),
    ]);

    floater.style.setProperty('--float-index', String(index));
    floater.style.setProperty('--float-count', String(ingredients.length));

    return floater;
  });
}
