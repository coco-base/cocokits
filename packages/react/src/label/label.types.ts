import type { ComponentPropsWithRef, ReactNode } from 'react';

/**
 * Props of the {@link Label}. Native `label` props pass through, and `ref` reaches the element. The element is
 * always a `<label>`, so there is no `render`.
 */
export interface LabelProps extends Omit<ComponentPropsWithRef<'label'>, 'color' | 'children'> {
  /**
   * The text of the label, which names the control. When not set, the label is empty.
   *
   * @example
   * <Label htmlFor="email">Email address</Label>
   */
  readonly children?: ReactNode;
  /**
   * The id of the control that the label names. A value you pass always wins. When not set, a label inside a
   * `FormField` with a CocoKits control takes the id of that control.
   *
   * @cckSemantic label.for
   * @cckParity Spelled `htmlFor`, as the native `for` attribute.
   */
  readonly htmlFor?: string | undefined;
}
