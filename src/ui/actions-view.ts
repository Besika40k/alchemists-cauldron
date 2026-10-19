import { canBrew } from '../logic/game-rules';
import type { IGameState } from '../types/game';
import { createElement } from './dom';

export interface IActionHandlers {
  readonly onStart: () => void;
  readonly onBrew: () => void;
  readonly onPause: () => void;
}

function createActionButton(
  text: string,
  onClick: () => void,
  className: string = 'button button--primary button--large',
): HTMLButtonElement {
  const button: HTMLButtonElement = createElement('button', {
    className,
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
}

/**
 * The action bar under the play field: Start Game before the first run, Pause and
 * Brew during it.
 */
export class ActionsView {
  readonly #startButton: HTMLButtonElement;
  readonly #pauseButton: HTMLButtonElement;
  readonly #brewButton: HTMLButtonElement;
  readonly element: HTMLElement;

  constructor(handlers: IActionHandlers) {
    this.#startButton = createActionButton('Start Game', handlers.onStart);
    this.#pauseButton = createActionButton('Pause', handlers.onPause, 'button button--large');
    this.#brewButton = createActionButton('Brew', handlers.onBrew);
    this.element = createElement('div', { className: 'actions' }, [
      this.#startButton,
      this.#pauseButton,
      this.#brewButton,
    ]);
  }

  /**
   * After Exit to Menu the Pause button hides, so the focus moves to Start Game.
   */
  focusStartButton(): void {
    this.#startButton.focus();
  }

  render(state: IGameState): void {
    const isMenu: boolean = state.status === 'menu';

    this.#startButton.hidden = !isMenu;
    this.#pauseButton.hidden = state.status !== 'playing' && state.status !== 'paused';
    this.#brewButton.hidden = isMenu;
    // Brew needs at least one ingredient in the cauldron
    this.#brewButton.disabled = !canBrew(state);
  }
}
