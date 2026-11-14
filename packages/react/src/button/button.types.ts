import type { ReactElement, ReactNode } from 'react';
import type { ButtonElementProps, ButtonRenderProps, ButtonState } from '../internal/button-element.types';

export type { ButtonRenderProps, ButtonState };

/** Props of the {@link Button}. Native button props pass through. */
export interface ButtonProps extends ButtonElementProps {
  /**
   * The label of the button, which is also its accessible name. When not set, the button has no name, so you must
   * give it an `aria-label`.
   *
   * @example
   * <Button>Save</Button>
   */
  children?: ReactNode | undefined;
  /**
   * Replaces the `<button>` of the Button. Pass an element, or a function of the merged props and the
   * {@link ButtonState}. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the Button renders a `<button>`. A link also needs `nativeButton={false}`.
   *
   * The element form works from a Server Component. The function form does not, because a function cannot be sent
   * from the server.
   *
   * @example
   * <Button nativeButton={false} render={<a href="/inbox" />}>
   *   Inbox
   * </Button>
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: ReactElement | ((props: ButtonRenderProps, state: ButtonState) => ReactElement) | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives a link. A link is the
   * only other element the Button takes: an `<a>`, or a link component that renders one.
   *
   * A link gets no `role`, no `tabindex` and no Space key handling.
   *
   * @cckSemantic none
   * @cckParity A flag; `false` renders link semantics (CocoKits supports a link as the only non-button element).
   * @defaultValue true
   */
  readonly nativeButton?: boolean | undefined;
}
