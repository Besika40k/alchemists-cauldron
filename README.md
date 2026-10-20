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

1. The start screen shows what a game starts with: 02:30 on the clock and 3 lives. Press
   **Start Game**. The shelf fills with the first 6 ingredients of the catalogue, and each
   one gets a random stock from 2 to 15 (the number on the round sticker). The recipe panel
   shows a random recipe, you have 3 lives, and the clock starts at 02:30. The time bar
   shrinks with it, and under 15 seconds the timer turns red and pulses.
2. Click an ingredient, or reach it with <kbd>Tab</kbd> and press <kbd>Enter</kbd> or
   <kbd>Space</kbd>, to put one portion into the cauldron. Its stock drops by 1. The card
   shows the ingredient's Temperature (T), Density (D) and Magic Power (MP).
3. The cauldron holds up to 4 ingredients and keeps the order they went in. The recipe
   panel counts them (**Ingredients: 2 / 4**); at 4 / 4 the counter lights up and the shelf
   ignores new ingredients.
4. Watch the three bars under the cauldron: **Temperature**, **Density** and **Magic Power**
   start at 0 and move with every ingredient. Temperature and Density can go below 0, so
   their 0 line is in the middle. Each bar is a ruler: the hatched green zone is the recipe
   range, the lighter hatching around it the tolerance, an arrow marks the current value,
   and a ruler glows green while its value is inside the recipe range.
5. Press **Brew** (it needs at least one ingredient). Every cauldron value, the sum of the
   added ingredients, must be inside the recipe range widened by the tolerance of ±8. A
   good potion gives 200 score, 10 extra seconds (never above the start time of 02:30)
   and a new recipe; a wrong mixture costs a life. Either way the cauldron empties, and
   the used ingredients are spent.
6. An ingredient with no stock left becomes an empty, dimmed slot that cannot be used.
7. **Pause** stops the clock, blurs the play field and opens a dialog: **Resume** (or
   <kbd>Esc</kbd>) continues the same game, **Exit to Menu** leaves it for the start screen.
   The game also pauses by itself when the browser tab is hidden.
8. The game ends at 00:00, when no lives are left, or when the shelf and the cauldron are
   both empty (**Out of ingredients**). The Game Over screen shows the reason and the final
   score; **Play again** starts a new game, and <kbd>Esc</kbd> goes back to the start
   screen.
9. A score that makes the Top-10 asks for your name on the Game Over screen (2–15
   characters: letters, digits, space, `_` and `-`). The **Leaderboard**, open from the
   start screen and from Game Over, lists rank, name, score and date (`DD.MM.YYYY HH:MM`),
   higher scores first; on equal scores the earlier result stays higher. **Clear
   Leaderboard** asks first in the game's own dialog.

The Top-10 lives in `localStorage`. Every read goes through `try/catch` and a check of
each entry, so broken or edited data is dropped instead of crashing the game.

The timer is computed from `Date.now()` timestamps, not by counting ticks, so it stays
right when the browser slows down a background tab.

## Controls

| Action              | Mouse or touch              | Keyboard                                                              |
| ------------------- | --------------------------- | --------------------------------------------------------------------- |
| Start a game        | **Start Game**              | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Add an ingredient   | Click its card              | <kbd>Tab</kbd> to the card, <kbd>Enter</kbd> or <kbd>Space</kbd>      |
| Brew the potion     | **Brew**                    | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Pause and resume    | **Pause**, then **Resume**  | <kbd>Tab</kbd> to **Pause**, <kbd>Enter</kbd>; <kbd>Esc</kbd> resumes |
| Leave a paused game | **Exit to Menu**            | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Leave Game Over     | **Play again**              | <kbd>Esc</kbd> goes to the start screen                               |
| Save a Top-10 score | Type a name, **Save score** | Type a name, <kbd>Enter</kbd>                                         |

## Look and feel

The game looks like a field cookbook kept by adventurers deep in a dungeon: cream paper
pages with hand-drawn ink borders on a torch-lit stone floor, a camp pot hanging over a
small fire, and ink-outlined ingredient drawings in earthy colors.

- Every picture is our own and every game element is its own drawing: the ingredients,
  the cauldron and the hearts are inline SVG made in code (`src/ui/icons.ts`). There are
  no image files and no icon sets.
- The paper grain, the wobbly ink border and the screentone dots are procedural: SVG noise
  filters and CSS gradients.
- Fonts from Google Fonts under the SIL Open Font License: IM Fell English SC for titles,
  Alegreya and Alegreya Sans for text, Patrick Hand for notes and Kalam for numbers.
- Text on paper has a contrast of at least 4.5:1. The steam and the fire rest when the
  system asks for reduced motion.

## Implemented so far

- [x] Precondition: repository, tooling, structure and deployment
- [x] Level 1: Basic, complete
  - [x] US 1.1 Ingredient shelf and cauldron
  - [x] US 1.2 Cauldron parameter bars
  - [x] US 1.3 Recipe and brewing check
  - [x] US 1.4 Timer and game over
  - [x] US 1.5 Pause
  - [x] US 1.6 Leaderboard
- [ ] Level 2: Extended
- [ ] Level 3: Full game

## Deployment

The game is deployed to GitHub Pages: https://besika40k.github.io/alchemists-cauldron/

A GitHub Actions workflow (`.github/workflows/deploy.yml`) checks the lint and formatting,
builds the game and publishes `dist/` on every push to the current story branch.

## Tech stack

- TypeScript in strict mode, no frameworks and no runtime libraries
- Vite for the development server and the production build
- Plain CSS with custom properties and native nesting, fonts from Google Fonts
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
