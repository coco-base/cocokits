'use client';

import { isValidElement, useId, type ReactElement, type Ref } from 'react';
import { chipAnatomy, getChipProps } from '@cocokits/machines/chip';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { useControllableState } from '../internal/use-controllable-state';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderContainerRoot } from '../internal/render-container-root';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import type { ChipChangeDetails, ChipProps, ChipRenderProps } from './chip.types';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['data-disabled'];

function ChipImpl({
  removable = false,
  disabled = false,
  onRemove,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  removeLabel,
  id,
  render,
  children,
  ref,
  ...rest
}: ChipProps): ReactElement {
  const generatedId = useId();
  const themeAttrs = useThemeAttrs(chipAnatomy);
  const [selected, setSelected] = useControllableState<boolean | undefined, ChipChangeDetails>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: (next, details) => {
      if (next !== undefined) onSelectedChange?.(next, details);
    },
    name: '<Chip selected>',
  });
  const parts = getChipProps({ id: id ?? generatedId, removable, disabled, selected, removeLabel });
  const iconName = usePartIcon(chipAnatomy, 'remove', undefined, parts.remove !== null);
  const checkName = usePartIcon(chipAnatomy, 'check', undefined, parts.check !== null);
  const elementRef = isValidElement<{ ref?: Ref<HTMLElement> }>(render) ? render.props.ref : undefined;
  const rootRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      ref: rootRef,
      children: (
        <>
          {parts.check && (
            <span {...themeAttrs.check} {...toReactProps(parts.check)}>
              {checkName !== undefined && <SvgIcon iconName={checkName} />}
            </span>
          )}
          {selected === undefined ? (
            <span {...themeAttrs.contentWrapper} {...toReactProps(parts.contentWrapper)}>
              {children}
            </span>
          ) : (
            <button
              {...themeAttrs.contentWrapper}
              {...toReactProps(parts.contentWrapper)}
              onClick={(event) => {
                setSelected(!selected, { reason: 'user', event: event.nativeEvent });
              }}
            >
              {children}
            </button>
          )}
          {parts.remove && (
            <button
              {...themeAttrs.remove}
              {...toReactProps(parts.remove)}
              onClick={() => {
                onRemove?.();
              }}
            >
              {iconName !== undefined && <SvgIcon iconName={iconName} />}
            </button>
          )}
        </>
      ),
    },
    withoutReserved(rest, RESERVED),
  ) as unknown as ChipRenderProps;
  return renderContainerRoot<ChipRenderProps, undefined>(render, root, undefined);
}

/** The {@link Chip} component and its `displayName`. */
interface ChipComponent {
  (props: ChipProps): ReactElement;
  displayName: string;
}

/**
 * A short value, such as a tag, a filter or a choice. It renders a `<div>` that holds a `<span>` with the content
 * and, with `removable`, a `<button type="button">` that asks to remove the chip. A disabled chip renders no
 * remove button.
 *
 * The remove button is named "Remove" and the text of the chip, for example "Remove Pizza". `removeLabel` replaces
 * the whole name. It draws an icon with `SvgIcon`: the icon the theme names in `components.chip.icons`, else the default
 * `close`. A theme icon must be registered, for example with `IconProvider`.
 *
 * Set `selected` or `defaultSelected` to make the chip selectable. The content then is a toggle
 * `<button type="button">` with `aria-pressed` and `data-selected`. A check part shows while the chip is selected,
 * with the theme icon `components.chip.icons.check` (default `check`). The remove button is a sibling of the
 * toggle, never inside it.
 *
 * The chip does not remove itself. Handle `onRemove` and drop the value from your data.
 *
 * @example
 * <Chip removable onRemove={() => undefined}>
 *   Pizza
 * </Chip>
 * @cckPart root
 * @cckPart contentWrapper
 * @cckPart check
 * @cckPart remove
 * @param props - The Chip props.
 * @returns The rendered chip.
 */
export const Chip: ChipComponent = Object.assign(ChipImpl, { displayName: 'Chip' });
