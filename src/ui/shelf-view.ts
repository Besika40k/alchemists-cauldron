import { INGREDIENTS } from '../data/ingredients';
import { isCauldronFull } from '../logic/game-rules';
import { getStock } from '../logic/stock';
import type { IGameState, IIngredient, IngredientId } from '../types/game';
import { createElement } from './dom';
import { formatSignedNumber } from './format';
import { createIngredientIcon } from './icons';
import { findIngredient, INGREDIENT_DRAG_TYPE } from './ingredient-drag';

export type IngredientHandler = (id: IngredientId) => void;

interface IShelfCard {
  readonly button: HTMLButtonElement;
  readonly stock: HTMLSpanElement;
}

interface IStatDescription {
  readonly modifier: string;
  readonly shortName: string;
  readonly fullName: string;
  readonly value: number;
}

function describeStats(ingredient: IIngredient): readonly IStatDescription[] {
  return [
    {
      modifier: 'temperature',
      shortName: 'T',
      fullName: 'Temperature',
      value: ingredient.temperature,
    },
    { modifier: 'density', shortName: 'D', fullName: 'Density', value: ingredient.density },
    {
      modifier: 'magic-power',
      shortName: 'MP',
      fullName: 'Magic Power',
      value: ingredient.magicPower,
    },
  ];
}

/**
 * "T +25", read by screen readers as "Temperature +25".
 */
function createStat(stat: IStatDescription): HTMLSpanElement {
  return createElement('span', { className: `stat stat--${stat.modifier}` }, [
    createElement('span', { text: stat.shortName, attributes: { 'aria-hidden': 'true' } }),
    createElement('span', { className: 'visually-hidden', text: stat.fullName }),
    ` ${formatSignedNumber(stat.value)}`,
  ]);
}

function findCard(target: EventTarget | null): HTMLButtonElement | undefined {
  return target instanceof Element
    ? (target.closest<HTMLButtonElement>('.ingredient-card') ?? undefined)
    : undefined;
}

/**
 * The ingredient shelf: one button per ingredient with its numbers and its stock badge.
 */
export class ShelfView {
  readonly #list: HTMLUListElement;
  readonly #placeholder: HTMLParagraphElement;
  readonly #cards: Map<IngredientId, IShelfCard> = new Map<IngredientId, IShelfCard>();
  #shelfKey: string = '';
  readonly element: HTMLElement;

  constructor(onAdd: IngredientHandler) {
    this.#list = createElement('ul', { className: 'shelf__list' });
    this.#placeholder = createElement('p', {
      className: 'shelf__placeholder',
      text: 'The shelf fills up when a game starts.',
    });
    this.element = createElement(
      'section',
      { className: 'panel shelf', attributes: { 'aria-labelledby': 'shelf-title' } },
      [
        createElement('h2', {
          className: 'panel__title',
          text: 'Ingredients',
          attributes: { id: 'shelf-title' },
        }),
        this.#placeholder,
        this.#list,
      ],
    );

    this.#list.addEventListener('click', (event: MouseEvent): void => {
      const ingredient: IIngredient | undefined = findIngredient(
        findCard(event.target)?.dataset['ingredientId'],
      );

      if (ingredient) {
        onAdd(ingredient.id);
      }
    });

    // a card carries its ingredient id to the cauldron, where the drop adds it like a click
    this.#list.addEventListener('dragstart', (event: DragEvent): void => {
      const card: HTMLButtonElement | undefined = findCard(event.target);
      const id: string | undefined = card?.draggable ? card.dataset['ingredientId'] : undefined;

      if (!id || !event.dataTransfer) {
        event.preventDefault();

        return;
      }

      event.dataTransfer.setData(INGREDIENT_DRAG_TYPE, id);
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.effectAllowed = 'copy';
    });
  }

  #buildCards(shelf: readonly IIngredient[]): void {
    this.#cards.clear();
    this.#list.replaceChildren(
      ...shelf.map((ingredient: IIngredient): HTMLLIElement => {
        const stock: HTMLSpanElement = createElement('span', {
          className: 'ingredient-card__stock-value',
        });
        const button: HTMLButtonElement = createElement(
          'button',
          {
            className: 'ingredient-card',
            attributes: { type: 'button', 'data-ingredient-id': ingredient.id },
          },
          [
            createIngredientIcon(ingredient.id, 'ingredient-card__icon'),
            createElement('span', { className: 'ingredient-card__name', text: ingredient.name }),
            createElement(
              'span',
              { className: 'ingredient-card__stats' },
              describeStats(ingredient).map((stat: IStatDescription): HTMLSpanElement =>
                createStat(stat),
              ),
            ),
            createElement('span', { className: 'ingredient-card__stock' }, [
              createElement('span', { className: 'visually-hidden', text: 'Stock: ' }),
              stock,
            ]),
          ],
        );

        this.#cards.set(ingredient.id, { button, stock });

        return createElement('li', { className: 'shelf__slot' }, [button]);
      }),
    );
  }

  /**
   * Moves the keyboard focus to the first ingredient that can still be used.
   */
  focusFirstCard(): void {
    for (const card of this.#cards.values()) {
      if (!card.button.disabled) {
        card.button.focus();

        return;
      }
    }
  }

  render(state: IGameState): void {
    const shelf: readonly IIngredient[] = INGREDIENTS.filter(
      (ingredient: IIngredient): boolean => state.shelfStock[ingredient.id] !== undefined,
    );
    const shelfKey: string = shelf
      .map((ingredient: IIngredient): string => ingredient.id)
      .join(',');

    if (shelfKey !== this.#shelfKey) {
      this.#shelfKey = shelfKey;
      this.#buildCards(shelf);
    }

    this.#placeholder.hidden = shelf.length > 0;

    const isFull: boolean = state.status === 'playing' && isCauldronFull(state);
    const isBlocked: boolean = state.status !== 'playing' || isFull;

    for (const [id, card] of this.#cards) {
      const stock: number = getStock(state.shelfStock, id);
      const isEmpty: boolean = stock === 0;

      card.stock.textContent = String(stock);
      // an empty slot cannot be clicked or focused at all
      card.button.disabled = isEmpty;
      card.button.classList.toggle('ingredient-card--empty', isEmpty);
      // a blocked shelf keeps its focus, it only ignores the clicks
      card.button.setAttribute('aria-disabled', String(isBlocked && !isEmpty));
      // an empty slot, a full cauldron or a stopped game cannot start a drag
      card.button.draggable = !isEmpty && !isBlocked;
    }

    this.element.classList.toggle('shelf--blocked', isFull);
  }
}
