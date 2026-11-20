'use client';

import { isValidElement, type Ref } from 'react';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { useMergedRef } from '../internal/use-merged-ref';
import type { SelectRender, SelectRenderProps } from './select.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** What {@link useSelectPartProps} merges. */
export interface SelectPartPropsInput {
  /** The part's own props: theme attributes, machine props. */
  readonly ours: Readonly<Record<string, unknown>>;
  /** The consumer's props, without `ref` and `render`. */
  readonly rest: Readonly<Record<string, unknown>>;
  /** The attributes the machine owns; a consumer value can never replace them. */
  readonly reserved: readonly string[];
  /** The consumer's `ref`. */
  readonly ref: Ref<HTMLElement> | undefined;
  /** The consumer's `render`. */
  readonly render: SelectRender | undefined;
  /** An internal ref to merge in, such as the Root's registration of the trigger. */
  readonly internalRef?: Ref<HTMLElement> | undefined;
}

/**
 * The props of a Select part: the part's own props under the consumer's, with the consumer's `ref`, the `ref` of an
 * element given through `render` and the internal one merged.
 *
 * @param input - The part's props, the consumer's and the refs.
 * @returns The merged props, ready for the render helper.
 */
export function useSelectPartProps(input: SelectPartPropsInput): SelectRenderProps {
  const { ours, rest, reserved, ref, render, internalRef } = input;
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, internalRef);
  return mergeProps({ ...ours, ref: mergedRef }, withoutReserved(rest, reserved)) as unknown as SelectRenderProps;
}
