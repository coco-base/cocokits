import { ComponentRef, ViewContainerRef } from '@angular/core';

import { OverlayComponent } from '../components/overlay/overlay.component';
import { OverlayRef } from '../services/overlay-ref';

export interface RenderedOverlay<TData, TResult> {
  overlayComponentRef: ComponentRef<OverlayComponent>;
  viewContainerRef: ViewContainerRef;
  overlayRef: OverlayRef<TData, TResult>;
  afterClose: Promise<TResult | undefined>;
}

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
   * The 'viewContainerRef' the overlay must be rendered.
   * @default AppComponent's 'ViewContainerRef'
   */
  viewContainerRef?: ViewContainerRef;

  /**
   * The position of overlay. it can be 'auto' or connected to the element
   */
  positionStrategy: OverlayPositionStrategy; // Default is 'auto

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
  origin: OverlayConnectElemOrigin;
}

export enum OverlayConnectElemOrigin {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
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
