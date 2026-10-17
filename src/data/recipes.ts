import type { Difficulty, IRecipe } from '../types/game';

function recipe(
  difficulty: Difficulty,
  name: string,
  temperature: readonly [number, number],
  density: readonly [number, number],
  magicPower: readonly [number, number],
): IRecipe {
  return {
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    difficulty,
    temperature: { min: temperature[0], max: temperature[1] },
    density: { min: density[0], max: density[1] },
    magicPower: { min: magicPower[0], max: magicPower[1] },
  };
}

/**
 * The 20 recipes of the task README: name, difficulty and the target range of
 * Temperature, Density and Magic Power.
 */
export const RECIPES: readonly IRecipe[] = [
  recipe('easy', 'Moon Mist', [32, 42], [12, 22], [17, 27]),
  recipe('easy', 'Root Bloom', [2, 12], [24, 34], [15, 25]),
  recipe('easy', 'Frost Steam', [2, 12], [7, 17], [19, 29]),
  recipe('easy', 'Quiet Swirl', [-28, -18], [19, 29], [17, 27]),
  recipe('easy', 'Bright Dew', [27, 37], [32, 42], [25, 35]),
  recipe('easy', 'Snow Dust', [-16, -6], [28, 38], [29, 39]),
  recipe('medium', 'Acid Spark', [17, 27], [18, 28], [29, 39]),
  recipe('medium', 'Void Ember', [0, 10], [0, 10], [45, 55]),
  recipe('medium', 'Heavy Acid', [0, 10], [29, 39], [25, 35]),
  recipe('medium', 'Frost Acid', [-13, -3], [13, 23], [31, 41]),
  recipe('medium', 'Dusty Void', [-13, -3], [0, 10], [47, 57]),
  recipe('medium', 'Dragon Void', [25, 35], [1, 11], [55, 65]),
  recipe('medium', 'Rooted Night', [-18, -8], [14, 24], [55, 65]),
  recipe('hard', 'Phoenix Pulse', [57, 67], [0, 10], [37, 47]),
  recipe('hard', 'Slime Crown', [-5, 5], [45, 55], [3, 13]),
  recipe('hard', 'Void Flame', [25, 35], [0, 10], [60, 70]),
  recipe('hard', 'Acid Bog', [10, 20], [39, 49], [17, 27]),
  recipe('hard', 'Frozen Ash', [27, 37], [0, 10], [39, 49]),
  recipe('hard', 'Triple Eclipse', [-20, -10], [19, 29], [60, 70]),
  recipe('hard', 'Ember Soup', [62, 72], [24, 34], [37, 47]),
];
