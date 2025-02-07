import React from 'react';

import { ElementAnchorPoint } from '@cocokits/common-utils';

export interface OverlayConfigStandalone<TData = unknown> extends OverlayConfig<TData> {
  decorator?: (element: React.ReactNode | React.ReactNode[]) => React.ReactNode;
}

/**
 * Configuration options for an overlay component.
 *
 * @template TData - The type of data to be passed to the overlay component.
 */
export interface OverlayConfig<TData = unknown> {
  /**
   * The z-index of the overlay. Default is 10
   * TODO: Add it to Angular component
   */
  zIndex: number;
  /**
   * The class names to be applied to the overlay host element.
   * @default []
   */
  panelClass: string[];

  /**
   * Determines if interaction with elements behind the overlay and backdrop is possible.
   * This setting is ignored if the overlay has a backdrop.
   * TODO: Add this config for angular too.
   */
  allowInteractionBehindOverlay: boolean;

  /**
   * Indicates whether the overlay has a backdrop.
   * @default true
   */
  hasBackdrop: boolean;

  /**
   * Disables closing the overlay when the backdrop is clicked. This setting is ignored if the overlay has no backdrop.
   * @default false
   */
  disableBackdropClose: boolean;

  /**
   * The parent element in which the overlay will be rendered.
   * @default body
   */
  parentElement: HTMLElement;

  /**
   * The strategy for positioning the overlay. It can be 'auto' or connected to an element.
   * @default OverlayPositionStrategyAuto
   */
  positionStrategy: OverlayPositionStrategy;

  /**
   * The fixed size of the overlay. If not provided, the overlay will take the size of its children elements.
   */
  size?: {
    height?: string; // px or %
    maxHeight?: string; // px or %
    maxWidth?: string; // px or %
    minHeight?: string; // px or %
    minWidth?: string; // px or %
    width?: string; // px or %
  };

  /**
   * Any data to be passed to the custom component within the overlay.
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
  close: (result?: TResult) => void;
}
