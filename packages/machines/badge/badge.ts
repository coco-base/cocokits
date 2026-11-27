import { dataAttr } from '@cocokits/utils';
import { badgeAnatomy } from './badge.anatomy';
import type { BadgeParts, BadgeProps } from './badge.types';

/** What a badge shows, before it is split into parts. */
export interface BadgeText {
  /** The text shown; empty when there is none. */
  readonly shownText: string;
  /** Whether the content is above `max`. */
  readonly truncated: boolean;
}

/**
 * Decides the text a badge shows. Pure.
 *
 * @param content - The count or text. `null`, `undefined`, `""` and the number `0` give an empty badge.
 * @param max - The largest count shown. Unset or `0` never truncates.
 * @returns The shown text and whether it is truncated.
 */
export function getBadgeText(content: BadgeProps['content'], max?: number): BadgeText {
  if (content === null || content === undefined || content === '' || content === 0) {
    return { shownText: '', truncated: false };
  }
  const text = String(content);
  const count = parseInt(text, 10);
  if (max !== undefined && max > 0 && !Number.isNaN(count) && count > max) {
    return { shownText: String(max), truncated: true };
  }
  return { shownText: text, truncated: false };
}

/**
 * Computes the props of every Badge part. Pure: no DOM, same result on server and client.
 *
 * @param props - The content, the maximum and `hide`.
 * @returns The root props and the content and indicator parts to render, or `null` for a part to leave out.
 */
export function getBadgeProps({ content, max, hide = false }: BadgeProps): BadgeParts {
  const classes = badgeAnatomy.classes;
  if (hide) {
    return { root: { class: classes.root, hidden: true }, content: null, maxIndicator: null };
  }
  const { shownText, truncated } = getBadgeText(content, max);
  return {
    root: {
      class: classes.root,
      'data-empty': dataAttr(shownText === ''),
      'data-truncated': dataAttr(truncated),
    },
    content: { class: classes.content, text: shownText },
    maxIndicator: truncated ? { class: classes.maxIndicator, text: '+' } : null,
  };
}
