import type { ComponentPropsWithRef, ReactNode } from 'react';

/**
 * Props of the {@link Label}. Native `label` attributes pass through to the root, and `ref`
 * reaches it. The element is fixed, so there is no `render`.
 */
export interface LabelProps extends Omit<ComponentPropsWithRef<'label'>, 'color' | 'children'> {
  /** The label text. */
  readonly children?: ReactNode;
  /**
   * The id of the control to label. Inside a FormField with a CocoKits control it defaults to that
   * control's id; an explicit value always wins.
   *
   * @cckSemantic label.for
   * @cckParity Spelled `htmlFor`, as the native `for` attribute.
   */
  readonly htmlFor?: string | undefined;
}
