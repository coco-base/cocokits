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

/** The props the shared Button implementation takes. The public props of Button and IconButton build on it. */
export interface ButtonElementProps
  extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'disabled'>, Pick<MachineButtonProps, 'disabled'> {
  readonly children?: ReactNode | undefined;
  readonly render?: ReactElement | ((props: ButtonRenderProps, state: ButtonState) => ReactElement) | undefined;
  readonly nativeButton?: boolean | undefined;
}
