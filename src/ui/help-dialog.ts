import { DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_SETTINGS } from '../data/difficulty';
import type { Difficulty, IDifficultySettings } from '../types/game';
import { createElement } from './dom';

interface ISettingRow {
  readonly label: string;
  readonly format: (settings: IDifficultySettings) => string;
}

const RULES: readonly string[] = [
  'Press Start Game. The shelf fills with ingredients, each with a few portions in stock.',
  'Click an ingredient to put it into the cauldron. Every one changes Temperature, Density and Magic Power.',
  'Move all three values into the recipe ranges. The green zones on the bars show them, and the tolerance of the difficulty widens them a little.',
  'Press Brew. A good potion gives score, extra time and a new recipe; a wrong mix costs a life. Either way the cauldron empties.',
  'The game ends when the time runs out, when no lives are left, or when the shelf and the cauldron are both empty.',
  'Pause stops the clock. A score that makes the Top-10 of its difficulty asks for your name.',
];

// the difficulty table of the task, built from the same settings the game uses
const SETTING_ROWS: readonly ISettingRow[] = [
  {
    label: 'Ingredients on the shelf',
    format: (settings: IDifficultySettings): string => String(settings.shelfSize),
  },
  {
    label: 'Ingredients in the cauldron',
    format: (settings: IDifficultySettings): string => String(settings.maxCauldronIngredients),
  },
  {
    label: 'Start time',
    format: (settings: IDifficultySettings): string => `${String(settings.startTimeSeconds)} s`,
  },
  {
    label: 'Brew tolerance',
    format: (settings: IDifficultySettings): string => `±${String(settings.tolerance)}`,
  },
  { label: 'Lives', format: (settings: IDifficultySettings): string => String(settings.lives) },
  {
    label: 'Score per brew',
    format: (settings: IDifficultySettings): string => String(settings.scorePerBrew),
  },
  {
    label: 'Time bonus per brew',
    format: (settings: IDifficultySettings): string => `+${String(settings.timeBonusSeconds)} s`,
  },
];

function createHeaderRow(): HTMLTableRowElement {
  const headerCells: readonly HTMLTableCellElement[] = DIFFICULTIES.map(
    (difficulty: Difficulty): HTMLTableCellElement =>
      createElement('th', { text: DIFFICULTY_LABELS[difficulty], attributes: { scope: 'col' } }),
  );

  return createElement('tr', {}, [
    createElement('td', { attributes: { 'aria-hidden': 'true' } }),
    ...headerCells,
  ]);
}

function createSettingRow(row: ISettingRow): HTMLTableRowElement {
  const cells: readonly HTMLTableCellElement[] = DIFFICULTIES.map(
    (difficulty: Difficulty): HTMLTableCellElement =>
      createElement('td', { text: row.format(DIFFICULTY_SETTINGS[difficulty]) }),
  );

  return createElement('tr', {}, [
    createElement('th', { text: row.label, attributes: { scope: 'row' } }),
    ...cells,
  ]);
}

function createDifficultyTable(): HTMLTableElement {
  return createElement('table', { className: 'help__table' }, [
    createElement('caption', { className: 'visually-hidden', text: 'Difficulty settings' }),
    createElement('thead', {}, [createHeaderRow()]),
    createElement(
      'tbody',
      {},
      SETTING_ROWS.map((row: ISettingRow): HTMLTableRowElement => createSettingRow(row)),
    ),
  ]);
}

/**
 * The rules of the game and the difficulty table, opened from the start screen.
 */
export class HelpDialog {
  readonly element: HTMLDialogElement;

  constructor() {
    const backButton: HTMLButtonElement = createElement('button', {
      className: 'button button--primary',
      text: 'Back',
      attributes: { type: 'button' },
    });

    backButton.autofocus = true;
    backButton.addEventListener('click', (): void => {
      this.element.close();
    });

    this.element = createElement(
      'dialog',
      { className: 'dialog help', attributes: { 'aria-labelledby': 'help-title' } },
      [
        createElement('h2', {
          className: 'dialog__title',
          text: 'How to Play',
          attributes: { id: 'help-title' },
        }),
        createElement('p', {
          className: 'dialog__lead',
          text: 'Brew the potions of the recipes before the time or your lives run out.',
        }),
        createElement(
          'ol',
          { className: 'help__rules' },
          RULES.map((rule: string): HTMLLIElement =>
            createElement('li', { className: 'help__rule', text: rule }),
          ),
        ),
        createElement('h3', { className: 'help__heading', text: 'Difficulty' }),
        createElement('div', { className: 'help__table-scroll' }, [createDifficultyTable()]),
        createElement('div', { className: 'dialog__actions' }, [backButton]),
      ],
    );
  }

  open(): void {
    this.element.showModal();
  }
}
