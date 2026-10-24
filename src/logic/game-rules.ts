import { DEFAULT_DIFFICULTY, DIFFICULTY_SETTINGS } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type {
  Difficulty,
  GameOverReason,
  IBrewResult,
  ICauldronValues,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IngredientId,
  IReaction,
  IReactionEvent,
  IRecipe,
  RandomSource,
  ReactionId,
} from '../types/game';
import { isBrewSuccessful } from './brew-check';
import { calculateCauldron } from './calculate-cauldron';
import { findStartedReactions, getReactions } from './reactions';
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
    lastReaction: undefined,
  };
}

/**
 * Picks the difficulty of the next game. Only the start screen can change it; a
 * running, paused or finished game keeps its own.
 */
export function selectDifficulty(state: IGameState, difficulty: Difficulty): IGameState {
  return state.status === 'menu' && state.difficulty !== difficulty
    ? createMenuState(difficulty)
    : state;
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
    lastReaction: undefined,
  };
}

export function isCauldronFull(state: IGameState): boolean {
  return state.cauldronIngredients.length >= getSettings(state).maxCauldronIngredients;
}

export function canAddIngredient(state: IGameState, id: IngredientId): boolean {
  return state.status === 'playing' && !isCauldronFull(state) && getStock(state.shelfStock, id) > 0;
}

/**
 * The values the bars show and Brew checks: the ingredient sums changed by the active
 * reactions of the difficulty.
 */
export function getCauldronValues(state: IGameState): ICauldronValues {
  return calculateCauldron(state.cauldronIngredients, getReactions(state.difficulty));
}

/**
 * The one-time effects of the reactions that just started: the lost seconds, and for
 * an explosion a lost life and an empty cauldron. Any of them can end the game.
 */
function applyStartedReactions(
  state: IGameState,
  reactions: readonly IReaction[],
  now: number,
): IGameState {
  let penaltySeconds: number = 0;

  for (const reaction of reactions) {
    penaltySeconds += reaction.timePenaltySeconds;
  }

  const penalty: number = secondsToMilliseconds(penaltySeconds);
  const endTime: number | undefined =
    state.endTime === undefined ? undefined : state.endTime - penalty;
  const isExplosive: boolean = reactions.some(
    (reaction: IReaction): boolean => reaction.isExplosive,
  );
  const lastReaction: IReactionEvent = {
    id: (state.lastReaction?.id ?? 0) + 1,
    reactionIds: reactions.map((reaction: IReaction): ReactionId => reaction.id),
  };

  return endGameIfOver({
    ...state,
    endTime,
    timeLeft:
      endTime === undefined
        ? Math.max(state.timeLeft - penalty, 0)
        : getRemainingTime(endTime, now),
    lives: isExplosive ? Math.max(state.lives - 1, 0) : state.lives,
    cauldronIngredients: isExplosive ? [] : state.cauldronIngredients,
    lastReaction,
  });
}

/**
 * Moves one portion from the shelf to the end of the cauldron. Returns the same
 * state when the move is not allowed, so a blocked click changes nothing. A reaction
 * that starts with this ingredient fires its one-time effects; one that was already
 * active does not fire again.
 */
export function addIngredient(
  state: IGameState,
  id: IngredientId,
  now: number = Date.now(),
): IGameState {
  const ingredient: IIngredient | undefined = INGREDIENTS.find(
    (item: IIngredient): boolean => item.id === id,
  );

  if (!ingredient || !canAddIngredient(state, id)) {
    return state;
  }

  const cauldronIngredients: readonly IIngredient[] = [...state.cauldronIngredients, ingredient];
  const added: IGameState = {
    ...state,
    shelfStock: takeFromStock(state.shelfStock, id),
    cauldronIngredients,
  };
  const started: readonly IReaction[] = findStartedReactions(
    state.cauldronIngredients,
    cauldronIngredients,
    getReactions(state.difficulty),
  );

  return started.length > 0 ? applyStartedReactions(added, started, now) : added;
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

  const isSuccess: boolean = isBrewSuccessful(getCauldronValues(state), recipe, settings.tolerance);
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
