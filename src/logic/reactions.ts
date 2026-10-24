import { DIFFICULTY_REACTIONS } from '../data/difficulty';
import { REACTIONS } from '../data/reactions';
import type { Difficulty, IIngredient, IReaction, ReactionId } from '../types/game';

/**
 * The reactions of a difficulty, in the order of the reaction table: none on Easy.
 */
export function getReactions(difficulty: Difficulty): readonly IReaction[] {
  const ids: readonly ReactionId[] = DIFFICULTY_REACTIONS[difficulty];

  return REACTIONS.filter((reaction: IReaction): boolean => ids.includes(reaction.id));
}

export function getActiveReactions(
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[],
): readonly IReaction[] {
  return reactions.filter((reaction: IReaction): boolean => reaction.isActive(ingredients));
}

/**
 * The reactions that start with an add: not active before it, active after it. A
 * combination that stays in the cauldron does not fire again.
 */
export function findStartedReactions(
  before: readonly IIngredient[],
  after: readonly IIngredient[],
  reactions: readonly IReaction[],
): readonly IReaction[] {
  return reactions.filter(
    (reaction: IReaction): boolean => !reaction.isActive(before) && reaction.isActive(after),
  );
}

export function findReaction(id: ReactionId): IReaction | undefined {
  return REACTIONS.find((reaction: IReaction): boolean => reaction.id === id);
}
