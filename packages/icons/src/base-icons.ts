import { checkIcon } from './pack/check';
import { chevronDownIcon } from './pack/chevron-down';
import { closeIcon } from './pack/close';
import { minusIcon } from './pack/minus';
import type { Icon } from './icon';

/**
 * The icons every icon registry starts with, and the defaults of the unstyled components: a part with no content of
 * its own and no icon from the theme shows one of these.
 */
export const baseIcons: Readonly<Record<'chevron-down' | 'check' | 'minus' | 'close', Icon>> = {
  'chevron-down': chevronDownIcon,
  check: checkIcon,
  minus: minusIcon,
  close: closeIcon,
};
