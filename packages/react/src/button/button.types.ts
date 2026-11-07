import type {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefCallback,
} from 'react';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';

/** The state of the Button that the function form of `render` receives. */
export interface ButtonState {
  /** Whether the Button is disabled. */
  readonly disabled: boolean;
}

/**
 * The props that the function form of `render` receives: the native button props merged with the props of the
 * Button. Pass all of them, `ref` included, to one element. The event handlers take any `HTMLElement`, so they also
 * fit an `<a>`.
 */
export interface ButtonRenderProps extends Omit<ButtonHTMLAttributes<HTMLElement>, 'color' | 'disabled' | 'onClick'> {
  /** Any `data-*` attribute, such as `data-disabled` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The native `disabled`. Only a disabled `<button>` has it. */
  readonly disabled?: true;
  /** The merged ref: the `ref` of the Button, the `ref` of the rendered element and the `ref` of the Button itself. */
  readonly ref: RefCallback<HTMLElement>;
  /** Your `onClick`. A disabled link never calls it, because the Button stops the click first. */
  readonly onClick?: MouseEventHandler<HTMLElement>;
}

/** Props of the {@link Button}. Native button props pass through. */
export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'disabled'>, Pick<MachineButtonProps, 'disabled'> {
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
