import { screen } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { ChipList, type ChipListChangeDetails, type ChipListProps } from '../index';

/** The text box. */
export const textbox = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

/** The remove button of the chip with this text. */
export const removeOf = (text: string): HTMLElement => screen.getByRole('button', { name: text });

/** The chips, in document order. */
export const chips = (container: ParentNode = document): HTMLElement[] => [
  ...container.querySelectorAll<HTMLElement>('.cck-chip'),
];

/** The texts of the chips, in document order. */
export const chipTexts = (container: ParentNode = document): (string | null)[] =>
  chips(container).map((chip) => chip.querySelector('.cck-chip__content-wrapper')?.textContent ?? null);

/** The list root. */
export const listRoot = (): HTMLElement => {
  const root = document.querySelector<HTMLElement>('.cck-chip-list');
  if (!root) throw new Error('Expected a chip list.');
  return root;
};

/** The value, or a thrown error when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after the next animation frame, where the accessible-name check runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** A list the parent controls: it takes every change. */
export function Controlled({
  initial = [],
  onChange,
  ...rest
}: Omit<ChipListProps, 'value' | 'onValueChange'> & {
  readonly initial?: readonly string[];
  readonly onChange?: (value: readonly string[], details: ChipListChangeDetails) => void;
}): ReactElement {
  const [value, setValue] = useState<readonly string[]>(initial);
  return (
    <ChipList
      aria-label="Toppings"
      {...rest}
      value={value}
      onValueChange={(next, details) => {
        setValue(next);
        onChange?.(next, details);
      }}
    />
  );
}
