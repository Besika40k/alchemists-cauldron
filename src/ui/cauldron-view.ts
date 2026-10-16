import { getSettings } from '../logic/game-rules';
import type { IGameState, IIngredient } from '../types/game';
import { createElement } from './dom';
import { createCauldronArt, createIngredientIcon } from './icons';

/**
 * The cauldron drawing and the added ingredients in the order they went in.
 */
export class CauldronView {
  readonly #contents: HTMLOListElement;
  readonly element: HTMLElement;

  constructor() {
    this.#contents = createElement('ol', {
      className: 'cauldron__contents',
      attributes: { 'aria-label': 'Ingredients in the cauldron' },
    });
    this.element = createElement(
      'section',
      { className: 'panel cauldron', attributes: { 'aria-labelledby': 'cauldron-title' } },
      [
        createElement('h2', {
          className: 'panel__title visually-hidden',
          text: 'Cauldron',
          attributes: { id: 'cauldron-title' },
        }),
        createElement('div', { className: 'cauldron__stage' }, [createCauldronArt()]),
        this.#contents,
      ],
    );
  }

  render(state: IGameState): void {
    const capacity: number = getSettings(state).maxCauldronIngredients;
    const freeSlots: number = Math.max(capacity - state.cauldronIngredients.length, 0);

    this.#contents.style.setProperty('--cauldron-capacity', String(capacity));
    this.#contents.replaceChildren(
      ...state.cauldronIngredients.map((ingredient: IIngredient): HTMLLIElement =>
        createElement('li', { className: 'cauldron__item' }, [
          createIngredientIcon(ingredient.id, 'cauldron__item-icon'),
          createElement('span', { className: 'cauldron__item-name', text: ingredient.name }),
        ]),
      ),
      ...Array.from({ length: freeSlots }, (): HTMLLIElement =>
        createElement('li', {
          className: 'cauldron__item cauldron__item--free',
          attributes: { 'aria-hidden': 'true' },
        }),
      ),
    );
  }
}
