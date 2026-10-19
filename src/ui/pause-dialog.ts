import type { IGameState } from '../types/game';
import { setDialogOpen } from './dialog';
import { createElement } from './dom';

export interface IPauseHandlers {
  readonly onResume: () => void;
  readonly onExit: () => void;
}

function createDialogButton(
  text: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const button: HTMLButtonElement = createElement('button', {
    className,
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
}

/**
 * The pause screen: Resume continues the same game, Exit to Menu leaves it.
 */
export class PauseDialog {
  #isPaused: boolean = false;
  readonly element: HTMLDialogElement;

  constructor(handlers: IPauseHandlers) {
    const resumeButton: HTMLButtonElement = createDialogButton(
      'Resume',
      'button button--primary button--large',
      handlers.onResume,
    );

    // Resume is the safe choice, so it gets the focus when the dialog opens
    resumeButton.autofocus = true;

    this.element = createElement(
      'dialog',
      { className: 'dialog pause', attributes: { 'aria-labelledby': 'pause-title' } },
      [
        createElement('h2', {
          className: 'dialog__title',
          text: 'Game Paused',
          attributes: { id: 'pause-title' },
        }),
        createElement('p', {
          className: 'dialog__lead',
          text: 'The clock is stopped.',
        }),
        createElement('div', { className: 'dialog__actions dialog__actions--column' }, [
          resumeButton,
          createDialogButton('Exit to Menu', 'button button--large', handlers.onExit),
        ]),
      ],
    );

    // Escape closes a modal dialog by itself; for the pause screen that means Resume
    this.element.addEventListener('close', (): void => {
      if (this.#isPaused) {
        handlers.onResume();
      }
    });
  }

  render(state: IGameState): void {
    this.#isPaused = state.status === 'paused';
    setDialogOpen(this.element, this.#isPaused);
  }
}
