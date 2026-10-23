import { DIFFICULTY_LABELS } from '../data/difficulty';
import { getSettings, isCauldronFull } from '../logic/game-rules';
import type { IGameState, IRecipe, IRecipeRange, ParameterName } from '../types/game';
import { createElement } from './dom';
import { formatRange } from './format';

interface IRangeRow {
  readonly parameter: ParameterName;
  readonly label: string;
  readonly modifier: string;
}

const RANGE_ROWS: readonly IRangeRow[] = [
  { parameter: 'temperature', label: 'Temperature', modifier: 'temperature' },
  { parameter: 'density', label: 'Density', modifier: 'density' },
  { parameter: 'magicPower', label: 'Magic Power', modifier: 'magic-power' },
];

/**
 * The active recipe: its name, the three target ranges and the ingredient counter.
 */
export class RecipeView {
  readonly #name: HTMLParagraphElement;
  readonly #ranges: Map<ParameterName, HTMLElement> = new Map<ParameterName, HTMLElement>();
  readonly #rangeList: HTMLDListElement;
  readonly #tolerance: HTMLParagraphElement;
  readonly #counter: HTMLParagraphElement;
  readonly element: HTMLElement;

  constructor() {
    this.#name = createElement('p', { className: 'recipe__name' });
    this.#rangeList = createElement(
      'dl',
      { className: 'recipe__ranges' },
      RANGE_ROWS.map((row: IRangeRow): HTMLDivElement => {
        const value: HTMLElement = createElement('dd', { className: 'recipe__range-value' });

        this.#ranges.set(row.parameter, value);

        return createElement('div', { className: `recipe__range recipe__range--${row.modifier}` }, [
          createElement('dt', { className: 'recipe__range-label', text: row.label }),
          value,
        ]);
      }),
    );
    this.#tolerance = createElement('p', { className: 'recipe__tolerance' });
    this.#counter = createElement('p', { className: 'recipe__counter' });
    this.element = createElement(
      'section',
      { className: 'panel recipe', attributes: { 'aria-labelledby': 'recipe-title' } },
      [
        createElement('h2', {
          className: 'panel__title',
          text: 'Current Recipe',
          attributes: { id: 'recipe-title' },
        }),
        this.#name,
        this.#rangeList,
        this.#tolerance,
        this.#counter,
      ],
    );
  }

  render(state: IGameState): void {
    const recipe: IRecipe | undefined = state.activeRecipe;
    const maximum: number = getSettings(state).maxCauldronIngredients;

    this.#name.textContent = recipe ? recipe.name : 'A recipe appears when the game starts';
    this.#name.classList.toggle('recipe__name--empty', !recipe);
    this.#rangeList.hidden = !recipe;
    this.#tolerance.hidden = !recipe;
    this.#tolerance.textContent = `${DIFFICULTY_LABELS[state.difficulty]}: brew tolerance ±${String(getSettings(state).tolerance)}`;

    for (const row of RANGE_ROWS) {
      const range: IRecipeRange | undefined = recipe?.[row.parameter];

      this.#ranges.get(row.parameter)?.replaceChildren(range ? formatRange(range) : '');
    }

    this.#counter.textContent = `Ingredients: ${String(state.cauldronIngredients.length)} / ${String(maximum)}`;
    // a full counter explains why the shelf stopped taking ingredients
    this.#counter.classList.toggle(
      'recipe__counter--full',
      state.status === 'playing' && isCauldronFull(state),
    );
  }
}
