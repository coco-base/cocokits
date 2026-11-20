import { avatarLabelAnatomy } from './avatar-label.anatomy';
import type { AvatarLabelParts, AvatarLabelProps } from './avatar-label.types';

/**
 * Computes the props of every AvatarLabel part. Pure.
 *
 * @param props - The name and the description; empty strings count as unset.
 * @returns The root props, and the text, name and description parts to render, or `null` to leave one out.
 */
export function getAvatarLabelProps({ name, description }: AvatarLabelProps = {}): AvatarLabelParts {
  const classes = avatarLabelAnatomy.classes;
  const hasName = typeof name === 'string' && name !== '';
  const hasDescription = typeof description === 'string' && description !== '';
  return {
    root: { class: classes.root },
    text: hasName || hasDescription ? { class: classes.text } : null,
    name: hasName ? { class: classes.name } : null,
    description: hasDescription ? { class: classes.description } : null,
  };
}
