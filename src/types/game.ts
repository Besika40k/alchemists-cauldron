export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over';

export type GameOverReason = 'time' | 'lives' | 'ingredients';

export type IngredientId =
  | 'dragon-tears'
  | 'fairy-dust'
  | 'frost-lotus'
  | 'mandrake-root'
  | 'caustic-acid'
  | 'essence-of-the-void'
  | 'phoenix-feather'
  | 'toad-slime';

export interface IIngredient extends ICauldronValues {
  readonly id: IngredientId;
  readonly name: string;
}

/**
 * The three values every ingredient adds to the cauldron.
 */
export interface ICauldronValues {
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

export type ParameterName = keyof ICauldronValues;

export interface IRecipeRange {
  readonly min: number;
  readonly max: number;
}

export interface IRecipe {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly temperature: IRecipeRange;
  readonly density: IRecipeRange;
  readonly magicPower: IRecipeRange;
}

/**
 * Portions left on the shelf for every ingredient of the current game.
 */
export type ShelfStock = Readonly<Partial<Record<IngredientId, number>>>;

export interface IDifficultySettings {
  readonly shelfSize: number;
  readonly maxCauldronIngredients: number;
  readonly startTimeSeconds: number;
  readonly tolerance: number;
  readonly lives: number;
  readonly scorePerBrew: number;
  readonly timeBonusSeconds: number;
  readonly reactionCount: number;
}

export interface IBrewResult {
  /**
   * Grows with every brew, so the screen can tell two results in a row apart.
   */
  readonly id: number;
  readonly isSuccess: boolean;
  readonly recipeName: string;
}

export interface IGameState {
  readonly status: GameStatus;
  readonly difficulty: Difficulty;
  readonly score: number;
  readonly lives: number;
  /**
   * Milliseconds left. While the game runs, `endTime` is the source of truth and
   * this value follows it once per second.
   */
  readonly timeLeft: number;
  /**
   * The `Date.now()` timestamp when the time runs out; set only while playing.
   */
  readonly endTime: number | undefined;
  readonly gameOverReason: GameOverReason | undefined;
  readonly activeRecipe: IRecipe | undefined;
  readonly shelfStock: ShelfStock;
  readonly cauldronIngredients: readonly IIngredient[];
  readonly lastBrew: IBrewResult | undefined;
}

export interface ILeaderboardEntry {
  readonly name: string;
  readonly score: number;
  /**
   * Every difficulty keeps its own Top-10 list.
   */
  readonly difficulty: Difficulty;
  /**
   * When the result was saved, a `Date.now()` timestamp.
   */
  readonly date: number;
}

/**
 * Returns a number from 0 (inclusive) to 1 (exclusive), like Math.random.
 */
export type RandomSource = () => number;

/**
 * Returns the current time in milliseconds, like Date.now.
 */
export type Clock = () => number;
