import { DEFAULT_DIFFICULTY, DIFFICULTY_SETTINGS } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type {
  Difficulty,
  GameOverReason,
  IBrewResult,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IngredientId,
  IRecipe,
  RandomSource,
} from '../types/game';
import { isBrewSuccessful } from './brew-check';
import { calculateCauldron } from './calculate-cauldron';
import { pickRecipe } from './recipe-generator';
import { createStock, getStock, isShelfEmpty, takeFromStock } from './stock';
import { addTimeBonus, getRemainingTime, secondsToMilliseconds, toDisplaySeconds } from './timer';

export function getSettings(state: IGameState): IDifficultySettings {
  return DIFFICULTY_SETTINGS[state.difficulty];
}

/**
 * The first `shelfSize` ingredients of the ordered catalogue.
 */
export function getShelfIngredients(difficulty: Difficulty): readonly IIngredient[] {
  return INGREDIENTS.slice(0, DIFFICULTY_SETTINGS[difficulty].shelfSize);
}

/**
 * The start screen: an empty shelf and cauldron, score 0 and no recipe yet. The
 * time and the lives show what the next game starts with.
 */
export function createMenuState(difficulty: Difficulty = DEFAULT_DIFFICULTY): IGameState {
  return {
    status: 'menu',
    difficulty,
    score: 0,
    lives: DIFFICULTY_SETTINGS[difficulty].lives,
    timeLeft: secondsToMilliseconds(DIFFICULTY_SETTINGS[difficulty].startTimeSeconds),
    endTime: undefined,
    gameOverReason: undefined,
    activeRecipe: undefined,
    shelfStock: {},
    cauldronIngredients: [],
    lastBrew: undefined,
  };
}

/**
 * A new run: a fresh random stock, the lives and time of the difficulty and a
 * random recipe. The countdown starts at `now`.
 */
export function startGame(
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  random: RandomSource = Math.random,
  now: number = Date.now(),
): IGameState {
  const timeLeft: number = secondsToMilliseconds(DIFFICULTY_SETTINGS[difficulty].startTimeSeconds);

  return {
    status: 'playing',
    difficulty,
    score: 0,
    lives: DIFFICULTY_SETTINGS[difficulty].lives,
    timeLeft,
    endTime: now + timeLeft,
    gameOverReason: undefined,
    activeRecipe: pickRecipe(difficulty, random),
    shelfStock: createStock(getShelfIngredients(difficulty), random),
    cauldronIngredients: [],
    lastBrew: undefined,
  };
}

export function isCauldronFull(state: IGameState): boolean {
  return state.cauldronIngredients.length >= getSettings(state).maxCauldronIngredients;
}

export function canAddIngredient(state: IGameState, id: IngredientId): boolean {
  return state.status === 'playing' && !isCauldronFull(state) && getStock(state.shelfStock, id) > 0;
}

/**
 * Moves one portion from the shelf to the end of the cauldron. Returns the same
 * state when the move is not allowed, so a blocked click changes nothing.
 */
export function addIngredient(state: IGameState, id: IngredientId): IGameState {
  const ingredient: IIngredient | undefined = INGREDIENTS.find(
    (item: IIngredient): boolean => item.id === id,
  );

  return ingredient && canAddIngredient(state, id)
    ? {
        ...state,
        shelfStock: takeFromStock(state.shelfStock, id),
        cauldronIngredients: [...state.cauldronIngredients, ingredient],
      }
    : state;
}

/**
 * Empties the cauldron. The ingredients are spent: nothing goes back to the shelf.
 */
export function clearCauldron(state: IGameState): IGameState {
  return { ...state, cauldronIngredients: [] };
}

export function canBrew(state: IGameState): boolean {
  return (
    state.status === 'playing' &&
    state.activeRecipe !== undefined &&
    state.cauldronIngredients.length > 0
  );
}

/**
 * Why a running game has to end, if it has to: no lives, no time, or nothing
 * left on the shelf and in the cauldron.
 */
export function getGameOverReason(state: IGameState): GameOverReason | undefined {
  if (state.lives <= 0) {
    return 'lives';
  }

  if (state.timeLeft <= 0) {
    return 'time';
  }

  return isShelfEmpty(state.shelfStock) && state.cauldronIngredients.length === 0
    ? 'ingredients'
    : undefined;
}

/**
 * Turns a running game into a finished one when one of the end conditions is met.
 */
export function endGameIfOver(state: IGameState): IGameState {
  const reason: GameOverReason | undefined = getGameOverReason(state);

  return reason
    ? { ...state, status: 'game-over', endTime: undefined, gameOverReason: reason }
    : state;
}

/**
 * Follows the clock: updates the time left once per shown second and ends the
 * game at 00:00. Returns the same state between two seconds, so nothing redraws.
 */
export function tick(state: IGameState, now: number = Date.now()): IGameState {
  if (state.status !== 'playing' || state.endTime === undefined) {
    return state;
  }

  const timeLeft: number = getRemainingTime(state.endTime, now);

  if (timeLeft === 0) {
    return endGameIfOver({ ...state, timeLeft });
  }

  return toDisplaySeconds(timeLeft) === toDisplaySeconds(state.timeLeft)
    ? state
    : { ...state, timeLeft };
}

/**
 * Stops the countdown: the time left is frozen and the game ignores every action
 * until it resumes.
 */
export function pauseGame(state: IGameState, now: number = Date.now()): IGameState {
  if (state.status !== 'playing' || state.endTime === undefined) {
    return state;
  }

  const timeLeft: number = getRemainingTime(state.endTime, now);

  return timeLeft === 0
    ? endGameIfOver({ ...state, timeLeft })
    : { ...state, status: 'paused', timeLeft, endTime: undefined };
}

/**
 * Continues the same game: the countdown restarts from the frozen time left.
 */
export function resumeGame(state: IGameState, now: number = Date.now()): IGameState {
  return state.status === 'paused'
    ? { ...state, status: 'playing', endTime: now + state.timeLeft }
    : state;
}

/**
 * Checks the mix against the recipe with the tolerance of the difficulty. A good
 * potion adds score and time and brings a new recipe; a wrong one costs a life.
 * Both empty the cauldron, and either can end the game.
 */
export function brew(
  state: IGameState,
  random: RandomSource = Math.random,
  now: number = Date.now(),
): IGameState {
  const recipe: IRecipe | undefined = state.activeRecipe;

  if (!recipe || !canBrew(state)) {
    return state;
  }

  const settings: IDifficultySettings = getSettings(state);
  const timeLeft: number =
    state.endTime === undefined ? state.timeLeft : getRemainingTime(state.endTime, now);

  if (timeLeft === 0) {
    return endGameIfOver({ ...state, timeLeft });
  }

  const isSuccess: boolean = isBrewSuccessful(
    calculateCauldron(state.cauldronIngredients),
    recipe,
    settings.tolerance,
  );
  const lastBrew: IBrewResult = {
    id: (state.lastBrew?.id ?? 0) + 1,
    isSuccess,
    recipeName: recipe.name,
  };
  const cleared: IGameState = clearCauldron(state);
  const bonusTime: number = addTimeBonus(
    timeLeft,
    settings.timeBonusSeconds,
    settings.startTimeSeconds,
  );

  return endGameIfOver(
    isSuccess
      ? {
          ...cleared,
          score: state.score + settings.scorePerBrew,
          timeLeft: bonusTime,
          endTime: now + bonusTime,
          activeRecipe: pickRecipe(state.difficulty, random),
          lastBrew,
        }
      : { ...cleared, lives: Math.max(state.lives - 1, 0), timeLeft, lastBrew },
  );
}
