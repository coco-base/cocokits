import { getButtonProps } from '../button';
import type { ButtonProps, ButtonRootProps } from '../button';
import { iconButtonAnatomy } from './icon-button.anatomy';

/**
 * Computes the root props of an IconButton: the Button props with the `cck-icon-button` class. Pure: no DOM, same
 * result on server and client.
 *
 * @param props - The element kind and whether the button is disabled.
 * @returns The class, and the disabled markers for the element kind.
 */
export function getIconButtonProps(props: ButtonProps): ButtonRootProps {
  return { ...getButtonProps(props), class: iconButtonAnatomy.classes.root };
}
