import { getSettings, isCauldronFull } from '../logic/game-rules';
import { findReaction, getActiveReactions, getReactions } from '../logic/reactions';
import type {
  IBrewResult,
  IGameState,
  IIngredient,
  IReaction,
  IReactionEvent,
} from '../types/game';
import { createBrewEffect, createFloatingIcons } from './brew-effects';
import { createElement } from './dom';
import { createCauldronArt, createIngredientIcon } from './icons';
import { findIngredient, INGREDIENT_DRAG_TYPE, isIngredientDrag } from './ingredient-drag';
import type { IngredientHandler } from './shelf-view';

type MessageKind = 'success' | 'failure' | 'reaction';

const MESSAGE_KINDS: readonly MessageKind[] = ['success', 'failure', 'reaction'];

function describeBrew(brewResult: IBrewResult, scorePerBrew: number): string {
  return brewResult.isSuccess
    ? `${brewResult.recipeName} is ready! +${String(scorePerBrew)} score`
    : `The ${brewResult.recipeName} failed. You lost a life.`;
}

/**
 * "Bubbling! Magic Power +50%, −10 s once." for every reaction that just started.
 */
function describeReactions(reactionEvent: IReactionEvent): string {
  const parts: string[] = [];

  for (const id of reactionEvent.reactionIds) {
    const reaction: IReaction | undefined = findReaction(id);

    if (reaction) {
      parts.push(`${reaction.name}! ${reaction.effect}.`);
    }
  }

  return parts.join(' ');
}

function createReactionChip(reaction: IReaction): HTMLLIElement {
  return createElement('li', { className: 'reaction-chip', text: reaction.name });
}

/**
 * The cauldron drawing, the added ingredients in the order they went in, the active
 * reactions and the news of the last brew or reaction. A shelf card can be dropped
 * onto it.
 */
export class CauldronView {
  readonly #stage: HTMLDivElement;
  readonly #floaters: HTMLDivElement;
  readonly #contents: HTMLOListElement;
  readonly #reactions: HTMLUListElement;
  readonly #message: HTMLParagraphElement;
  #shownIngredients: readonly IIngredient[] | undefined;
  #shownBrewId: number | undefined;
  #shownReactionId: number | undefined;
  #effectBrewId: number | undefined;
  #canDrop: boolean = false;
  readonly element: HTMLElement;

