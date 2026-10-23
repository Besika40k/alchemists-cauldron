import { DIFFICULTY_LABELS } from '../data/difficulty';
import { canBrew, getSettings } from '../logic/game-rules';
import type { IGameState } from '../types/game';
import { createElement } from './dom';
import { describeDifficulty } from './format';

export interface IActionHandlers {
  readonly onStart: () => void;
  readonly onBrew: () => void;
  readonly onPause: () => void;
  readonly onShowHelp: () => void;
  readonly onShowMenu: () => void;
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
 * the center with the chosen difficulty under it, and Help, Menu and Leaderboard in a
 * row below; during a run Pause and Brew.
 */
export class ActionsView {
  readonly #difficultyNote: HTMLParagraphElement;
  readonly #menuRow: HTMLDivElement;
  readonly #startButton: HTMLButtonElement;
  readonly #pauseButton: HTMLButtonElement;
  readonly #brewButton: HTMLButtonElement;
  readonly element: HTMLElement;

  constructor(handlers: IActionHandlers) {
    this.#startButton = createActionButton('Start Game', handlers.onStart);
    this.#pauseButton = createActionButton('Pause', handlers.onPause, 'button button--large');
    this.#brewButton = createActionButton('Brew', handlers.onBrew);
    this.#difficultyNote = createElement('p', { className: 'actions__note' });
    this.#menuRow = createElement('div', { className: 'actions__row' }, [
      createActionButton('Help', handlers.onShowHelp, 'button'),
      createActionButton('Menu', handlers.onShowMenu, 'button'),
      createActionButton('Leaderboard', handlers.onShowLeaderboard, 'button'),
    ]);
    this.element = createElement('div', { className: 'actions' }, [
      createElement('div', { className: 'actions__row' }, [
        this.#startButton,
        this.#pauseButton,
        this.#brewButton,
      ]),
      this.#difficultyNote,
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
    this.#difficultyNote.hidden = !isMenu;
    this.#difficultyNote.textContent = `${DIFFICULTY_LABELS[state.difficulty]}: ${describeDifficulty(getSettings(state))}`;
    this.#startButton.hidden = !isMenu;
    this.#pauseButton.hidden = state.status !== 'playing' && state.status !== 'paused';
    this.#brewButton.hidden = isMenu;
    // Brew needs at least one ingredient in the cauldron
    this.#brewButton.disabled = !canBrew(state);
  }
}
