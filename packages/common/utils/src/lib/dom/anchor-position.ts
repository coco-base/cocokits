/** @module DOM */

/**
 * Defines anchor point positions for element positioning.
 *
 * These anchor points determine how one element should be positioned
 * relative to another element.
 *
 * @enum {string}
 */
export enum ElementAnchorPoint {
  /** Position the element at the top-left corner of the source */
  TopLeft = 'TopLeft',
  /** Position the element at the top-right corner of the source */
  TopRight = 'TopRight',
  /** Position the element at the bottom-right corner of the source */
  BottomRight = 'BottomRight',
  /** Position the element at the bottom-left corner of the source */
  BottomLeft = 'BottomLeft',

  // TODO:
  // TopCenter = 'TopCenter',
  // RightCenter = 'RightCenter',
  // BottomCenter = 'BottomCenter',
  // LeftCenter = 'LeftCenter',
}

/**
 * Calculates the position coordinates needed to place a target element
 * at a specified anchor point relative to a source element.
 *
 * @param {HTMLElement} targetElement - The element to be positioned
 * @param {HTMLElement} sourceElement - The reference element to position against
 * @param {ElementAnchorPoint} anchorPoint - The desired anchor point position
 * @returns {{ x: number; y: number }} Coordinates representing the position offset
 *
 * @example
 * // Position a dropdown menu below a button
 * const button = document.getElementById('dropdown-button');
 * const menu = document.getElementById('dropdown-menu');
 *
 * const position = getElementAnchorPosition(
 *   menu,
 *   button,
 *   ElementAnchorPoint.BottomLeft
 * );
 *
 * menu.style.transform = `translate(${position.x}px, ${position.y}px)`;
 */
export function getElementAnchorPosition(
  targetElement: HTMLElement,
  sourceElement: HTMLElement,
  anchorPoint: ElementAnchorPoint
): { x: number; y: number } {
  const targetReact = targetElement.getBoundingClientRect();
  const sourceRect = sourceElement.getBoundingClientRect();

  const translateXMap: Record<ElementAnchorPoint, number> = {
    [ElementAnchorPoint.TopLeft]: sourceRect.left - targetReact.left,
    [ElementAnchorPoint.TopRight]: sourceRect.right - targetReact.right,
    [ElementAnchorPoint.BottomRight]: sourceRect.right - targetReact.right,
    [ElementAnchorPoint.BottomLeft]: sourceRect.left - targetReact.left,
  };

  const translateYMap: Record<ElementAnchorPoint, number> = {
    [ElementAnchorPoint.TopLeft]: sourceRect.top - targetReact.top - targetReact.height,
    [ElementAnchorPoint.TopRight]: sourceRect.top - targetReact.top - targetReact.height,
    [ElementAnchorPoint.BottomRight]: sourceRect.top - targetReact.top + sourceRect.height,
    [ElementAnchorPoint.BottomLeft]: sourceRect.top - targetReact.top + sourceRect.height,
  };

  return {
    x: translateXMap[anchorPoint],
    y: translateYMap[anchorPoint],
  };
}
