import {
  addIngredient,
  brew,
  createMenuState,
  pauseGame,
  resumeGame,
  selectDifficulty,
  startGame,
  tick,
} from '../logic/game-rules';
import { createGameSave } from '../logic/game-save';
import {
  type ILeaderboardInsert,
  insertEntry,
  isLeaderboardScore,
  isValidPlayerName,
  normalizePlayerName,
} from '../logic/leaderboard';
import type { GameStore } from '../state/game-store';
import { clearSave, saveGame } from '../storage/game-save-storage';
import { clearLeaderboard, loadLeaderboard, saveLeaderboard } from '../storage/leaderboard-storage';
import type {
  Clock,
  Difficulty,
  IGameSave,
  IGameState,
  ILeaderboardEntry,
  IngredientId,
  RandomSource,
} from '../types/game';

/**
 * Turns the player's actions into new states through the game rules, keeps the
 * countdown running while a game is on and saves the unfinished game.
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
    store.subscribe((state: IGameState): void => {
      this.#saveProgress(state);
    });
  }

  /**
   * Keeps the save in step with the game: every change of a running or paused game
   * is saved, and a finished game deletes it, so it is never offered again.
   */
  #saveProgress(state: IGameState): void {
    const save: IGameSave | undefined = createGameSave(state, this.#clock());

    if (save) {
      saveGame(save);
    } else if (state.status === 'game-over') {
      clearSave();
    }
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

  /**
   * A new game on the difficulty chosen on the start screen; Play again keeps it.
   */
  startGame(): void {
    this.#store.setState(startGame(this.#store.state.difficulty, this.#random, this.#clock()));
    this.#runTimer();
  }

  selectDifficulty(difficulty: Difficulty): void {
    this.#store.setState(selectDifficulty(this.#store.state, difficulty));
  }

  addIngredient(id: IngredientId): void {
    this.#store.setState(addIngredient(this.#store.state, id));
  }

  brew(): void {
    this.#store.setState(brew(this.#store.state, this.#random, this.#clock()));
  }

  pause(): void {
    this.#store.setState(pauseGame(this.#store.state, this.#clock()));
  }

  resume(): void {
    this.#store.setState(resumeGame(this.#store.state, this.#clock()));
    this.#runTimer();
  }

  /**
   * Leaves the game, running, paused or finished, for the start screen. Exit to Menu
   * gives the game up, so its save is deleted.
   */
  showMenu(): void {
    clearSave();
    this.#store.setState(createMenuState(this.#store.state.difficulty));
  }

  getLeaderboard(difficulty: Difficulty): readonly ILeaderboardEntry[] {
    return loadLeaderboard(difficulty);
  }

  /**
   * True when the finished game's score makes the Top-10 of its difficulty.
   */
  canEnterLeaderboard(): boolean {
    const state: IGameState = this.#store.state;

    return (
      state.status === 'game-over' &&
      isLeaderboardScore(loadLeaderboard(state.difficulty), state.score)
    );
  }

  /**
   * Saves the finished game's score under the name. Returns the place, 1 to 10, or
   * 0 when the name is not valid, the score does not qualify or the storage refused it.
   */
  saveScore(name: string): number {
    if (!isValidPlayerName(name) || !this.canEnterLeaderboard()) {
      return 0;
    }

    const { difficulty, score }: IGameState = this.#store.state;
    const entry: ILeaderboardEntry = {
      name: normalizePlayerName(name),
      score,
      difficulty,
      date: this.#clock(),
    };
    const result: ILeaderboardInsert = insertEntry(loadLeaderboard(difficulty), entry);

    saveLeaderboard(difficulty, result.entries);

    // reading it back tells whether the browser really kept it
    const isKept: boolean = loadLeaderboard(difficulty).some(
      (saved: ILeaderboardEntry): boolean =>
        saved.date === entry.date && saved.name === entry.name && saved.score === entry.score,
    );

    return isKept ? result.rank : 0;
  }

  clearLeaderboard(difficulty: Difficulty): void {
    clearLeaderboard(difficulty);
  }
}
