import { getSettings } from '../logic/game-rules';
import { secondsToMilliseconds } from '../logic/timer';
import type { IGameState } from '../types/game';
import { createElement } from './dom';
import { formatTime } from './format';
import { createHeartIcon } from './icons';

// under 15 seconds the timer turns red and pulses
const LOW_TIME: number = secondsToMilliseconds(15);

/**
 * The score, the time left and the lives above the play field.
 */
export class HudView {
  readonly #score: HTMLSpanElement;
  readonly #timeItem: HTMLParagraphElement;
  readonly #time: HTMLSpanElement;
  readonly #timeBar: HTMLSpanElement;
  readonly #hearts: HTMLSpanElement;
  readonly #livesText: HTMLSpanElement;
  #shownLives: number = -1;
  readonly element: HTMLDivElement;

  constructor() {
    this.#score = createElement('span', { className: 'hud__value', text: '0' });
    this.#time = createElement('span', { className: 'hud__value hud__time', text: '00:00' });
    this.#timeBar = createElement('span', { className: 'hud__time-bar' }, [
      createElement('span', { className: 'hud__time-fill' }),
    ]);
    this.#timeItem = createElement('p', { className: 'hud__item hud__item--time' }, [
      createElement('span', { className: 'hud__label', text: 'Time' }),
      this.#time,
      this.#timeBar,
    ]);
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
      this.#timeItem,
      createElement('p', { className: 'hud__item hud__item--lives' }, [
        createElement('span', { className: 'hud__label', text: 'Lives' }),
        this.#hearts,
        this.#livesText,
      ]),
    ]);
  }

  #renderTime(state: IGameState): void {
    const startTime: number = secondsToMilliseconds(getSettings(state).startTimeSeconds);

    this.#time.textContent = formatTime(state.timeLeft);
    // the bar gets smaller with the time; a CSS transition smooths the steps
    this.#timeBar.style.setProperty('--time-share', String(state.timeLeft / startTime));
    this.#timeItem.classList.toggle(
      'hud__item--low',
      state.status === 'playing' && state.timeLeft < LOW_TIME,
    );
  }

  render(state: IGameState): void {
    this.#score.textContent = String(state.score);
    this.#renderTime(state);

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
