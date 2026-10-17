import type { IGameState } from '../types/game';
import { createElement } from './dom';
import { createHeartIcon } from './icons';

/**
 * The score and the lives above the play field.
 */
export class HudView {
  readonly #score: HTMLSpanElement;
  readonly #hearts: HTMLSpanElement;
  readonly #livesText: HTMLSpanElement;
  #shownLives: number = -1;
  readonly element: HTMLDivElement;

  constructor() {
    this.#score = createElement('span', { className: 'hud__value', text: '0' });
    this.#hearts = createElement('span', {
      className: 'hud__hearts',
      attributes: { 'aria-hidden': 'true' },
    });
    this.#livesText = createElement('span', { className: 'visually-hidden' });
    this.element = createElement('div', { className: 'hud' }, [
      createElement('p', { className: 'hud__item hud__item--score' }, [
        createElement('span', { className: 'hud__label', text: 'Score' }),
        this.#score,
      ]),
      createElement('p', { className: 'hud__item hud__item--lives' }, [
        createElement('span', { className: 'hud__label', text: 'Lives' }),
        this.#hearts,
        this.#livesText,
      ]),
    ]);
  }

  render(state: IGameState): void {
    this.#score.textContent = String(state.score);

    if (state.lives === this.#shownLives) {
      return;
    }

    // the start screen has no life icons yet
    this.#shownLives = state.lives;
    this.#hearts.replaceChildren(
      ...Array.from({ length: state.lives }, (): SVGSVGElement => createHeartIcon('hud__heart')),
    );
    this.#livesText.textContent = String(state.lives);
  }
}
