import type { IGameState } from '../types/game';
import { ActionsView } from './actions-view';
import { CauldronView } from './cauldron-view';
import { createElement } from './dom';
import { type IngredientHandler, ShelfView } from './shelf-view';

export interface IGameScreenHandlers {
  readonly onStart: () => void;
  readonly onAddIngredient: IngredientHandler;
}

/**
 * Builds the play field once and passes every new state to its parts.
 */
export class GameScreen {
  readonly #shelf: ShelfView;
  readonly #cauldron: CauldronView;
  readonly #actions: ActionsView;

  constructor(root: HTMLElement, handlers: IGameScreenHandlers) {
    this.#shelf = new ShelfView(handlers.onAddIngredient);
    this.#cauldron = new CauldronView();
    this.#actions = new ActionsView({ onStart: handlers.onStart });

    root.replaceChildren(
      createElement('header', { className: 'game__header' }, [
        createElement('h1', { className: 'game__title', text: "Alchemist's Cauldron" }),
      ]),
      this.#shelf.element,
      this.#cauldron.element,
      this.#actions.element,
    );
  }

  render(state: IGameState): void {
    this.#shelf.render(state);
    this.#cauldron.render(state);
    this.#actions.render(state);
  }
}
