'use client';

import type { ReactElement } from 'react';
import { getIconButtonProps, iconButtonAnatomy } from '@cocokits/machines/icon-button';
import { useButtonElement } from '../internal/use-button-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useNameCheck } from '../internal/use-name-check';
import type { IconButtonProps } from './icon-button.types';

function IconButtonImpl({ ref, ...rest }: IconButtonProps): ReactElement {
  const trackNode = useNameCheck('IconButton', [rest['aria-label'], rest['aria-labelledby'], rest.title].join('|'));
  const mergedRef = useMergedRef<HTMLElement>(ref, trackNode, undefined);
  return useButtonElement(
    { ...rest, ref: mergedRef },
    { name: 'IconButton', anatomy: iconButtonAnatomy, getProps: getIconButtonProps },
  );
}

/** The {@link IconButton} component and its `displayName`. */
interface IconButtonComponent {
  (props: IconButtonProps): ReactElement;
  displayName: string;
}

/**
 * A button that shows only an icon. It has the behaviour and props of the Button: it renders a
 * `<button type="button">`, or a link with `render` and `nativeButton={false}`. Native button props pass through,
 * and `ref` reaches the element.
 *
 * A disabled `<button>` gets the native `disabled`. A disabled link gets `aria-disabled="true"` and
 * `tabindex="-1"`, and the IconButton stops its clicks in the capture phase. Your `onClickCapture` runs before that;
 * when it calls `preventDefault()`, the click is not stopped.
 *
 * It has no text, so it needs a name: `aria-label` or `aria-labelledby`, or a labelled `SvgIcon` inside. In
 * development, a missing name logs a `CocoKits:` error. Keep the icon inside decorative, so the button carries the
 * name. A toggle keeps one name and sets `aria-pressed`.
 *
 * @example
 * <IconButton aria-label="Add item">
 *   <SvgIcon iconName="plus" />
 * </IconButton>
 * @cckPart root
 * @param props - The IconButton props.
 * @returns The rendered element.
 */
export const IconButton: IconButtonComponent = Object.assign(IconButtonImpl, { displayName: 'IconButton' });
