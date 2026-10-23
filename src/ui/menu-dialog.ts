import { DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_SETTINGS } from '../data/difficulty';
import type { Difficulty, IGameState } from '../types/game';
import { createElement } from './dom';
import { describeDifficulty } from './format';

export interface IMenuHandlers {
  readonly onSelectDifficulty: (difficulty: Difficulty) => void;
  readonly onStart: () => void;
  readonly onShowLeaderboard: () => void;
}

function createMenuButton(text: string, className: string, onClick: () => void): HTMLButtonElement {
  const button: HTMLButtonElement = createElement('button', {
    className,
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
}

/**
 * The menu of the start screen: the difficulty of the next game, a new game and the
 * leaderboard. A running game closes it, so its difficulty cannot change.
 */
export class MenuDialog {
  readonly #difficultyButtons: Map<Difficulty, HTMLButtonElement> = new Map<
    Difficulty,
    HTMLButtonElement
  >();
  readonly element: HTMLDialogElement;

  constructor(handlers: IMenuHandlers) {
    const options: HTMLDivElement = createElement(
      'div',
      {
        className: 'difficulty-options',
        attributes: { role: 'group', 'aria-labelledby': 'difficulty-title' },
      },
      DIFFICULTIES.map((difficulty: Difficulty): HTMLButtonElement =>
        this.#createDifficultyButton(difficulty, handlers.onSelectDifficulty),
      ),
    );

    this.element = createElement(
      'dialog',
      { className: 'dialog menu', attributes: { 'aria-labelledby': 'menu-title' } },
      [
        createElement('h2', {
          className: 'dialog__title',
          text: 'Menu',
          attributes: { id: 'menu-title' },
        }),
        createElement('h3', {
          className: 'menu__heading',
          text: 'Difficulty',
          attributes: { id: 'difficulty-title' },
        }),
        options,
        createElement('div', { className: 'dialog__actions dialog__actions--column' }, [
          createMenuButton('Start Game', 'button button--primary button--large', (): void => {
            this.element.close();
            handlers.onStart();
          }),
          createMenuButton('Leaderboard', 'button', (): void => {
            this.element.close();
            handlers.onShowLeaderboard();
          }),
          createMenuButton('Back', 'button', (): void => {
            this.element.close();
          }),
        ]),
      ],
    );
  }

  /**
   * One button per difficulty with the short line of its settings; the pressed one
   * is the difficulty of the next game.
   */
  #createDifficultyButton(
    difficulty: Difficulty,
    onSelect: (difficulty: Difficulty) => void,
  ): HTMLButtonElement {
    const button: HTMLButtonElement = createElement(
      'button',
      { className: 'difficulty-option', attributes: { type: 'button', 'aria-pressed': 'false' } },
      [
        createElement('span', {
          className: 'difficulty-option__name',
          text: DIFFICULTY_LABELS[difficulty],
        }),
        createElement('span', {
          className: 'difficulty-option__details',
          text: describeDifficulty(DIFFICULTY_SETTINGS[difficulty]),
        }),
      ],
    );

    button.addEventListener('click', (): void => {
      onSelect(difficulty);
    });
    this.#difficultyButtons.set(difficulty, button);

    return button;
  }

  open(): void {
    this.element.showModal();
  }

  render(state: IGameState): void {
    for (const [difficulty, button] of this.#difficultyButtons) {
      button.setAttribute('aria-pressed', String(difficulty === state.difficulty));
    }

    // the difficulty is chosen before a game; a running game never shows the menu
    if (state.status !== 'menu' && this.element.open) {
      this.element.close();
    }
  }
}
