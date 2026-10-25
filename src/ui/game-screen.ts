import { DEFAULT_DIFFICULTY } from '../data/difficulty';
import type { Difficulty, IGameState, ILeaderboardEntry } from '../types/game';
import { ActionsView } from './actions-view';
import { BarsView } from './bars-view';
import { CauldronView } from './cauldron-view';
import { ConfirmDialog } from './confirm-dialog';
import { createElement } from './dom';
import { GameOverDialog } from './game-over-dialog';
import { HelpDialog } from './help-dialog';
import { HudView } from './hud-view';
import { LeaderboardDialog } from './leaderboard-dialog';
import { MenuDialog } from './menu-dialog';
import { PauseDialog } from './pause-dialog';
import { RecipeView } from './recipe-view';
import { type IngredientHandler, ShelfView } from './shelf-view';

export interface IGameScreenHandlers {
  readonly onStart: () => void;
  readonly onContinue: () => void;
  readonly canContinue: () => boolean;
  readonly onAddIngredient: IngredientHandler;
  readonly onBrew: () => void;
  readonly onPourOut: () => void;
  readonly onPlayAgain: () => void;
  readonly onShowMenu: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onSelectDifficulty: (difficulty: Difficulty) => void;
  readonly getLeaderboard: (difficulty: Difficulty) => readonly ILeaderboardEntry[];
  readonly clearLeaderboard: (difficulty: Difficulty) => void;
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
  readonly #help: HelpDialog;
  readonly #menu: MenuDialog;
  readonly #root: HTMLElement;
  readonly #actions: ActionsView;
  readonly #handlers: IGameScreenHandlers;
  #difficulty: Difficulty = DEFAULT_DIFFICULTY;
  #shakenBrewId: number | undefined;

  constructor(root: HTMLElement, handlers: IGameScreenHandlers) {
    this.#root = root;
    this.#handlers = handlers;
    this.#hud = new HudView();
    this.#shelf = new ShelfView(handlers.onAddIngredient);
    this.#cauldron = new CauldronView(handlers.onAddIngredient);
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
        this.#leaderboard.open(this.#difficulty);
      },
      canEnterLeaderboard: handlers.canEnterLeaderboard,
      onSaveScore: handlers.onSaveScore,
    });
    const startGame = (): void => {
      handlers.onStart();
      // the Start Game button hides itself, so the focus moves on to the shelf
      this.#shelf.focusFirstCard();
    };

    this.#help = new HelpDialog();
    this.#menu = new MenuDialog({
      onSelectDifficulty: handlers.onSelectDifficulty,
      onStart: startGame,
      onContinue: handlers.onContinue,
      onShowLeaderboard: (): void => {
        this.#leaderboard.open(this.#difficulty);
      },
    });
    this.#actions = new ActionsView({
      onStart: startGame,
      onContinue: handlers.onContinue,
      onBrew: (): void => {
        handlers.onBrew();
        // Brew turns disabled with an empty cauldron, so the focus goes back to the shelf
        this.#shelf.focusFirstCard();
        // on a phone the result plays far above the shelf, so the page scrolls up to it
        this.#cauldron.bringIntoView();
      },
      onPourOut: (): void => {
        handlers.onPourOut();
        // Pour Out turns disabled with an empty cauldron, so the focus goes back to the shelf
        this.#shelf.focusFirstCard();
      },
      onPause: handlers.onPause,
      onShowHelp: (): void => {
        this.#help.open();
      },
      onShowMenu: (): void => {
        this.#menu.open();
      },
      onShowLeaderboard: (): void => {
        this.#leaderboard.open(this.#difficulty);
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
      this.#help.element,
      this.#menu.element,
      this.#leaderboard.element,
      this.#confirm.element,
    );
  }

  /**
   * A failed brew shakes the play field for a moment. The class name alternates, so a
   * second failure in a row shakes again; a new game drops it.
   */
  #renderShake(state: IGameState): void {
    const { lastBrew }: IGameState = state;

    if (lastBrew?.id === this.#shakenBrewId) {
      return;
    }

    const isFailure: boolean = lastBrew?.isSuccess === false;
    const isEven: boolean = (lastBrew?.id ?? 0) % 2 === 0;

    this.#shakenBrewId = lastBrew?.id;
    this.#root.classList.toggle('game--shake-even', isFailure && isEven);
    this.#root.classList.toggle('game--shake-odd', isFailure && !isEven);
  }

  render(state: IGameState): void {
    // Continue Game is offered on the start screen while a valid unfinished game is saved
    const canContinue: boolean = state.status === 'menu' && this.#handlers.canContinue();

    this.#difficulty = state.difficulty;
    this.#hud.render(state);
    this.#shelf.render(state);
    this.#cauldron.render(state);
    this.#recipe.render(state);
    this.#bars.render(state);
    this.#actions.render(state, canContinue);
    this.#gameOver.render(state);
    this.#pause.render(state);
    this.#menu.render(state, canContinue);
    this.#renderShake(state);
    // the paused field is blurred, so the player cannot plan the next moves
    this.#root.classList.toggle('game--paused', state.status === 'paused');
  }
}
