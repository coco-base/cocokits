import { ElementAnchorPoint } from '@cocokits/common-utils';

export interface OverlayConfig<TData = unknown> {
  /**
   * The class names, that should be applied to the overlay host element
   * @default []
   */
  panelClass: string[];

  /**
   * Whether the overlay has a backdrop.
   * @default true
   */
  hasBackdrop: boolean;

  /**
   * Disable the closing overlay on backdrop click. The config will be ignored when the overlay has no backdrop
   * @default false
   */
  disableBackdropClose: boolean;

  /**
   * The parent element in which the overlay will be rendered.
   * @default body
   */
  parentElement: HTMLElement;

  /**
   * The position of overlay. it can be 'auto' or connected to the element
   * @default OverlayPositionStrategyAuto
   */
  positionStrategy: OverlayPositionStrategy;

  /**
   * The fix size of overlay, if not provided it will take the size of children elements
   */
  size?: {
    height?: string; // px or %
    maxHeight?: string; // px or %
    maxWidth?: string; // px or %
    minHeight?: string; // px or %
    minWidth?: string; // px or %
    width?: string; // px or %
  };
  // Size
  //  - height: number | string
  //  - maxHeight: number | string
  //  - maxWidth: number | string
  //  - minHeight: number | string
  //  - minWidth: number | string
  //  - width: number | string

  /**
   * Any data that you want to send to your custom component
   */
  data: TData;

  // TODO:
  // autoFocus
  // scrollStrategies
  //  - block: Block scrolling
  //  - close: Close the overlay as soon as the user scrolls
  //  - noop: Do nothing on scroll.
  //  - reposition: Update the overlay's position on scroll.

  // positionStrategy
  //  - fixed
  //    - offsetX: number
  //    - offsetY: number
  //    - originX: 'start' | 'center' | 'end'
  //    - originY: 'top' | 'center' | 'bottom'
  //    - overlayX: 'start' | 'center' | 'end'
  //    - overlayY: 'top' | 'center' | 'bottom'
  //    - weight: number
}

export type OverlayPositionStrategy = OverlayPositionStrategyAuto | OverlayPositionStrategyConnectToElement;

export interface OverlayPositionStrategyAuto {
  type: 'auto';
  /**
   * The type of animation to open and close.
   * @default BottomToCenter
   */
  animationType: OverlayAnimationType;
}

export interface OverlayPositionStrategyConnectToElement {
  type: 'connectToElement';
  connectTo: HTMLElement;
  anchorPoint: ElementAnchorPoint;
}

export enum OverlayAnimationType {
  None = 'none',
  TopToCenter = 'top-to-center',
  RightToCenter = 'right-to-center',
  BottomToCenter = 'bottom-to-center',
  LeftToCenter = 'left-to-center',
  ToTopLeft = 'to-top-left',
  ToTopRight = 'to-top-right',
  ToBottomLeft = 'to-bottom-left',
  ToBottomRight = 'to-bottom-right',
  ToTopCenter = 'to-top-center',
  ToRightCenter = 'to-right-center',
  ToBottomCenter = 'to-bottom-center',
  ToLeftCenter = 'to-left-center',
}

export interface OverlayRef<TData = unknown, TResult = unknown> {
  data: TData;
  close: (result?: TResult) => void;
}

export interface RenderedOverlay<TResult> {
  afterClosed: Promise<TResult | void>;
  closed: Promise<TResult | void>;
}
