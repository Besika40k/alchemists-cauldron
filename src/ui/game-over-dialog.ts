import type { GameOverReason, IGameState } from '../types/game';
import { setDialogOpen } from './dialog';
import { createElement } from './dom';

export interface IGameOverHandlers {
  readonly onPlayAgain: () => void;
  /**
   * The player closed the dialog with Escape: the game goes back to the start screen.
   */
  readonly onDismiss: () => void;
}

const REASON_TEXTS: Readonly<Record<GameOverReason, string>> = {
  time: 'Time is up!',
  lives: 'No lives left!',
  ingredients: 'Out of ingredients',
};

/**
 * The Game Over screen, a modal dialog apart from the play field.
 */
export class GameOverDialog {
  readonly #reason: HTMLParagraphElement;
  readonly #score: HTMLElement;
  #isGameOver: boolean = false;
  readonly element: HTMLDialogElement;

  constructor(handlers: IGameOverHandlers) {
    this.#reason = createElement('p', {
      className: 'dialog__lead',
      attributes: { id: 'game-over-reason' },
    });
    this.#score = createElement('strong', { className: 'game-over__score' });

    const playAgainButton: HTMLButtonElement = createElement('button', {
      className: 'button button--primary button--large',
      text: 'Play again',
      attributes: { type: 'button' },
    });

    playAgainButton.addEventListener('click', handlers.onPlayAgain);

    this.element = createElement(
      'dialog',
      {
        className: 'dialog game-over',
        attributes: {
          'aria-labelledby': 'game-over-title',
          'aria-describedby': 'game-over-reason',
        },
      },
      [
        createElement('h2', {
          className: 'dialog__title',
          text: 'Game Over',
          attributes: { id: 'game-over-title' },
        }),
        this.#reason,
        createElement('p', { className: 'game-over__score-line', text: 'Final score' }, [
          this.#score,
        ]),
        createElement('div', { className: 'dialog__actions' }, [playAgainButton]),
      ],
    );

    // Escape closes a modal dialog by itself; a finished game then shows the start screen
    this.element.addEventListener('close', (): void => {
      if (this.#isGameOver) {
        handlers.onDismiss();
      }
    });
  }

  render(state: IGameState): void {
    this.#isGameOver = state.status === 'game-over';

    if (this.#isGameOver) {
      this.#reason.textContent = state.gameOverReason ? REASON_TEXTS[state.gameOverReason] : '';
      this.#score.textContent = String(state.score);
    }

    setDialogOpen(this.element, this.#isGameOver);
  }
}
