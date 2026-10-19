import { DEFAULT_DIFFICULTY, DIFFICULTY_SETTINGS } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type {
  Difficulty,
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
import { createStock, getStock, takeFromStock } from './stock';
import { secondsToMilliseconds } from './timer';

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
 * The start screen: an empty shelf and cauldron, score and time 0, no lives and no
 * recipe yet.
 */
export function createMenuState(difficulty: Difficulty = DEFAULT_DIFFICULTY): IGameState {
  return {
    status: 'menu',
    difficulty,
    score: 0,
    lives: 0,
    timeLeft: 0,
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
 * Checks the mix against the recipe with the tolerance of the difficulty. A good
 * potion adds score and brings a new recipe; a wrong one costs a life. Both empty
 * the cauldron.
 */
export function brew(state: IGameState, random: RandomSource = Math.random): IGameState {
  const recipe: IRecipe | undefined = state.activeRecipe;

  if (!recipe || !canBrew(state)) {
    return state;
  }

  const settings: IDifficultySettings = getSettings(state);
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

  return isSuccess
    ? {
        ...cleared,
        score: state.score + settings.scorePerBrew,
        activeRecipe: pickRecipe(state.difficulty, random),
        lastBrew,
      }
    : { ...cleared, lives: Math.max(state.lives - 1, 0), lastBrew };
}
