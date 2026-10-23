import { canBrew } from '../logic/game-rules';
import type { IGameState } from '../types/game';
import { createElement } from './dom';

export interface IActionHandlers {
  readonly onStart: () => void;
  readonly onBrew: () => void;
  readonly onPause: () => void;
  readonly onShowLeaderboard: () => void;
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
 * The action bar under the play field. Before the first run Start Game sits alone in
 * the center, with Leaderboard in a row under it; during a run Pause and Brew.
 */
export class ActionsView {
  readonly #menuRow: HTMLDivElement;
  readonly #startButton: HTMLButtonElement;
  readonly #pauseButton: HTMLButtonElement;
  readonly #brewButton: HTMLButtonElement;
  readonly element: HTMLElement;

  constructor(handlers: IActionHandlers) {
    this.#startButton = createActionButton('Start Game', handlers.onStart);
    this.#pauseButton = createActionButton('Pause', handlers.onPause, 'button button--large');
    this.#brewButton = createActionButton('Brew', handlers.onBrew);
    this.#menuRow = createElement('div', { className: 'actions__row' }, [
      createActionButton('Leaderboard', handlers.onShowLeaderboard, 'button button--large'),
    ]);
    this.element = createElement('div', { className: 'actions' }, [
      createElement('div', { className: 'actions__row' }, [
        this.#startButton,
        this.#pauseButton,
        this.#brewButton,
      ]),
      this.#menuRow,
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

    this.#menuRow.hidden = !isMenu;
    this.#startButton.hidden = !isMenu;
    this.#pauseButton.hidden = state.status !== 'playing' && state.status !== 'paused';
    this.#brewButton.hidden = isMenu;
    // Brew needs at least one ingredient in the cauldron
    this.#brewButton.disabled = !canBrew(state);
  }
}
