import type { ICauldronValues, IIngredient, IngredientId, IReaction } from '../types/game';

type ReactionTest = (ingredients: readonly IIngredient[]) => boolean;

function total(ingredients: readonly IIngredient[], parameter: keyof ICauldronValues): number {
  let sum: number = 0;

  for (const ingredient of ingredients) {
    sum += ingredient[parameter];
  }

  return sum;
}

/**
 * Active while every one of these ingredients is in the cauldron.
 */
function contains(...ids: IngredientId[]): ReactionTest {
  return (ingredients: readonly IIngredient[]): boolean =>
    ids.every((id: IngredientId): boolean =>
      ingredients.some((ingredient: IIngredient): boolean => ingredient.id === id),
    );
}

/**
 * Active while the plain sum of a value is at least (or at most) the limit.
 */
function totalAtLeast(parameter: keyof ICauldronValues, limit: number): ReactionTest {
  return (ingredients: readonly IIngredient[]): boolean => total(ingredients, parameter) >= limit;
}

function totalAtMost(parameter: keyof ICauldronValues, limit: number): ReactionTest {
  return (ingredients: readonly IIngredient[]): boolean => total(ingredients, parameter) <= limit;
}

function both(isFirstMet: ReactionTest, isSecondMet: ReactionTest): ReactionTest {
  return (ingredients: readonly IIngredient[]): boolean =>
    isFirstMet(ingredients) && isSecondMet(ingredients);
}

/**
 * A value changed by a percentage and rounded to a whole number: +50% of 40 is 60.
 */
function changeBy(value: number, percent: number): number {
  return Math.round((value * (100 + percent)) / 100);
}

function keepValues(values: ICauldronValues): ICauldronValues {
  return values;
}

/**
 * The full reaction table of the task, in its order. A difficulty uses only its own
 * subset (`DIFFICULTY_REACTIONS`); the stat tests read the plain ingredient sums.
 */
export const REACTIONS: readonly IReaction[] = [
  {
    id: 'bubbling',
    name: 'Bubbling',
    trigger: 'Fairy Dust + Caustic Acid',
    effect: 'Magic Power +50%, −10 s once',
    isActive: contains('fairy-dust', 'caustic-acid'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: changeBy(values.magicPower, 50),
    }),
    timePenaltySeconds: 10,
    isExplosive: false,
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    trigger: 'Phoenix Feather + Essence of the Void',
    effect: 'It explodes: you lose a life and the cauldron empties',
    isActive: contains('phoenix-feather', 'essence-of-the-void'),
    apply: keepValues,
    timePenaltySeconds: 0,
    isExplosive: true,
  },
  {
    id: 'solar-frost',
    name: 'Solar Frost',
    trigger: 'Dragon Tears + Frost Lotus',
    effect: 'Temperature set to 0, Density +20%',
    isActive: contains('dragon-tears', 'frost-lotus'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: 0,
      density: changeBy(values.density, 20),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'rooted-steam',
    name: 'Rooted Steam',
    trigger: 'Mandrake Root + Toad Slime',
    effect: 'Density +25%, Magic Power −10%',
    isActive: contains('mandrake-root', 'toad-slime'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: changeBy(values.density, 25),
      magicPower: changeBy(values.magicPower, -10),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'ashen-bloom',
    name: 'Ashen Bloom',
    trigger: 'Phoenix Feather + Fairy Dust',
    effect: 'Temperature +10, Magic Power +25%',
    isActive: contains('phoenix-feather', 'fairy-dust'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 10,
      magicPower: changeBy(values.magicPower, 25),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    trigger: 'one ingredient with Temperature above +15 and another below −15',
    effect: 'Temperature set to 0, Density doubled',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      ingredients.some((ingredient: IIngredient): boolean => ingredient.temperature > 15) &&
      ingredients.some((ingredient: IIngredient): boolean => ingredient.temperature < -15),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: 0,
      density: values.density * 2,
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    trigger: 'total Density 70 or more',
    effect: 'Density set to 70, Magic Power +10%',
    isActive: totalAtLeast('density', 70),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: 70,
      magicPower: changeBy(values.magicPower, 10),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'magma-flux',
    name: 'Magma Flux',
    trigger: 'total Temperature 60 or more',
    effect: 'Magic Power +20%, Density −10%',
    isActive: totalAtLeast('temperature', 60),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: changeBy(values.density, -10),
      magicPower: changeBy(values.magicPower, 20),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'deep-freeze',
    name: 'Deep Freeze',
    trigger: 'total Temperature −20 or less',
    effect: 'Density +15%, Magic Power −15%',
    isActive: totalAtMost('temperature', -20),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: changeBy(values.density, 15),
      magicPower: changeBy(values.magicPower, -15),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'arcane-saturation',
    name: 'Arcane Saturation',
    trigger: 'total Magic Power 80 or more',
    effect: 'Magic Power set to 80, Temperature +5',
    isActive: totalAtLeast('magicPower', 80),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 5,
      magicPower: 80,
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'steam-burst',
    name: 'Steam Burst',
    trigger: 'Dragon Tears + Caustic Acid with total Temperature 35 or more',
    effect: 'Temperature +10, −5 s once',
    isActive: both(contains('dragon-tears', 'caustic-acid'), totalAtLeast('temperature', 35)),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 10,
    }),
    timePenaltySeconds: 5,
    isExplosive: false,
  },
  {
    id: 'black-ice',
    name: 'Black Ice',
    trigger: 'Frost Lotus + Essence of the Void with total Density 0 or less',
    effect: 'Temperature −10, Magic Power +20%',
    isActive: both(contains('frost-lotus', 'essence-of-the-void'), totalAtMost('density', 0)),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature - 10,
      magicPower: changeBy(values.magicPower, 20),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'heavy-spark',
    name: 'Heavy Spark',
    trigger: 'Fairy Dust + Toad Slime with total Density 40 or more',
    effect: 'Density +20%, Magic Power +10%',
    isActive: both(contains('fairy-dust', 'toad-slime'), totalAtLeast('density', 40)),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: changeBy(values.density, 20),
      magicPower: changeBy(values.magicPower, 10),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'burning-root',
    name: 'Burning Root',
    trigger: 'Mandrake Root + Phoenix Feather with total Temperature 40 or more',
    effect: 'Temperature +15, Density −10%',
    isActive: both(contains('mandrake-root', 'phoenix-feather'), totalAtLeast('temperature', 40)),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 15,
      density: changeBy(values.density, -10),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
  {
    id: 'void-resonance',
    name: 'Void Resonance',
    trigger: 'Essence of the Void + Dragon Tears with total Magic Power 50 or more',
    effect: 'Magic Power +30%, Temperature −5',
    isActive: both(contains('essence-of-the-void', 'dragon-tears'), totalAtLeast('magicPower', 50)),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature - 5,
      magicPower: changeBy(values.magicPower, 30),
    }),
    timePenaltySeconds: 0,
    isExplosive: false,
  },
];
