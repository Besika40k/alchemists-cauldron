import { canBrew } from '../logic/game-rules';
import type { IGameState } from '../types/game';
import { createElement } from './dom';

export interface IActionHandlers {
  readonly onStart: () => void;
  readonly onBrew: () => void;
}

function createActionButton(text: string, onClick: () => void): HTMLButtonElement {
  const button: HTMLButtonElement = createElement('button', {
    className: 'button button--primary button--large',
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
}

/**
 * The action bar under the play field: Start Game before the first run, Brew during it.
 */
export class ActionsView {
  readonly #startButton: HTMLButtonElement;
  readonly #brewButton: HTMLButtonElement;
  readonly element: HTMLElement;

  constructor(handlers: IActionHandlers) {
    this.#startButton = createActionButton('Start Game', handlers.onStart);
    this.#brewButton = createActionButton('Brew', handlers.onBrew);
    this.element = createElement('div', { className: 'actions' }, [
      this.#startButton,
      this.#brewButton,
    ]);
  }

  render(state: IGameState): void {
    const isMenu: boolean = state.status === 'menu';

    this.#startButton.hidden = !isMenu;
    this.#brewButton.hidden = isMenu;
    // Brew needs at least one ingredient in the cauldron
    this.#brewButton.disabled = !canBrew(state);
  }
}
