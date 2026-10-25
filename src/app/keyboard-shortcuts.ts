import { getShelfIngredients } from '../logic/game-rules';
import type { IGameState, IIngredient, IngredientId } from '../types/game';

export interface IShortcutActions {
  readonly getState: () => IGameState;
  readonly addIngredient: (id: IngredientId) => void;
  readonly brew: () => void;
  readonly pourOut: () => void;
  readonly pause: () => void;
}

type ShortcutAction = 'brew' | 'pourOut' | 'pause';

// physical keys, so the shortcuts also work with a Georgian or Russian keyboard layout
const ACTION_KEYS: Readonly<Record<string, ShortcutAction>> = {
  KeyB: 'brew',
  KeyO: 'pourOut',
  KeyP: 'pause',
  Escape: 'pause',
};

// Digit1 or Numpad1 is the first ingredient on the shelf, up to 8 on Hard
const INGREDIENT_KEY_PATTERN: RegExp = /^(?:Digit|Numpad)([1-8])$/;

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/**
 * The shelf ingredient a number key stands for, if the shelf has that many.
 */
function findIngredientForKey(code: string, state: IGameState): IIngredient | undefined {
  const place: string | undefined = INGREDIENT_KEY_PATTERN.exec(code)?.[1];

  return place === undefined ? undefined : getShelfIngredients(state.difficulty)[Number(place) - 1];
}

/**
 * The keys of a running game, all in one handler: 1–8 add the ingredient in that
 * place, B brews, O pours out, P or Esc pauses. They work only while the game is
 * playing, so the start screen, the pause dialog and Game Over keep the normal
 * browser keys, and they never fire while the player types in a field.
 */
export function listenToShortcuts(actions: IShortcutActions): void {
  document.addEventListener('keydown', (event: KeyboardEvent): void => {
    const state: IGameState = actions.getState();

    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      state.status !== 'playing' ||
      isTyping(event.target)
    ) {
      return;
    }

    const ingredient: IIngredient | undefined = findIngredientForKey(event.code, state);
    const action: ShortcutAction | undefined = ACTION_KEYS[event.code];

    if (ingredient) {
      event.preventDefault();
      actions.addIngredient(ingredient.id);
    } else if (action) {
      // Esc would also close a dialog, so the browser does nothing else with the key
      event.preventDefault();
      actions[action]();
    }
  });
}
