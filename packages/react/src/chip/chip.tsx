'use client';

import { isValidElement, useId, type ReactElement, type Ref } from 'react';
import { chipAnatomy, getChipProps } from '@cocokits/machines/chip';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderContainerRoot } from '../internal/render-container-root';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import type { ChipProps, ChipRenderProps } from './chip.types';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['data-disabled'];

function ChipImpl({
  removable = false,
  disabled = false,
  onRemove,
  id,
  render,
  children,
  ref,
  ...rest
}: ChipProps): ReactElement {
  const generatedId = useId();
  const themeAttrs = useThemeAttrs(chipAnatomy);
  const parts = getChipProps({ id: id ?? generatedId, removable, disabled });
  const iconName = usePartIcon(chipAnatomy, 'remove', undefined, removable);
  const elementRef = isValidElement<{ ref?: Ref<HTMLElement> }>(render) ? render.props.ref : undefined;
  const rootRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const root = mergeProps(
    {
      ...themeAttrs.root,
      ...toReactProps(parts.root),
      ref: rootRef,
      children: (
        <>
          <span {...themeAttrs.contentWrapper} {...toReactProps(parts.contentWrapper)}>
            {children}
          </span>
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
 * and, with `removable`, a `<button type="button">` that asks to remove the chip.
 *
 * The remove button is named by the content, so a screen reader reads the chip text and then a button with the same
 * name. It draws an icon with `SvgIcon`: the icon the theme names in `components.chip.icons`, else the default
 * `close`. A theme icon must be registered, for example with `IconProvider`.
 *
 * The chip does not remove itself. Handle `onRemove` and drop the value from your data.
 *
 * @example
 * <Chip removable onRemove={() => undefined}>
 *   Pizza
 * </Chip>
 * @cckPart root
 * @cckPart contentWrapper
 * @cckPart remove
 * @param props - The Chip props.
 * @returns The rendered chip.
 */
export const Chip: ChipComponent = Object.assign(ChipImpl, { displayName: 'Chip' });
