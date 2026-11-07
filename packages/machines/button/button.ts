import { dataAttr } from '@cocokits/utils';
import { buttonAnatomy } from './button.anatomy';
import type { ButtonClickEvent, ButtonProps, ButtonRootProps } from './button.types';

/**
 * Blocks activation of a disabled link. Returns at once when a consumer handler already
 * vetoed the event; otherwise prevents the default and stops other listeners on the host.
 */
export function linkClickGuard(event: ButtonClickEvent): void {
  if (event.defaultPrevented) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}

/**
 * Computes the root props of a Button. Pure: no DOM, same result on server and client.
 *
 * @param props - The element kind and whether the button is disabled.
 * @returns The class, and the disabled markers for the element kind.
 */
export function getButtonProps({ disabled = false, element }: ButtonProps): ButtonRootProps {
  const base = { class: buttonAnatomy.classes.root };
  if (!disabled) return base;
  const marker = dataAttr(true);
  return element === 'button'
    ? { ...base, disabled: true, 'data-disabled': marker }
    : {
        ...base,
        'aria-disabled': 'true',
        tabindex: -1,
        'data-disabled': marker,
        onClick: linkClickGuard,
      };
}
