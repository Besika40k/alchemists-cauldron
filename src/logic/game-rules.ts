import { DEFAULT_DIFFICULTY, DIFFICULTY_SETTINGS } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type {
  Difficulty,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IngredientId,
  RandomSource,
} from '../types/game';
import { pickRecipe } from './recipe-generator';
import { createStock, getStock, takeFromStock } from './stock';

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
 * The start screen: an empty shelf and cauldron, score 0, no lives and no recipe yet.
 */
export function createMenuState(difficulty: Difficulty = DEFAULT_DIFFICULTY): IGameState {
  return {
    status: 'menu',
    difficulty,
    score: 0,
    lives: 0,
    activeRecipe: undefined,
    shelfStock: {},
    cauldronIngredients: [],
    lastBrew: undefined,
  };
}

/**
 * A new run: a fresh random stock, the lives of the difficulty and a random recipe.
 */
export function startGame(
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  random: RandomSource = Math.random,
): IGameState {
  return {
    status: 'playing',
    difficulty,
    score: 0,
    lives: DIFFICULTY_SETTINGS[difficulty].lives,
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
