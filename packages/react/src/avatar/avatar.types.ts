import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { AvatarImageLoadingStatus } from '@cocokits/machines/avatar';
import type { RenderProp } from '../internal/render-element';

export type { AvatarImageLoadingStatus };

/** The state of the Avatar root that the function form of `render` receives. */
export interface AvatarState {
  /** Whether the picture is ready: `idle`, `loading`, `loaded` or `error`. */
  readonly status: AvatarImageLoadingStatus;
}

/** The state of the Avatar fallback that the function form of `render` receives. */
export interface AvatarFallbackState extends AvatarState {
  /** Whether the fallback is hidden: the picture has loaded, or the `delayMs` has not passed. */
  readonly hidden: boolean;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part.
 * Pass all of them, `ref` and `children` included, to one element.
 */
export interface AvatarRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the part and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the part, as you wrote them. */
  readonly children: ReactNode;
}

/** An Avatar part: a function component with its `displayName`. */
export interface AvatarPart<P> {
  (props: P): ReactElement;
  displayName: string;
}

/** Props of the {@link AvatarRoot}. Native `span` props pass through, and `ref` reaches the element. */
export interface AvatarRootProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the `<span>` of the root. Pass an element, or a function of the merged props and the
   * {@link AvatarState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the part renders a `<span>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AvatarRenderProps, AvatarState> | undefined;
}

/** Props of the {@link AvatarImage}. Native `img` props pass through, and `ref` reaches the element. */
export interface AvatarImageProps extends Omit<ComponentPropsWithRef<'img'>, 'color' | 'src'> {
  /**
   * The address of the picture. When not set or empty, the status is `error` and the fallback shows.
   *
   * @cckSemantic avatar.image.src
   */
  readonly src?: string | undefined;
  /**
   * Called with the status of the picture when it changes: `loading`, then `loaded` or `error`. It never receives
   * `idle`, never repeats the last status, and is not called during a server render. A new `src` starts a new
   * sequence.
   *
   * @example
   * <Avatar.Image src={url} alt="Ada Park" onLoadingStatusChange={(status) => setStatus(status)} />
   * @cckSemantic avatar.image.loadingStatusChange
   * @cckParity The change callback of this component.
   */
  readonly onLoadingStatusChange?: ((status: AvatarImageLoadingStatus) => void) | undefined;
}

/** Props of the {@link AvatarFallback}. Native `span` props pass through, and `ref` reaches the element. */
export interface AvatarFallbackProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Milliseconds to wait, after mount, before the fallback may show. Until then it is `hidden`, also on the
   * server. A new value restarts the wait.
   *
   * When not set, the fallback shows from the server render on, until the picture has loaded.
   *
   * @cckSemantic avatar.fallback.delayMs
   */
  readonly delayMs?: number | undefined;
  /**
   * Replaces the `<span>` of the fallback. Pass an element, or a function of the merged props and the
   * {@link AvatarFallbackState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the part renders a `<span>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AvatarRenderProps, AvatarFallbackState> | undefined;
}
