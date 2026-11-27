'use client';

import type { ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { dividerAnatomy, getDividerProps } from '@cocokits/machines/divider';
import { mergeProps } from '../internal/merge-props';
import type { DividerProps } from './divider.types';

function DividerImpl({ orientation, decorative, ...props }: DividerProps): ReactElement {
  const parts = getDividerProps({ orientation, decorative });
  const themeAttrs = useThemeAttrs(dividerAnatomy);
  // `ref` is one of the props and reaches the `hr` as it is.
  return <hr {...mergeProps({ ...themeAttrs.root, ...toReactProps(parts.root) }, { ...props })} />;
}

/** The {@link Divider} component and its `displayName`. */
interface DividerComponent {
  (props: DividerProps): ReactElement;
  displayName: string;
}

/**
 * A thin line that separates content: between stacked blocks, or between the items of a row with
 * `orientation="vertical"`. It renders a native `<hr>`, which is a separator for assistive technology, so the element
 * is fixed and there is no `render`. Native `hr` props pass through, and `ref` reaches the element.
 *
 * It has no margin. The layout around it, such as a `gap`, sets the space.
 *
 * It is not focusable and handles no key. Put it where flow content is valid: not inside a `p`, `span`, `button` or
 * `label`, and not as a child of `ul` or `ol`. In a list, write `<li role="separator">` yourself.
 *
 * An `aria-label` names the separator. Where the line only repeats a grouping that headings, lists or landmarks give,
 * set `decorative`, and do not write a `role` of your own.
 *
 * @example
 * <Divider />
 * <div style={{ display: 'flex' }}>
 *   <a href="/a">A</a>
 *   <Divider orientation="vertical" />
 *   <a href="/b">B</a>
 * </div>
 * @cckPart root
 * @param props - The Divider props.
 * @returns The rendered hr.
 */
export const Divider: DividerComponent = Object.assign(DividerImpl, { displayName: 'Divider' });
