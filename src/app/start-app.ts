import { createMenuState } from '../logic/game-rules';
import { GameStore } from '../state/game-store';
import type { IGameState, IngredientId } from '../types/game';
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
  });

  store.subscribe((state: IGameState): void => {
    screen.render(state);
  });
}
