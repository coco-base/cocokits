import { dataAttr } from '@cocokits/utils';
import { chipAnatomy } from './chip.anatomy';
import type { ChipCheckProps, ChipContentWrapperProps, ChipParts, ChipProps, ChipRemoveProps } from './chip.types';

const DEFAULT_REMOVE_TEXT = 'Remove';

function contentProps(
  id: string,
  { selected, disabled }: Pick<ChipProps, 'selected' | 'disabled'>,
): ChipContentWrapperProps {
  const base = { class: chipAnatomy.classes.contentWrapper, id };
  if (selected === undefined) return base;
  return {
    ...base,
    type: 'button',
    'aria-pressed': selected ? 'true' : 'false',
    disabled: disabled === true ? true : undefined,
    'data-selected': dataAttr(selected),
  };
}

function checkProps(selected: boolean | undefined): ChipCheckProps | null {
  if (selected === undefined) return null;
  return {
    class: chipAnatomy.classes.check,
    'aria-hidden': 'true',
    'data-state': selected ? 'checked' : undefined,
  };
}

/** The remove button is named "Remove <chip text>" by default, or by the author's label alone. */
function removeProps(props: ChipProps, contentId: string): ChipRemoveProps | null {
  if (props.removable !== true || props.disabled === true) return null;
  const id = `${props.id}-remove`;
  const label = props.removeLabel === '' ? undefined : props.removeLabel;
  return {
    class: chipAnatomy.classes.remove,
    id,
    type: 'button',
    'aria-label': label ?? props.removeText ?? DEFAULT_REMOVE_TEXT,
    'aria-labelledby': label === undefined ? `${id} ${contentId}` : undefined,
  };
}

/**
 * Computes the props of every Chip part. Pure: no DOM, same result on the server and the client. A selectable chip
 * (`selected` is a boolean) renders its content as a toggle button with `aria-pressed` and a check. The remove
 * button is a sibling of the content, never inside the toggle; it is named "Remove" and the chip text unless the
 * author gives `removeLabel`; a disabled chip renders none.
 *
 * @param props - The chip id, whether it is removable, disabled and selected, and the remove name.
 * @returns The props of the root, the content wrapper, the check (`null` unless selectable) and the remove button
 * (`null` unless removable and enabled).
 */
export function getChipProps(props: ChipProps): ChipParts {
  const { classes } = chipAnatomy;
  const contentId = `${props.id}-content`;
  return {
    root: { class: classes.root, id: props.id, 'data-disabled': dataAttr(props.disabled === true) },
    contentWrapper: contentProps(contentId, props),
    check: checkProps(props.selected),
    remove: removeProps(props, contentId),
  };
}
