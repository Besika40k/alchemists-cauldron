import { getSettings } from '../logic/game-rules';
import type { IBrewResult, IGameState, IIngredient } from '../types/game';
import { createElement } from './dom';
import { createCauldronArt, createIngredientIcon } from './icons';

function describeBrew(brewResult: IBrewResult, scorePerBrew: number): string {
  return brewResult.isSuccess
    ? `${brewResult.recipeName} is ready! +${String(scorePerBrew)} score`
    : `The ${brewResult.recipeName} failed. You lost a life.`;
}

/**
 * The cauldron drawing, the added ingredients in the order they went in and the
 * result of the last brew.
 */
export class CauldronView {
  readonly #contents: HTMLOListElement;
  readonly #message: HTMLParagraphElement;
  #shownIngredients: readonly IIngredient[] | undefined;
  readonly element: HTMLElement;

  constructor() {
    this.#contents = createElement('ol', {
      className: 'cauldron__contents',
      attributes: { 'aria-label': 'Ingredients in the cauldron' },
    });
    // a status region, so screen readers announce every brew result
    this.#message = createElement('p', {
      className: 'cauldron__message',
      attributes: { role: 'status' },
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
        this.#message,
      ],
    );
  }

  render(state: IGameState): void {
    const brewResult: IBrewResult | undefined = state.lastBrew;

    this.#message.textContent = brewResult
      ? describeBrew(brewResult, getSettings(state).scorePerBrew)
      : '';
    this.#message.classList.toggle('cauldron__message--success', brewResult?.isSuccess === true);
    this.#message.classList.toggle('cauldron__message--failure', brewResult?.isSuccess === false);

    // the timer redraws the screen every second; the contents change only with ingredients
    if (state.cauldronIngredients === this.#shownIngredients) {
      return;
    }

    this.#shownIngredients = state.cauldronIngredients;

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
