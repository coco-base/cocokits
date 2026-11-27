'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useDialogContext } from './dialog-context';
import type { DialogRenderProps, DialogSectionProps, DialogState } from './dialog.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The names the three sections show in the error of a part used outside a Root. */
const PART_NAMES = { header: 'Dialog.Header', body: 'Dialog.Body', footer: 'Dialog.Footer' } as const;

/**
 * The shared hook of `Dialog.Header`, `Dialog.Body` and `Dialog.Footer`: a `<div>` with no role, the class of the
 * part and the theme attributes. Internal.
 *
 * @param part - Which section this is.
 * @param props - The part props.
 * @returns The rendered element.
 */
export function useDialogSection(part: keyof typeof PART_NAMES, props: DialogSectionProps): ReactElement {
  const { render, ref, ...rest } = props;
  const context = useDialogContext(PART_NAMES[part]);
  const themeAttrs = useThemeAttrs(dialogAnatomy)[part];
  const machineProps = getDialogProps({ id: context.id, open: context.open }, context.dispatch)[part];
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const merged = mergeProps(
    { ...themeAttrs, ...toReactProps(machineProps), ref: mergedRef },
    rest,
  ) as unknown as DialogRenderProps;
  return renderElement<DialogRenderProps, DialogState>(render, 'div', merged, { open: context.open });
}