  constructor(onDrop: IngredientHandler) {
    this.#floaters = createElement('div', {
      className: 'cauldron__floaters',
      attributes: { 'aria-hidden': 'true' },
    });
    this.#stage = createElement('div', { className: 'cauldron__stage' }, [
      createCauldronArt(),
      this.#floaters,
    ]);
    this.#contents = createElement('ol', {
      className: 'cauldron__contents',
      attributes: { 'aria-label': 'Ingredients in the cauldron' },
    });
    this.#reactions = createElement('ul', {
      className: 'cauldron__reactions',
      attributes: { 'aria-label': 'Active reactions' },
    });
    // a status region, so screen readers announce every brew result and reaction
    this.#message = createElement('p', {
      className: 'cauldron__message',
      attributes: { role: 'status' },
    });
    this.element = createElement(
      'section',
      { className: 'panel cauldron', attributes: { 'aria-labelledby': 'cauldron-title' } },
      [
        createElement('h2', {
          className: 'panel__title visually-hidden',
          text: 'Cauldron',
          attributes: { id: 'cauldron-title' },
        }),
        this.#stage,
        this.#contents,
        this.#reactions,
        this.#message,
      ],
    );
    this.#listenToDrops(onDrop);
  }

  /**
   * The cauldron lights up while a card that can go in is dragged over it. A paused
   * game or a full cauldron takes no drop, and the rules check every add again.
   */
  #listenToDrops(onDrop: IngredientHandler): void {
    this.element.addEventListener('dragover', (event: DragEvent): void => {
      if (!this.#canDrop || !isIngredientDrag(event)) {
        return;
      }

      // cancelling dragover is what allows the drop
      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }

      this.element.classList.add('cauldron--drop-target');
    });
    this.element.addEventListener('dragleave', (event: DragEvent): void => {
      const { relatedTarget }: DragEvent = event;

      // moving between the parts of the cauldron is not leaving it
      if (relatedTarget instanceof Node && this.element.contains(relatedTarget)) {
        return;
      }

      this.element.classList.remove('cauldron--drop-target');
    });
    this.element.addEventListener('drop', (event: DragEvent): void => {
      const ingredient: IIngredient | undefined = findIngredient(
        event.dataTransfer?.getData(INGREDIENT_DRAG_TYPE),
      );

      event.preventDefault();
      this.element.classList.remove('cauldron--drop-target');

      if (ingredient && this.#canDrop) {
        onDrop(ingredient.id);
      }
    });
  }

  #setMessage(text: string, kind: MessageKind | undefined): void {
    this.#message.textContent = text;

    for (const name of MESSAGE_KINDS) {
      this.#message.classList.toggle(`cauldron__message--${name}`, name === kind);
    }
  }

  /**
   * The message tells the newest event: a reaction that just started or the last brew.
   * A new game has neither and starts with an empty message.
   */
  #renderMessage(state: IGameState): void {
    const { lastBrew, lastReaction }: IGameState = state;

    if (lastReaction && lastReaction.id !== this.#shownReactionId) {
      this.#setMessage(describeReactions(lastReaction), 'reaction');
    } else if (lastBrew && lastBrew.id !== this.#shownBrewId) {
      this.#setMessage(
        describeBrew(lastBrew, getSettings(state).scorePerBrew),
        lastBrew.isSuccess ? 'success' : 'failure',
      );
    } else if (!lastBrew && !lastReaction) {
      this.#setMessage('', undefined);
    }

    this.#shownBrewId = lastBrew?.id;
    this.#shownReactionId = lastReaction?.id;
  }

  /**
   * A new brew result plays its effect over the cauldron once; a new game removes the
   * old one.
   */
  #renderEffect(state: IGameState): void {
    const { lastBrew }: IGameState = state;

    if (lastBrew?.id === this.#effectBrewId) {
      return;
    }

    this.#effectBrewId = lastBrew?.id;
    this.#stage.querySelector('.brew-effect')?.remove();

    if (lastBrew) {
      this.#stage.append(createBrewEffect(lastBrew, getSettings(state).timeBonusSeconds));
    }
  }

  /**
   * On a phone the shelf lies far below the cauldron, so after a brew the page scrolls up
   * to its result. When the drawing and the message are already in sight, nothing moves.
   */
  bringIntoView(): void {
    const stage: DOMRect = this.#stage.getBoundingClientRect();
    const message: DOMRect = this.#message.getBoundingClientRect();
    // the scroll margin is the room the sticky actions take at the bottom of the screen
    const margin: CSSStyleValue | undefined = this.element
      .computedStyleMap()
      .get('scroll-margin-bottom');
    const visibleBottom: number = innerHeight - (margin instanceof CSSUnitValue ? margin.value : 0);

    if (stage.top >= 0 && message.bottom <= visibleBottom) {
      return;
    }

    this.element.scrollIntoView({
      block: 'end',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  render(state: IGameState): void {
    this.#canDrop = state.status === 'playing' && !isCauldronFull(state);

    if (!this.#canDrop) {
      this.element.classList.remove('cauldron--drop-target');
    }

    this.#renderMessage(state);
    this.#renderEffect(state);

    // the timer redraws the screen every second; the contents change only with ingredients
    if (state.cauldronIngredients === this.#shownIngredients) {
      return;
    }

    this.#shownIngredients = state.cauldronIngredients;

    const capacity: number = getSettings(state).maxCauldronIngredients;
    const freeSlots: number = Math.max(capacity - state.cauldronIngredients.length, 0);

    const activeReactions: readonly IReaction[] = getActiveReactions(
      state.cauldronIngredients,
      getReactions(state.difficulty),
    );

    this.#floaters.replaceChildren(...createFloatingIcons(state.cauldronIngredients));
    this.#reactions.hidden = activeReactions.length === 0;
    this.#reactions.replaceChildren(
      ...activeReactions.map((reaction: IReaction): HTMLLIElement => createReactionChip(reaction)),
    );
    this.#contents.style.setProperty('--cauldron-capacity', String(capacity));
    this.#contents.replaceChildren(
      ...state.cauldronIngredients.map((ingredient: IIngredient): HTMLLIElement =>
        createElement('li', { className: 'cauldron__item' }, [
          createIngredientIcon(ingredient.id, 'cauldron__item-icon'),
          createElement('span', { className: 'cauldron__item-name', text: ingredient.name }),
        ]),
      ),
      ...Array.from({ length: freeSlots }, (): HTMLLIElement =>
        createElement('li', {
          className: 'cauldron__item cauldron__item--free',
          attributes: { 'aria-hidden': 'true' },
        }),
      ),
    );
  }
}
