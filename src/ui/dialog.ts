/**
 * Opens a modal dialog or closes it to match the game state. A modal dialog makes
 * the rest of the page inert, so the play field cannot be used behind it.
 */
export function setDialogOpen(dialog: HTMLDialogElement, isOpen: boolean): void {
  if (isOpen && !dialog.open) {
    dialog.showModal();
  }

  if (!isOpen && dialog.open) {
    dialog.close();
  }
}
