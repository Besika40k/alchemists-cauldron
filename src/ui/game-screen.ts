import type { IGameState } from '../types/game';
import { ActionsView } from './actions-view';
import { CauldronView } from './cauldron-view';
import { createElement } from './dom';
import { HudView } from './hud-view';
import { RecipeView } from './recipe-view';
import { type IngredientHandler, ShelfView } from './shelf-view';

export interface IGameScreenHandlers {
  readonly onStart: () => void;
  readonly onAddIngredient: IngredientHandler;
  readonly onBrew: () => void;
}

/**
 * Builds the play field once and passes every new state to its parts.
 */
export class GameScreen {
  readonly #hud: HudView;
  readonly #shelf: ShelfView;
  readonly #cauldron: CauldronView;
  readonly #recipe: RecipeView;
  readonly #actions: ActionsView;

  constructor(root: HTMLElement, handlers: IGameScreenHandlers) {
    this.#hud = new HudView();
    this.#shelf = new ShelfView(handlers.onAddIngredient);
    this.#cauldron = new CauldronView();
    this.#recipe = new RecipeView();
    this.#actions = new ActionsView({
      onStart: (): void => {
        handlers.onStart();
        // the Start Game button hides itself, so the focus moves on to the shelf
        this.#shelf.focusFirstCard();
      },
      onBrew: (): void => {
        handlers.onBrew();
        // Brew turns disabled with an empty cauldron, so the focus goes back to the shelf
        this.#shelf.focusFirstCard();
      },
    });

    root.replaceChildren(
      createElement('header', { className: 'game__header' }, [
        createElement('h1', { className: 'game__title', text: "Alchemist's Cauldron" }),
      ]),
      this.#hud.element,
      this.#shelf.element,
      this.#cauldron.element,
      this.#recipe.element,
      this.#actions.element,
    );
  }

  render(state: IGameState): void {
    this.#hud.render(state);
    this.#shelf.render(state);
    this.#cauldron.render(state);
    this.#recipe.render(state);
    this.#actions.render(state);
  }
}
