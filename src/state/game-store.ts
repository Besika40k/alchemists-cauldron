import type { IGameState } from '../types/game';

export type StateListener = (state: IGameState) => void;

/**
 * Holds the one current game state and tells the listeners about every change.
 */
export class GameStore {
  #state: IGameState;
  readonly #listeners: Set<StateListener> = new Set<StateListener>();

  constructor(initialState: IGameState) {
    this.#state = initialState;
  }

  get state(): IGameState {
    return this.#state;
  }

  setState(nextState: IGameState): void {
    if (nextState === this.#state) {
      return;
    }

    this.#state = nextState;

    for (const listener of this.#listeners) {
      listener(nextState);
    }
  }

  /**
   * Calls the listener now and after every change; returns a function that stops it.
   */
  subscribe(listener: StateListener): () => void {
    this.#listeners.add(listener);
    listener(this.#state);

    return (): void => {
      this.#listeners.delete(listener);
    };
  }
}
