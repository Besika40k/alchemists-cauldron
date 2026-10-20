import { createElement } from './dom';

export interface IConfirmRequest {
  readonly title: string;
  readonly message: string;
  readonly confirmText: string;
  readonly onConfirm: () => void;
}

/**
 * The game's own yes-or-no dialog, used instead of the browser's confirm().
 */
export class ConfirmDialog {
  readonly #title: HTMLHeadingElement;
  readonly #message: HTMLParagraphElement;
  readonly #confirmButton: HTMLButtonElement;
  #onConfirm: (() => void) | undefined;
  readonly element: HTMLDialogElement;

  constructor() {
    this.#title = createElement('h2', {
      className: 'dialog__title',
      attributes: { id: 'confirm-title' },
    });
    this.#message = createElement('p', {
      className: 'dialog__lead',
      attributes: { id: 'confirm-message' },
    });
    this.#confirmButton = createElement('button', {
      className: 'button button--danger button--large',
      attributes: { type: 'button' },
    });

    const cancelButton: HTMLButtonElement = createElement('button', {
      className: 'button button--large',
      text: 'Cancel',
      attributes: { type: 'button' },
    });

    // the safe answer gets the focus, so Enter never deletes anything by accident
    cancelButton.autofocus = true;
    cancelButton.addEventListener('click', (): void => {
      this.element.close();
    });
    this.#confirmButton.addEventListener('click', (): void => {
      const onConfirm: (() => void) | undefined = this.#onConfirm;

      this.element.close();
      onConfirm?.();
    });

    this.element = createElement(
      'dialog',
      {
        className: 'dialog confirm',
        attributes: { 'aria-labelledby': 'confirm-title', 'aria-describedby': 'confirm-message' },
      },
      [
        this.#title,
        this.#message,
        createElement('div', { className: 'dialog__actions' }, [cancelButton, this.#confirmButton]),
      ],
    );
  }

  open(request: IConfirmRequest): void {
    this.#title.textContent = request.title;
    this.#message.textContent = request.message;
    this.#confirmButton.textContent = request.confirmText;
    this.#onConfirm = request.onConfirm;
    this.element.showModal();
  }
}
