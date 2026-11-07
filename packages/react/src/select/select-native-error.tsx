import type { ReactElement } from 'react';
import type { SelectValidationMessageProps } from '@cocokits/machines/select';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** Props of {@link SelectNativeError}. */
export interface SelectNativeErrorProps {
  /** The element props the machine computes (`parts.validationMessage`). */
  readonly part: SelectValidationMessageProps;
  /** The browser's message after a blocked submit, or `null` while there is none. */
  readonly message: string | null;
}

/**
 * The message of a blocked submit, visually hidden; the trigger's `aria-describedby` points at it. Internal.
 *
 * @param props - The machine props of the element and the message.
 * @returns The element, or nothing without a message.
 */
export function SelectNativeError({ part, message }: SelectNativeErrorProps): ReactElement | null {
  if (message === null) return null;
  return (
    <span {...part} style={visuallyHiddenStyle}>
      {message}
    </span>
  );
}
