'use client';

import type { ReactElement } from 'react';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';
import { useButtonElement } from '../internal/use-button-element';
import type { ButtonProps } from './button.types';

function ButtonImpl(props: ButtonProps): ReactElement {
  return useButtonElement(props, { name: 'Button', anatomy: buttonAnatomy, getProps: getButtonProps });
}

/** The {@link Button} component and its `displayName`. */
interface ButtonComponent {
  (props: ButtonProps): ReactElement;
  displayName: string;
}

/**
 * A button that runs an action. It renders a `<button type="button">`, or a link with `render` and
 * `nativeButton={false}`. Native button props pass through, and `ref` reaches the element.
 *
 * A disabled `<button>` gets the native `disabled`. A disabled link gets `aria-disabled="true"` and
 * `tabindex="-1"`, and the Button stops its clicks.
 *
 * The Button stops the click of a disabled link in the capture phase, so no `onClick` runs. Your `onClickCapture`
 * runs before that. When it calls `preventDefault()`, the Button does not stop the click.
 *
 * The name of the Button is its content. For a button with only an icon, use the Icon button; it needs `aria-label`
 * or `aria-labelledby`.
 *
 * @example
 * <Button onClick={save}>Save</Button>
 * @cckPart root
 * @param props - The Button props.
 * @returns The rendered element.
 */
export const Button: ButtonComponent = Object.assign(ButtonImpl, { displayName: 'Button' });
