import type { IGameState, ILeaderboardEntry } from '../types/game';
import { ActionsView } from './actions-view';
import { BarsView } from './bars-view';
import { CauldronView } from './cauldron-view';
import { ConfirmDialog } from './confirm-dialog';
import { createElement } from './dom';
import { GameOverDialog } from './game-over-dialog';
import { HudView } from './hud-view';
import { LeaderboardDialog } from './leaderboard-dialog';
import { PauseDialog } from './pause-dialog';
import { RecipeView } from './recipe-view';
import { type IngredientHandler, ShelfView } from './shelf-view';

export interface IGameScreenHandlers {
  readonly onStart: () => void;
  readonly onAddIngredient: IngredientHandler;
  readonly onBrew: () => void;
  readonly onPlayAgain: () => void;
  readonly onShowMenu: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly getLeaderboard: () => readonly ILeaderboardEntry[];
  readonly clearLeaderboard: () => void;
  readonly canEnterLeaderboard: () => boolean;
  readonly onSaveScore: (name: string) => number;
}

/**
 * Builds the play field once and passes every new state to its parts.
 */
export class GameScreen {
  readonly #hud: HudView;
  readonly #shelf: ShelfView;
  readonly #cauldron: CauldronView;
  readonly #recipe: RecipeView;
  readonly #bars: BarsView;
  readonly #gameOver: GameOverDialog;
  readonly #pause: PauseDialog;
  readonly #confirm: ConfirmDialog;
  readonly #leaderboard: LeaderboardDialog;
  readonly #root: HTMLElement;
  readonly #actions: ActionsView;

  constructor(root: HTMLElement, handlers: IGameScreenHandlers) {
    this.#root = root;
    this.#hud = new HudView();
    this.#shelf = new ShelfView(handlers.onAddIngredient);
    this.#cauldron = new CauldronView();
    this.#recipe = new RecipeView();
    this.#bars = new BarsView();
    this.#confirm = new ConfirmDialog();
    this.#leaderboard = new LeaderboardDialog(
      { getEntries: handlers.getLeaderboard, clear: handlers.clearLeaderboard },
      this.#confirm,
    );
    this.#gameOver = new GameOverDialog({
      onPlayAgain: (): void => {
        handlers.onPlayAgain();
        this.#shelf.focusFirstCard();
      },
      onDismiss: handlers.onShowMenu,
      onShowLeaderboard: (): void => {
        this.#leaderboard.open();
      },
      canEnterLeaderboard: handlers.canEnterLeaderboard,
      onSaveScore: handlers.onSaveScore,
    });
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
      onPause: handlers.onPause,
      onShowLeaderboard: (): void => {
        this.#leaderboard.open();
      },
    });
    this.#pause = new PauseDialog({
      onResume: handlers.onResume,
      onExit: (): void => {
        handlers.onShowMenu();
        this.#actions.focusStartButton();
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
      this.#bars.element,
      this.#actions.element,
      this.#gameOver.element,
      this.#pause.element,
      this.#leaderboard.element,
      this.#confirm.element,
    );
  }

  render(state: IGameState): void {
    this.#hud.render(state);
    this.#shelf.render(state);
    this.#cauldron.render(state);
    this.#recipe.render(state);
    this.#bars.render(state);
    this.#actions.render(state);
    this.#gameOver.render(state);
    this.#pause.render(state);
    // the paused field is blurred, so the player cannot plan the next moves
    this.#root.classList.toggle('game--paused', state.status === 'paused');
  }
}
