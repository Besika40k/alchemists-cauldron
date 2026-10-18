# Alchemist's Cauldron

A browser potion brewing game written in vanilla TypeScript, made for the RS School short
track.

Mix ingredients from the shelf, move the cauldron's three values into the recipe's target
ranges, and brew potions before the time or the lives run out.

## Game goal

Every ingredient changes three cauldron values: **Temperature**, **Density** and
**Magic Power**. The active recipe gives a target range for each of them. Add ingredients
until all three values are inside the ranges, then press **Brew**:

- a correct potion gives score and extra time, and a new recipe appears;
- a wrong mixture costs a life;
- every ingredient has a limited stock, and used ingredients are spent.

The game ends when the time runs out, when no lives are left, or when the shelf and the
cauldron are both empty. The best results go to a Top-10 leaderboard.

## Task set

The game is built in stages. Each stage is a story branch with its own task branches and
pull requests.

| Stage              | What it adds                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| Precondition       | Repository, bundler, TypeScript, linting, formatting, Git hooks and structure   |
| Level 1: Basic     | Shelf and cauldron, parameter bars, recipe and brew check, timer, pause, Top-10 |
| Level 2: Extended  | Difficulty selection, auto-save and Continue Game                               |
| Level 3: Full game | Drag and drop, tooltips, chemical reactions, Pour Out, effects, shortcuts       |

Task description: [Alchemist's Cauldron](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/game-alchemists-cauldron/README.md)

## How to play

1. Press **Start Game**. The shelf fills with the first 6 ingredients of the catalogue, and
   each one gets a random stock from 2 to 15 (the number in the circle). The recipe panel
   shows a random recipe, and you have 3 lives.
2. Click an ingredient, or reach it with <kbd>Tab</kbd> and press <kbd>Enter</kbd> or
   <kbd>Space</kbd>, to put one portion into the cauldron. Its stock drops by 1. The card
   shows the ingredient's Temperature (T), Density (D) and Magic Power (MP).
3. The cauldron holds up to 4 ingredients and keeps the order they went in. The recipe
   panel counts them (**Ingredients: 2 / 4**); at 4 / 4 the counter lights up and the shelf
   ignores new ingredients.
4. Watch the three bars under the cauldron: **Temperature**, **Density** and **Magic Power**
   start at 0 and move with every ingredient. Temperature and Density can go below 0, so
   their 0 line is in the middle. The green band on each bar is the recipe range, the faint
   band around it the tolerance, and a bar glows green while its value is inside the
   recipe range.
5. Press **Brew** (it needs at least one ingredient). Every cauldron value, the sum of the
   added ingredients, must be inside the recipe range widened by the tolerance of ±8. A
   good potion gives 200 score and a new recipe; a wrong mixture costs a life. Either way
   the cauldron empties, and the used ingredients are spent.
6. An ingredient with no stock left becomes an empty, dimmed slot that cannot be used.

## Implemented so far

- [x] Precondition: repository, tooling, structure and deployment
- [x] US 1.1 Ingredient shelf and cauldron
- [x] US 1.2 Cauldron parameter bars
- [x] US 1.3 Recipe and brewing check (its time bonus arrives with the timer of US 1.4)
- [ ] US 1.4 Timer and game over
- [ ] US 1.5 Pause
- [ ] US 1.6 Leaderboard

## Deployment

The game is deployed to GitHub Pages: https://besika40k.github.io/alchemists-cauldron/

A GitHub Actions workflow (`.github/workflows/deploy.yml`) checks the lint and formatting,
builds the game and publishes `dist/` on every push to the current story branch.

## Tech stack

- TypeScript in strict mode, no frameworks and no runtime libraries
- Vite for the development server and the production build
- Plain CSS
- ESLint, Prettier, Husky and commitlint for code quality

## Getting started

Requirements: Node.js 22.13 or newer (ESLint and commitlint need it) and npm.

```bash
npm install
npm run dev
```

## Scripts

| Script                 | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reload              |
| `npm run build`        | Type-checks the code and makes a minified production build |
| `npm run build:dev`    | Makes an unminified build with source maps                 |
| `npm run preview`      | Serves the production build from `dist/`                   |
| `npm run lint`         | Checks the code with ESLint, warnings count as errors      |
| `npm run lint:fix`     | Fixes the ESLint problems that can be fixed automatically  |
| `npm run format`       | Formats every file with Prettier                           |
| `npm run format:check` | Checks the formatting without changing files               |
| `npm run typecheck`    | Type-checks the code without building it                   |

## Project structure

Game rules never touch the DOM, and the UI never decides a rule: the UI reads the state and
calls the logic.

```text
public/          static files copied as they are (favicon)
src/
  main.ts        entry point
  app/           starts the game and connects logic, state, storage and UI
  assets/        icons and other files imported by the code
  data/          fixed game data: ingredients, recipes, difficulty settings, reactions
  logic/         pure game rules: cauldron values, brew check, stock, timer, leaderboard
  state/         the one game state object and its updates
  storage/       safe localStorage access: save, continue and leaderboard
  types/         shared TypeScript types and interfaces
  ui/            DOM rendering and user input
  styles/        CSS
```

## Code quality

- **ESLint** uses the type-aware rules of typescript-eslint and the unicorn plugin. On top of
  them it forbids `console`, `any`, `alert()`, `confirm()`, `setTimeout` and `setInterval`,
  asks for explicit return types, and ignores disable comments in the code.
- **Prettier** formats the code; ESLint leaves formatting to it.
- **Husky** runs two Git hooks:
  - `commit-msg` checks the message with commitlint against the
    [RS School git convention](https://rs.school/docs/git-convention);
  - `pre-push` runs the lint, format and type checks, and a failed check stops the push.
