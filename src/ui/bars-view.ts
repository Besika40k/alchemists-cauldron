import { isInRange, widenRange } from '../logic/brew-check';
import { getCauldronValues, getSettings } from '../logic/game-rules';
import type {
  ICauldronValues,
  IGameState,
  IRecipe,
  IRecipeRange,
  ParameterName,
} from '../types/game';
import { createElement } from './dom';
import { formatNumber, formatRange } from './format';

interface IBarDefinition {
  readonly parameter: ParameterName;
  readonly label: string;
  readonly modifier: string;
  /**
   * The values at the two ends of the bar. Temperature and Density can be
   * negative, so their 0 sits in the middle.
   */
  readonly scale: IRecipeRange;
}

interface IBarParts {
  readonly root: HTMLDivElement;
  readonly track: HTMLDivElement;
  readonly value: HTMLSpanElement;
}

const BAR_DEFINITIONS: readonly IBarDefinition[] = [
  {
    parameter: 'temperature',
    label: 'Temperature',
    modifier: 'temperature',
    scale: { min: -100, max: 100 },
  },
  { parameter: 'density', label: 'Density', modifier: 'density', scale: { min: -80, max: 80 } },
  {
    parameter: 'magicPower',
    label: 'Magic Power',
    modifier: 'magic-power',
    scale: { min: 0, max: 100 },
  },
];

/**
 * Where a value sits on the bar, from 0 (left end) to 1 (right end). Values past
 * an end stay at that end; the number next to the bar still shows them exactly.
 */
export function toBarPosition(value: number, scale: IRecipeRange): number {
  const position: number = (value - scale.min) / (scale.max - scale.min);

  return Math.min(Math.max(position, 0), 1);
}

function setPosition(track: HTMLDivElement, name: string, position: number): void {
  track.style.setProperty(name, String(position));
}

function createBar(definition: IBarDefinition): IBarParts {
  const value: HTMLSpanElement = createElement('span', { className: 'bar__value', text: '0' });
  const track: HTMLDivElement = createElement(
    'div',
    {
      className: 'bar__track',
      attributes: {
        role: 'meter',
        'aria-label': definition.label,
        'aria-valuemin': String(definition.scale.min),
        'aria-valuemax': String(definition.scale.max),
        'aria-valuenow': '0',
      },
    },
    [
      createElement('span', { className: 'bar__zone bar__zone--tolerance' }),
      createElement('span', { className: 'bar__zone bar__zone--recipe' }),
      createElement('span', { className: 'bar__fill' }),
      createElement('span', { className: 'bar__zero' }),
      createElement('span', { className: 'bar__marker' }),
    ],
  );

  setPosition(track, '--zero-position', toBarPosition(0, definition.scale));

  const { min, max } = definition.scale;
  const header: HTMLParagraphElement = createElement('p', { className: 'bar__header' }, [
    createElement('span', { className: 'bar__label', text: definition.label }),
    value,
  ]);
  const scaleLabels: readonly HTMLSpanElement[] = [min, (min + max) / 2, max].map(
    (mark: number): HTMLSpanElement => createElement('span', { text: formatNumber(mark) }),
  );
  const scale: HTMLParagraphElement = createElement(
    'p',
    { className: 'bar__scale', attributes: { 'aria-hidden': 'true' } },
    scaleLabels,
  );
  const root: HTMLDivElement = createElement(
    'div',
    { className: `bar bar--${definition.modifier}` },
    [header, track, scale],
  );

  return { root, track, value };
}

/**
 * The three cauldron values as bars with the recipe target zone, a marker for the
 * current value and a green glow while the value is inside the recipe range.
 */
export class BarsView {
  readonly #bars: Map<ParameterName, IBarParts> = new Map<ParameterName, IBarParts>();
  readonly element: HTMLElement;

  constructor() {
    this.element = createElement(
      'section',
      { className: 'panel bars', attributes: { 'aria-labelledby': 'bars-title' } },
      [
        createElement('h2', {
          className: 'visually-hidden',
          text: 'Cauldron values',
          attributes: { id: 'bars-title' },
        }),
        ...BAR_DEFINITIONS.map((definition: IBarDefinition): HTMLDivElement => {
          const bar: IBarParts = createBar(definition);

          this.#bars.set(definition.parameter, bar);

          return bar.root;
        }),
      ],
    );
  }

  #renderBar(
    bar: IBarParts,
    definition: IBarDefinition,
    value: number,
    recipe: IRecipe | undefined,
    tolerance: number,
  ): void {
    const { scale } = definition;
    const valuePosition: number = toBarPosition(value, scale);
    const zeroPosition: number = toBarPosition(0, scale);
    const target: IRecipeRange | undefined = recipe?.[definition.parameter];
    const widened: IRecipeRange | undefined = target && widenRange(target, tolerance);

    setPosition(bar.track, '--value-position', valuePosition);
    // the fill grows from the 0 line to the value, to the left for negative values
    setPosition(bar.track, '--fill-start', Math.min(valuePosition, zeroPosition));
    setPosition(bar.track, '--fill-size', Math.abs(valuePosition - zeroPosition));
    setPosition(bar.track, '--zone-start', target ? toBarPosition(target.min, scale) : 0);
    setPosition(bar.track, '--zone-end', target ? toBarPosition(target.max, scale) : 0);
    setPosition(bar.track, '--tolerance-start', widened ? toBarPosition(widened.min, scale) : 0);
    setPosition(bar.track, '--tolerance-end', widened ? toBarPosition(widened.max, scale) : 0);

    bar.root.classList.toggle('bar--has-target', target !== undefined);
    bar.root.classList.toggle('bar--in-range', target !== undefined && isInRange(value, target));
    bar.value.textContent = formatNumber(value);
    // a meter value has to stay inside its range; the text keeps the exact number
    const meterValue: number = Math.min(Math.max(value, scale.min), scale.max);

    bar.track.setAttribute('aria-valuenow', String(meterValue));
    bar.track.setAttribute(
      'aria-valuetext',
      target ? `${formatNumber(value)}, target ${formatRange(target)}` : formatNumber(value),
    );
  }

  render(state: IGameState): void {
    const values: ICauldronValues = getCauldronValues(state);
    const recipe: IRecipe | undefined = state.activeRecipe;
    const tolerance: number = getSettings(state).tolerance;

    for (const definition of BAR_DEFINITIONS) {
      const bar: IBarParts | undefined = this.#bars.get(definition.parameter);

      if (bar) {
        this.#renderBar(bar, definition, values[definition.parameter], recipe, tolerance);
      }
    }
  }
}
