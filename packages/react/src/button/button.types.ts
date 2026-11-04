import type {
  ButtonHTMLAttributes,
  ComponentPropsWithRef,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefCallback,
} from 'react';
import type { ButtonProps as MachineButtonProps } from '@cocokits/machines/button';

/** The public state of the Button, passed to the function form of `render`. */
export interface ButtonState {
  /** Whether the Button is disabled. */
  readonly disabled: boolean;
}

/**
 * The props the function form of `render` receives: the native button props, merged with the
 * Button's own. Spread all of them, including `ref`, onto one element. Their event handlers are
 * typed for any `HTMLElement`, so the spread also fits an `<a>`.
 */
export interface ButtonRenderProps extends Omit<ButtonHTMLAttributes<HTMLElement>, 'color' | 'disabled' | 'onClick'> {
  /** Any `data-*` attribute, such as `data-disabled` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** Native `disabled`; present on a disabled `<button>` only. */
  readonly disabled?: true;
  /** The merged ref: the Button's `ref`, the rendered element's own `ref` and the Button's internal one. */
  readonly ref: RefCallback<HTMLElement>;
  /** The consumer's `onClick`. A disabled link never reaches it: the guard stops the click first. */
  readonly onClick?: MouseEventHandler<HTMLElement>;
}

/** Props of the {@link Button}. Native button props pass through. */
export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'disabled'>, Pick<MachineButtonProps, 'disabled'> {
  /** The button label, rendered inside the element as written. */
  children?: ReactNode | undefined;
  /**
   * Replaces the rendered element: an element, or a function of the merged props and the
   * {@link ButtonState}. The element form works from a Server Component; the function form
   * does not (a function is not serialisable). The function form must spread all the props it
   * receives, including `ref`, onto one element. A link also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI).
   */
  readonly render?: ReactElement | ((props: ButtonRenderProps, state: ButtonState) => ReactElement) | undefined;
  /**
   * Whether the rendered element is a native `<button>`. `false` renders link semantics:
   * CocoKits supports a link as the only non-button element (`<a>` or a link component that
   * renders one), with no `role`, no `tabIndex` 0 and no Space handling.
   *
   * @cckSemantic none
   * @remarks Base UI's flag; `false` renders link semantics (CocoKits supports a link as the only non-button element).
   * @defaultValue true
   */
  readonly nativeButton?: boolean | undefined;
}
