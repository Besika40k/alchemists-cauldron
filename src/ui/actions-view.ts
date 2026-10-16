import type { IGameState } from '../types/game';
import { createElement } from './dom';

export interface IActionHandlers {
  readonly onStart: () => void;
}

/**
 * The action bar under the play field; before the first run it holds only Start Game.
 */
export class ActionsView {
  readonly #startButton: HTMLButtonElement;
  readonly element: HTMLElement;

  constructor(handlers: IActionHandlers) {
    this.#startButton = createElement('button', {
      className: 'button button--primary button--large',
      text: 'Start Game',
      attributes: { type: 'button' },
    });
    this.#startButton.addEventListener('click', (): void => {
      handlers.onStart();
    });

    this.element = createElement('div', { className: 'actions' }, [this.#startButton]);
  }

  render(state: IGameState): void {
    this.#startButton.hidden = state.status !== 'menu';
  }
}
