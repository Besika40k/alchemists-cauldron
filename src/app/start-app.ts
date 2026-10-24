import { createMenuState } from '../logic/game-rules';
import { GameStore } from '../state/game-store';
import type { Difficulty, IGameState, IngredientId } from '../types/game';
import { GameScreen } from '../ui/game-screen';
import { GameController } from './game-controller';

/**
 * Connects the store, the controller and the screen, and shows the start screen.
 */
export function startApp(root: HTMLElement): void {
  const store: GameStore = new GameStore(createMenuState());
  const controller: GameController = new GameController(store);
  const screen: GameScreen = new GameScreen(root, {
    onStart: (): void => {
      controller.startGame();
    },
    onContinue: (): void => {
      controller.continueGame();
    },
    canContinue: (): boolean => controller.canContinue(),
    onAddIngredient: (id: IngredientId): void => {
      controller.addIngredient(id);
    },
    onBrew: (): void => {
      controller.brew();
    },
    onPlayAgain: (): void => {
      controller.startGame();
    },
    onShowMenu: (): void => {
      controller.showMenu();
    },
    onPourOut: (): void => {
      controller.pourOut();
    },
    onPause: (): void => {
      controller.pause();
    },
    onResume: (): void => {
      controller.resume();
    },
    onSelectDifficulty: (difficulty: Difficulty): void => {
      controller.selectDifficulty(difficulty);
    },
    getLeaderboard: (difficulty: Difficulty) => controller.getLeaderboard(difficulty),
    clearLeaderboard: (difficulty: Difficulty): void => {
      controller.clearLeaderboard(difficulty);
    },
    canEnterLeaderboard: (): boolean => controller.canEnterLeaderboard(),
    onSaveScore: (name: string): number => controller.saveScore(name),
  });

  // a hidden tab pauses the game, so no time runs out unseen
  document.addEventListener('visibilitychange', (): void => {
    if (document.hidden) {
      controller.pause();
    }
  });

  store.subscribe((state: IGameState): void => {
    screen.render(state);
  });
}
