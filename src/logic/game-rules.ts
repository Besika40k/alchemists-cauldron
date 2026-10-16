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
 * The start screen: an empty shelf and an empty cauldron.
 */
export function createMenuState(difficulty: Difficulty = DEFAULT_DIFFICULTY): IGameState {
  return {
    status: 'menu',
    difficulty,
    shelfStock: {},
    cauldronIngredients: [],
  };
}

/**
 * A new run: the shelf of the difficulty gets a fresh random stock.
 */
export function startGame(
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  random: RandomSource = Math.random,
): IGameState {
  return {
    status: 'playing',
    difficulty,
    shelfStock: createStock(getShelfIngredients(difficulty), random),
    cauldronIngredients: [],
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
