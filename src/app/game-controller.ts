import { DEFAULT_DIFFICULTY } from '../data/difficulty';
import { addIngredient, brew, startGame } from '../logic/game-rules';
import type { GameStore } from '../state/game-store';
import type { IngredientId, RandomSource } from '../types/game';

/**
 * Turns the player's actions into new states through the game rules.
 */
export class GameController {
  readonly #store: GameStore;
  readonly #random: RandomSource;

  constructor(store: GameStore, random: RandomSource = Math.random) {
    this.#store = store;
    this.#random = random;
  }

  startGame(): void {
    this.#store.setState(startGame(DEFAULT_DIFFICULTY, this.#random));
  }

  addIngredient(id: IngredientId): void {
    this.#store.setState(addIngredient(this.#store.state, id));
  }

  brew(): void {
    this.#store.setState(brew(this.#store.state, this.#random));
  }
}
