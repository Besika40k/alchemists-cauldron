import { DEFAULT_DIFFICULTY, DIFFICULTIES, DIFFICULTY_LABELS } from '../data/difficulty';
import type { Difficulty, ILeaderboardEntry } from '../types/game';
import type { ConfirmDialog } from './confirm-dialog';
import { createElement } from './dom';
import { formatDate } from './format';

export interface ILeaderboardSource {
  readonly getEntries: (difficulty: Difficulty) => readonly ILeaderboardEntry[];
  readonly clear: (difficulty: Difficulty) => void;
}

const COLUMN_TITLES: readonly string[] = ['Rank', 'Name', 'Difficulty', 'Score', 'Date'];

function createHeaderRow(): HTMLTableRowElement {
  const cells: readonly HTMLTableCellElement[] = COLUMN_TITLES.map(
    (title: string): HTMLTableCellElement =>
      createElement('th', { text: title, attributes: { scope: 'col' } }),
  );

  return createElement('tr', {}, cells);
}

function createRow(entry: ILeaderboardEntry, index: number): HTMLTableRowElement {
  return createElement('tr', {}, [
    createElement('td', { className: 'leaderboard__rank', text: String(index + 1) }),
    createElement('td', { className: 'leaderboard__name', text: entry.name }),
    createElement('td', {
      className: 'leaderboard__difficulty',
      text: DIFFICULTY_LABELS[entry.difficulty],
    }),
    createElement('td', { className: 'leaderboard__score', text: String(entry.score) }),
    createElement('td', { className: 'leaderboard__date', text: formatDate(entry.date) }),
  ]);
}

/**
 * The Top-10 table of one difficulty, a switch between the difficulties and Clear
 * Leaderboard, which asks first in the game's own dialog.
 */
export class LeaderboardDialog {
  readonly #source: ILeaderboardSource;
  readonly #switchButtons: Map<Difficulty, HTMLButtonElement> = new Map<
    Difficulty,
    HTMLButtonElement
  >();
  readonly #caption: HTMLTableCaptionElement;
  readonly #body: HTMLTableSectionElement;
  readonly #table: HTMLTableElement;
  readonly #empty: HTMLParagraphElement;
  readonly #clearButton: HTMLButtonElement;
  #difficulty: Difficulty = DEFAULT_DIFFICULTY;
  readonly element: HTMLDialogElement;

  constructor(source: ILeaderboardSource, confirmDialog: ConfirmDialog) {
    this.#source = source;
    this.#caption = createElement('caption', { className: 'visually-hidden' });
    this.#body = createElement('tbody');
    this.#table = createElement('table', { className: 'leaderboard__table' }, [
      this.#caption,
      createElement('thead', {}, [createHeaderRow()]),
      this.#body,
    ]);
    this.#empty = createElement('p', { className: 'leaderboard__empty' });
    this.#clearButton = createElement('button', {
      className: 'button button--danger',
      text: 'Clear Leaderboard',
      attributes: { type: 'button' },
    });

    const closeButton: HTMLButtonElement = createElement('button', {
      className: 'button button--primary',
      text: 'Back',
      attributes: { type: 'button' },
    });

    closeButton.addEventListener('click', (): void => {
      this.element.close();
    });
    this.#clearButton.addEventListener('click', (): void => {
      const difficulty: Difficulty = this.#difficulty;

      confirmDialog.open({
        title: 'Clear Leaderboard?',
        message: `All ${DIFFICULTY_LABELS[difficulty]} Top-10 results will be deleted. This cannot be undone.`,
        confirmText: 'Clear',
        onConfirm: (): void => {
          this.#source.clear(difficulty);
          this.#render();
          closeButton.focus();
        },
      });
    });

    this.element = createElement(
      'dialog',
      { className: 'dialog leaderboard', attributes: { 'aria-labelledby': 'leaderboard-title' } },
      [
        createElement('h2', {
          className: 'dialog__title',
          text: 'Top-10 Alchemists',
          attributes: { id: 'leaderboard-title' },
        }),
        createElement(
          'div',
          {
            className: 'leaderboard__switch',
            attributes: { role: 'group', 'aria-label': 'Difficulty of the list' },
          },
          DIFFICULTIES.map((difficulty: Difficulty): HTMLButtonElement =>
            this.#createSwitchButton(difficulty),
          ),
        ),
        createElement('div', { className: 'leaderboard__scroll' }, [this.#table]),
        this.#empty,
        createElement('div', { className: 'dialog__actions' }, [this.#clearButton, closeButton]),
      ],
    );
  }

  /**
   * Shows the list of one difficulty; the pressed button tells which one.
   */
  #createSwitchButton(difficulty: Difficulty): HTMLButtonElement {
    const button: HTMLButtonElement = createElement('button', {
      className: 'leaderboard__switch-button',
      text: DIFFICULTY_LABELS[difficulty],
      attributes: { type: 'button', 'aria-pressed': 'false' },
    });

    button.addEventListener('click', (): void => {
      this.#difficulty = difficulty;
      this.#render();
    });
    this.#switchButtons.set(difficulty, button);

    return button;
  }

  #render(): void {
    const entries: readonly ILeaderboardEntry[] = this.#source.getEntries(this.#difficulty);
    const label: string = DIFFICULTY_LABELS[this.#difficulty];

    for (const [difficulty, button] of this.#switchButtons) {
      button.setAttribute('aria-pressed', String(difficulty === this.#difficulty));
    }

    this.#caption.textContent = `Top-10 results, ${label}`;
    this.#empty.textContent = `No ${label} results yet. Brew a few potions!`;

    this.#body.replaceChildren(
      ...entries.map((entry: ILeaderboardEntry, index: number): HTMLTableRowElement =>
        createRow(entry, index),
      ),
    );
    this.#table.hidden = entries.length === 0;
    this.#empty.hidden = entries.length > 0;
    this.#clearButton.disabled = entries.length === 0;
  }

  /**
   * Opens on the list of the given difficulty, usually the one of the current game.
   */
  open(difficulty: Difficulty): void {
    this.#difficulty = difficulty;
    this.#render();
    this.element.showModal();
  }
}
