import type { ILeaderboardEntry } from '../types/game';
import type { ConfirmDialog } from './confirm-dialog';
import { createElement } from './dom';
import { formatDate } from './format';

export interface ILeaderboardSource {
  readonly getEntries: () => readonly ILeaderboardEntry[];
  readonly clear: () => void;
}

const COLUMN_TITLES: readonly string[] = ['Rank', 'Name', 'Score', 'Date'];

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
    createElement('td', { className: 'leaderboard__score', text: String(entry.score) }),
    createElement('td', { className: 'leaderboard__date', text: formatDate(entry.date) }),
  ]);
}

/**
 * The Top-10 table with Clear Leaderboard, which asks first in the game's own dialog.
 */
export class LeaderboardDialog {
  readonly #source: ILeaderboardSource;
  readonly #body: HTMLTableSectionElement;
  readonly #table: HTMLTableElement;
  readonly #empty: HTMLParagraphElement;
  readonly #clearButton: HTMLButtonElement;
  readonly element: HTMLDialogElement;

  constructor(source: ILeaderboardSource, confirmDialog: ConfirmDialog) {
    this.#source = source;
    this.#body = createElement('tbody');
    this.#table = createElement('table', { className: 'leaderboard__table' }, [
      createElement('caption', { className: 'visually-hidden', text: 'Top-10 results' }),
      createElement('thead', {}, [createHeaderRow()]),
      this.#body,
    ]);
    this.#empty = createElement('p', {
      className: 'leaderboard__empty',
      text: 'No results yet. Brew a few potions!',
    });
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
      confirmDialog.open({
        title: 'Clear Leaderboard?',
        message: 'All Top-10 results will be deleted. This cannot be undone.',
        confirmText: 'Clear',
        onConfirm: (): void => {
          this.#source.clear();
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
        createElement('div', { className: 'leaderboard__scroll' }, [this.#table]),
        this.#empty,
        createElement('div', { className: 'dialog__actions' }, [this.#clearButton, closeButton]),
      ],
    );
  }

  #render(): void {
    const entries: readonly ILeaderboardEntry[] = this.#source.getEntries();

    this.#body.replaceChildren(
      ...entries.map((entry: ILeaderboardEntry, index: number): HTMLTableRowElement =>
        createRow(entry, index),
      ),
    );
    this.#table.hidden = entries.length === 0;
    this.#empty.hidden = entries.length > 0;
    this.#clearButton.disabled = entries.length === 0;
  }

  open(): void {
    this.#render();
    this.element.showModal();
  }
}
