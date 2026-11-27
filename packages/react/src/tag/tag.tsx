'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getTagProps, tagAnatomy } from '@cocokits/machines/tag';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { TagProps, TagRenderProps, TagState } from './tag.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TagImpl({ render, ref, children, ...rest }: TagProps): ReactElement {
  const parts = getTagProps();
  const themeAttrs = useThemeAttrs(tagAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as TagRenderProps;
  // The part's children win over the element's own: the Tag renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<TagRenderProps, TagState>(element, 'span', props, {});
}

/** The {@link Tag} component and its `displayName`. */
interface TagComponent {
  (props: TagProps): ReactElement;
  displayName: string;
}

/**
 * A short label that says a status or a category, such as "Paid", "Beta" or "Owner". It renders a `<span>` of static
 * text: it is not focusable and does nothing on click.
 *
 * To remove or select a value, use a Chip; to show a count or a dot on an element, use a Badge. Native `span` props
 * pass through, and `ref` reaches the element.
 *
 * The Tag has no role and no ARIA attributes, so screen readers read its text where it is. When the text changes
 * and the change must be announced, write `role="status"` on the Tag yourself.
 *
 * @example
 * <Tag>Paid</Tag>
 * <Tag>
 *   <SvgIcon iconName="check" />
 *   Passed
 * </Tag>
 * @cckPart root
 * @param props - The Tag props.
 * @returns The rendered span.
 */
export const Tag: TagComponent = Object.assign(TagImpl, { displayName: 'Tag' });
