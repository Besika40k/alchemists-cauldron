import { DEFAULT_DIFFICULTY } from '../data/difficulty';
import { addIngredient, brew, createMenuState, startGame, tick } from '../logic/game-rules';
import type { GameStore } from '../state/game-store';
import type { Clock, IGameState, IngredientId, RandomSource } from '../types/game';

/**
 * Turns the player's actions into new states through the game rules, and keeps
 * the countdown running while a game is on.
 */
export class GameController {
  readonly #store: GameStore;
  readonly #random: RandomSource;
  readonly #clock: Clock;
  #frameId: number | undefined;

  constructor(store: GameStore, random: RandomSource = Math.random, clock: Clock = Date.now) {
    this.#store = store;
    this.#random = random;
    this.#clock = clock;
  }

  /**
   * Checks the clock on every animation frame while the game runs. The rules only
   * change the state when the shown second changes or the time is up.
   */
  #runTimer(): void {
    if (this.#frameId !== undefined) {
      return;
    }

    const step = (): void => {
      const state: IGameState = tick(this.#store.state, this.#clock());

      this.#store.setState(state);
      this.#frameId = state.status === 'playing' ? requestAnimationFrame(step) : undefined;
    };

    this.#frameId = requestAnimationFrame(step);
  }

  startGame(): void {
    this.#store.setState(startGame(DEFAULT_DIFFICULTY, this.#random, this.#clock()));
    this.#runTimer();
  }

  addIngredient(id: IngredientId): void {
    this.#store.setState(addIngredient(this.#store.state, id));
  }

  brew(): void {
    this.#store.setState(brew(this.#store.state, this.#random, this.#clock()));
  }

  /**
   * Leaves the finished game for the start screen.
   */
  showMenu(): void {
    this.#store.setState(createMenuState(this.#store.state.difficulty));
  }
}
