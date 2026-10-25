import { DIFFICULTY_LABELS } from '../data/difficulty';
import {
  isValidPlayerName,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '../logic/leaderboard';
import type { GameOverReason, IGameState } from '../types/game';
import { setDialogOpen } from './dialog';
import { createElement } from './dom';

export interface IGameOverHandlers {
  readonly onPlayAgain: () => void;
  /**
   * The player closed the dialog with Escape: the game goes back to the start screen.
   */
  readonly onDismiss: () => void;
  readonly onShowLeaderboard: () => void;
  readonly canEnterLeaderboard: () => boolean;
  /**
   * Saves the score under the name and returns its place, or 0 when it was not saved.
   */
  readonly onSaveScore: (name: string) => number;
}

const REASON_TEXTS: Readonly<Record<GameOverReason, string>> = {
  time: 'Time is up!',
  lives: 'No lives left!',
  ingredients: 'Out of ingredients',
};

// the limits come from the leaderboard rules, so the hint always tells the real ones
const NAME_HINT: string = `${String(PLAYER_NAME_MIN_LENGTH)}–${String(PLAYER_NAME_MAX_LENGTH)} characters: letters, digits, space, _ and -`;

function createButton(text: string, className: string, onClick: () => void): HTMLButtonElement {
  const button: HTMLButtonElement = createElement('button', {
    className,
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
}

/**
 * The Game Over screen, a modal dialog apart from the play field. A Top-10 score
 * also asks for the player's name here.
 */
export class GameOverDialog {
  readonly #handlers: IGameOverHandlers;
  readonly #reason: HTMLParagraphElement;
  readonly #score: HTMLElement;
  readonly #form: HTMLFormElement;
  readonly #nameLabel: HTMLLabelElement;
  readonly #nameInput: HTMLInputElement;
  readonly #nameError: HTMLParagraphElement;
  readonly #saved: HTMLParagraphElement;
  #isGameOver: boolean = false;
  readonly element: HTMLDialogElement;

  constructor(handlers: IGameOverHandlers) {
    this.#handlers = handlers;
    this.#reason = createElement('p', {
      className: 'dialog__lead',
      attributes: { id: 'game-over-reason' },
    });
    this.#score = createElement('strong', { className: 'game-over__score' });
    this.#nameLabel = createElement('label', {
      className: 'name-form__label',
      attributes: { for: 'player-name' },
    });
    this.#nameInput = createElement('input', {
      className: 'name-form__input',
      attributes: {
        id: 'player-name',
        name: 'player-name',
        type: 'text',
        autocomplete: 'nickname',
        maxlength: String(PLAYER_NAME_MAX_LENGTH),
        'aria-describedby': 'player-name-hint player-name-error',
      },
    });
    this.#nameError = createElement('p', {
      className: 'name-form__error',
      attributes: { id: 'player-name-error', role: 'alert' },
    });
    this.#form = this.#createForm();
    this.#saved = createElement('p', {
      className: 'game-over__saved',
      attributes: { role: 'status' },
    });

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
        this.#form,
        this.#saved,
        createElement('div', { className: 'dialog__actions' }, [
          createButton('Leaderboard', 'button button--large', handlers.onShowLeaderboard),
          createButton('Play again', 'button button--primary button--large', handlers.onPlayAgain),
        ]),
      ],
    );

    // Escape closes a modal dialog by itself; a finished game then shows the start screen
    this.element.addEventListener('close', (): void => {
      if (this.#isGameOver) {
        handlers.onDismiss();
      }
    });
  }

  #createForm(): HTMLFormElement {
    const form: HTMLFormElement = createElement(
      'form',
      { className: 'name-form', attributes: { novalidate: '' } },
      [
        this.#nameLabel,
        this.#nameInput,
        createElement('p', {
          className: 'name-form__hint',
          text: NAME_HINT,
          attributes: { id: 'player-name-hint' },
        }),
        this.#nameError,
        createElement('button', {
          className: 'button button--primary',
          text: 'Save score',
          attributes: { type: 'submit' },
        }),
      ],
    );

    form.addEventListener('submit', (event: SubmitEvent): void => {
      event.preventDefault();
      this.#saveName();
    });

    return form;
  }

  #saveName(): void {
    const name: string = this.#nameInput.value;
    const isValid: boolean = isValidPlayerName(name);
    const rank: number = isValid ? this.#handlers.onSaveScore(name) : 0;

    this.#nameInput.setAttribute('aria-invalid', String(!isValid));

    if (rank > 0) {
      this.#form.hidden = true;
      this.#saved.textContent = `Saved! You are number ${String(rank)} on the leaderboard.`;

      return;
    }

    this.#nameError.textContent = isValid
      ? 'The score could not be saved: the browser storage is not available.'
      : `Please use ${NAME_HINT}.`;
    this.#nameInput.focus();
  }

  /**
   * Every new Game Over starts with an empty name field, shown only for a Top-10 score.
   */
  #resetForm(): void {
    this.#form.hidden = !this.#handlers.canEnterLeaderboard();
    this.#nameInput.value = '';
    this.#nameInput.removeAttribute('aria-invalid');
    this.#nameError.textContent = '';
    this.#saved.textContent = '';
  }

  render(state: IGameState): void {
    this.#isGameOver = state.status === 'game-over';

    if (this.#isGameOver && !this.element.open) {
      this.#reason.textContent = state.gameOverReason ? REASON_TEXTS[state.gameOverReason] : '';
      this.#score.textContent = String(state.score);
      // every difficulty has its own Top-10, so the form names the list
      this.#nameLabel.textContent = `Your score made the ${DIFFICULTY_LABELS[state.difficulty]} Top-10! Enter your name`;
      this.#resetForm();
    }

    setDialogOpen(this.element, this.#isGameOver);
  }
}
