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

The numbers in these steps are the Medium ones; [Difficulty](#difficulty) lists all three.

1. Before the first run the shelf and the cauldron are empty, the score and the time are 0
   and there are no lives yet. Under the centered **Start Game** the start screen names the
   difficulty of the next game. **Help** opens the rules, and **Menu** lets you choose
   **Easy**, **Medium** or **Hard** before the game starts.
   Press **Start Game**. The shelf fills with the first 6 ingredients of the catalogue,
   and each one gets a random stock from 2 to 15 (the number on the round sticker). The
   recipe panel shows a random recipe of the difficulty, you have 3 lives, and the clock
   starts at 02:30. The time bar shrinks with it, and under 15 seconds the timer turns red
   and pulses.
2. Click an ingredient, drag it onto the cauldron with the mouse, or reach it with
   <kbd>Tab</kbd> and press <kbd>Enter</kbd> or <kbd>Space</kbd>, to put one portion into
   the cauldron. Its stock drops by 1. While a card that can go in is dragged over the
   cauldron, the cauldron lights up; an empty card, a full cauldron or a paused game
   takes no drop. A card shows the ingredient's icon, name and stock; hovering it, or
   reaching it with <kbd>Tab</kbd>, opens a tooltip with its Temperature, Density and Magic
   Power (`+` for positive, `−` for negative values). A card near the right edge opens the
   tooltip to the left, a card near the bottom opens it upward, and a paused game hides it.
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
   the used ingredients are spent. **Pour Out** throws a wrong mix away without losing a
   life: the cauldron empties, its ingredients stay spent and the clock loses 10 seconds.
   It is disabled while the cauldron is empty.
6. An ingredient with no stock left becomes an empty, dimmed slot that cannot be used.
7. **Pause** stops the clock, blurs the play field and opens a dialog: **Resume** (or
   <kbd>Esc</kbd>) continues the same game, **Exit to Menu** leaves it for the start screen.
   The game also pauses by itself when the browser tab is hidden.
8. The game ends at 00:00, when no lives are left, or when the shelf and the cauldron are
   both empty (**Out of ingredients**). The Game Over screen shows the reason and the final
   score; **Play again** starts a new game, and <kbd>Esc</kbd> goes back to the start
   screen.
9. Every difficulty has its own Top-10. A score that makes the list of its difficulty asks
   for your name on the Game Over screen (2–15 characters: letters, digits, space, `_` and
   `-`). The **Leaderboard**, open from the start screen, the Menu and Game Over, shows
   one list at a time with Easy, Medium and Hard buttons on top; it lists rank, name,
   difficulty, score and date (`DD.MM.YYYY HH:MM`), higher scores first; on equal scores
   the earlier result stays higher. **Clear Leaderboard** clears the shown list and asks
   first in the game's own dialog.

The difficulty cannot change during a game: Menu is only on the start screen, and Play
again keeps the difficulty of the finished game.

## Chemical reactions

Some ingredient combinations react in the cauldron. Easy has none, Medium uses 2 and Hard
uses 3 of the 15 reactions of the task's reaction table, kept as a typed `IReaction[]`:

| Difficulty | Reaction     | Trigger                                             | Effect                                     |
| ---------- | ------------ | --------------------------------------------------- | ------------------------------------------ |
| Medium     | Bubbling     | Fairy Dust + Caustic Acid                           | Magic Power +50%, −10 s once               |
| Medium     | Solar Frost  | Dragon Tears + Frost Lotus                          | Temperature set to 0, Density +20%         |
| Hard       | Volatile Mix | Phoenix Feather + Essence of the Void               | Lose 1 life and the cauldron empties, once |
| Hard       | Magma Flux   | Total Temperature 60 or more                        | Magic Power +20%, Density −10%             |
| Hard       | Steam Burst  | Dragon Tears + Caustic Acid, total Temperature ≥ 35 | Temperature +10, −5 s once                 |

- The cauldron values are worked out from the ingredient list every time: the sums of
  the ingredients, then every active reaction of the difficulty in the order of the
  table. The bars and the Brew check use these values. Percentages are rounded to whole
  numbers.
- A reaction fires only when it changes from not active to active: its message appears
  and its one-time cost (time, or a life and the cauldron) is taken. While the same
  combination stays in the cauldron it does not fire again.
- The active reactions are listed as tags under the cauldron, and Help lists all of them.
- The subsets were chosen so that every recipe of the difficulty can still be brewed:
  Annihilation or Void Resonance would make some recipes impossible.

## Save and Continue Game

The game saves itself while you play, so a reload or a closed tab does not lose it.

- Saved: the difficulty, score, time left, lives, recipe, cauldron, shelf stock and
  status. The game is saved after every change and on pause; a running clock is saved to
  the millisecond.
- **Continue Game** appears on the start screen and in the Menu only when a valid
  unfinished game is saved. It opens that game paused, with the same stock, recipe and
  cauldron; **Resume** starts the clock.
- A finished game is never offered: Game Over deletes the save. **Start Game** overwrites
  it, and **Exit to Menu** deletes it.
- Loaded data is checked against the game's own tables (difficulty, recipe, shelf, stock
  0–15, lives, time, cauldron size). Broken, edited or finished data is deleted and the
  game starts normally.

