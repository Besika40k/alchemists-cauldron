import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/difficulty';
import { RECIPES } from '../data/recipes';
import type {
  Difficulty,
  IDifficultySettings,
  IGameSave,
  IGameState,
  IIngredient,
  IngredientId,
  IRecipe,
  ShelfStock,
} from '../types/game';
import { getGameOverReason, getShelfIngredients } from './game-rules';
import { MAX_STOCK } from './stock';
import { getRemainingTime, secondsToMilliseconds } from './timer';

type SavedData = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is SavedData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWholeNumber(value: unknown, min: number, max: number): value is number {
  return Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max;
}

function readId(value: unknown): unknown {
  return isRecord(value) ? value['id'] : undefined;
}

/**
 * The fields a reload needs to continue the game. The start screen and a finished
 * game have nothing to save.
 */
export function createGameSave(state: IGameState, now: number = Date.now()): IGameSave | undefined {
  const { status, activeRecipe }: IGameState = state;

  return activeRecipe && (status === 'playing' || status === 'paused')
    ? {
        difficulty: state.difficulty,
        status,
        score: state.score,
        // a running clock is read at the moment of saving, not at the last shown second
        timeLeft:
          state.endTime === undefined ? state.timeLeft : getRemainingTime(state.endTime, now),
        lives: state.lives,
        activeRecipe,
        cauldronIngredients: state.cauldronIngredients,
        shelfStock: state.shelfStock,
      }
    : undefined;
}

function findDifficulty(value: unknown): Difficulty | undefined {
  return DIFFICULTIES.find((difficulty: Difficulty): boolean => difficulty === value);
}

/**
 * The recipe of the table with the saved id, so edited ranges never reach the game.
 */
function findRecipe(value: unknown, difficulty: Difficulty): IRecipe | undefined {
  const id: unknown = readId(value);

  return RECIPES.find(
    (recipe: IRecipe): boolean => recipe.id === id && recipe.difficulty === difficulty,
  );
}

/**
 * The saved stock must list exactly the shelf of the difficulty, each with 0 to 15 portions.
 */
function readStock(value: unknown, shelf: readonly IIngredient[]): ShelfStock | undefined {
  if (!isRecord(value) || Object.keys(value).length !== shelf.length) {
    return undefined;
  }

  const stock: Partial<Record<IngredientId, number>> = {};

  for (const ingredient of shelf) {
    const portions: unknown = value[ingredient.id];

    if (!isWholeNumber(portions, 0, MAX_STOCK)) {
      return undefined;
    }

    stock[ingredient.id] = portions;
  }

  return stock;
}

/**
 * The saved cauldron, in its order, with the ingredients of the catalogue.
 */
function readCauldron(
  value: unknown,
  shelf: readonly IIngredient[],
  settings: IDifficultySettings,
): readonly IIngredient[] | undefined {
  if (!Array.isArray(value) || value.length > settings.maxCauldronIngredients) {
    return undefined;
  }

  const ingredients: IIngredient[] = [];

  for (const item of value) {
    const id: unknown = readId(item);
    const ingredient: IIngredient | undefined = shelf.find(
      (shelfIngredient: IIngredient): boolean => shelfIngredient.id === id,
    );

    if (!ingredient) {
      return undefined;
    }

    ingredients.push(ingredient);
  }

  return ingredients;
}

/**
 * Checks loaded data against the game's own tables and builds the saved game from
 * it, always paused. Anything broken, edited or already finished gives undefined.
 */
export function restoreGame(data: unknown): IGameState | undefined {
  const difficulty: Difficulty | undefined = isRecord(data)
    ? findDifficulty(data['difficulty'])
    : undefined;

  if (
    !difficulty ||
    !isRecord(data) ||
    (data['status'] !== 'playing' && data['status'] !== 'paused')
  ) {
    return undefined;
  }

  const settings: IDifficultySettings = DIFFICULTY_SETTINGS[difficulty];
  const shelf: readonly IIngredient[] = getShelfIngredients(difficulty);
  const activeRecipe: IRecipe | undefined = findRecipe(data['activeRecipe'], difficulty);
  const shelfStock: ShelfStock | undefined = readStock(data['shelfStock'], shelf);
  const cauldronIngredients: readonly IIngredient[] | undefined = readCauldron(
    data['cauldronIngredients'],
    shelf,
    settings,
  );
  const score: unknown = data['score'];
  const lives: unknown = data['lives'];
  const timeLeft: unknown = data['timeLeft'];

  if (
    !activeRecipe ||
    !shelfStock ||
    !cauldronIngredients ||
    !isWholeNumber(score, 0, Number.MAX_SAFE_INTEGER) ||
    !isWholeNumber(lives, 1, settings.lives) ||
    !isWholeNumber(timeLeft, 1, secondsToMilliseconds(settings.startTimeSeconds))
  ) {
    return undefined;
  }

  const savedGame: IGameState = {
    status: 'paused',
    difficulty,
    score,
    lives,
    timeLeft,
    endTime: undefined,
    gameOverReason: undefined,
    activeRecipe,
    shelfStock,
    cauldronIngredients,
    lastBrew: undefined,
  };

  // a game whose shelf and cauldron are both empty is already over
  return getGameOverReason(savedGame) === undefined ? savedGame : undefined;
}

/**
 * True when the data is an unfinished game that can be continued.
 */
export function isValidSave(data: unknown): boolean {
  return restoreGame(data) !== undefined;
}
