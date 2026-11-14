import { dataAttr } from '@cocokits/utils';
import { getButtonProps } from '../button';
import { chipAnatomy } from './chip.anatomy';
import type { ChipParts, ChipProps } from './chip.types';

/**
 * Computes the props of every Chip part. Pure: no DOM, same result on the server and the client. The remove
 * button is a native button, named by the content wrapper, so its name is the chip text.
 *
 * @param props - The chip id and whether it is removable and disabled.
 * @returns The props of the root, the content wrapper and the remove button (`null` without `removable`).
 */
export function getChipProps({ id, removable = false, disabled = false }: ChipProps): ChipParts {
  const { classes } = chipAnatomy;
  const contentId = `${id}-content`;
  return {
    root: { class: classes.root, id, 'data-disabled': dataAttr(disabled) },
    contentWrapper: { class: classes.contentWrapper, id: contentId },
    remove: removable
      ? {
          ...getButtonProps({ element: 'button', disabled }),
          class: classes.remove,
          type: 'button',
          'aria-labelledby': contentId,
        }
      : null,
  };
}