The Top-10 lists live in `localStorage`, one per difficulty. The results of Level 1, which
were all played on Medium, show up in the Medium list. Every read goes through `try/catch` and a check of
each entry, so broken or edited data is dropped instead of crashing the game.

The timer is computed from `Date.now()` timestamps, not by counting ticks, so it stays
right when the browser slows down a background tab.

## Difficulty

The game reads every number from one `DIFFICULTY_SETTINGS` object, the difficulty table of
the task. Medium is the Level 1 rule set.

| Setting                     | Easy  | Medium | Hard  |
| --------------------------- | :---: | :----: | :---: |
| Ingredients on the shelf    |   4   |   6    |   8   |
| Ingredients in the cauldron |   4   |   4    |   5   |
| Start time                  | 180 s | 150 s  | 150 s |
| Brew tolerance              |  ±12  |   ±8   |  ±5   |
| Lives                       |   5   |   3    |   3   |
| Score per brew              |  100  |  200   |  300  |
| Time bonus per brew         | +15 s | +10 s  | +5 s  |

Each difficulty draws its recipes from its own rows of the recipe table, and the shelf
shows only the first 4, 6 or 8 ingredients of the catalogue.

## Controls

| Action                | Mouse or touch                              | Keyboard                                                              |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| Read the rules        | **Help**                                    | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>; <kbd>Esc</kbd> closes |
| Choose a difficulty   | **Menu**, then a difficulty                 | <kbd>Tab</kbd> to it, <kbd>Enter</kbd>                                |
| Start a game          | **Start Game**                              | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Continue a saved game | **Continue Game**, then **Resume**          | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Add an ingredient     | Click its card or drag it onto the cauldron | <kbd>Tab</kbd> to the card, <kbd>Enter</kbd> or <kbd>Space</kbd>      |
| Pour the mix out      | **Pour Out**                                | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Brew the potion       | **Brew**                                    | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Pause and resume      | **Pause**, then **Resume**                  | <kbd>Tab</kbd> to **Pause**, <kbd>Enter</kbd>; <kbd>Esc</kbd> resumes |
| Leave a paused game   | **Exit to Menu**                            | <kbd>Tab</kbd> to the button, <kbd>Enter</kbd>                        |
| Leave Game Over       | **Play again**                              | <kbd>Esc</kbd> goes to the start screen                               |
| Save a Top-10 score   | Type a name, **Save score**                 | Type a name, <kbd>Enter</kbd>                                         |

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
- [x] Level 2: Extended, complete
  - [x] US 2.1 Difficulty selection
  - [x] US 2.2 Auto-save and Continue Game
- [ ] Level 3: Full game
  - [x] US 3.1 Drag and drop
  - [x] US 3.2 Ingredient tooltip
  - [x] US 3.3 Chemical reactions
  - [x] US 3.4 Pour Out

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
