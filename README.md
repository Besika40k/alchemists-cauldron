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

## Tech stack

- TypeScript in strict mode, no frameworks and no runtime libraries
- Vite for the development server and the production build
- Plain CSS
- ESLint, Prettier, Husky and commitlint for code quality

## Getting started

Requirements: Node.js 22 or newer and npm.

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

## Code quality

- **ESLint** uses the type-aware rules of typescript-eslint and the unicorn plugin. On top of
  them it forbids `console`, `any`, `alert()`, `confirm()`, `setTimeout` and `setInterval`,
  asks for explicit return types, and ignores disable comments in the code.
- **Prettier** formats the code; ESLint leaves formatting to it.
- **Husky** runs two Git hooks:
  - `commit-msg` checks the message with commitlint against the
    [RS School git convention](https://rs.school/docs/git-convention);
  - `pre-push` runs the lint, format and type checks, and a failed check stops the push.
