export enum ElementAnchorPoint {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
  BottomRight = 'BottomRight',
  BottomLeft = 'BottomLeft',

  // TODO:
  // TopCenter = 'TopCenter',
  // RightCenter = 'RightCenter',
  // BottomCenter = 'BottomCenter',
  // LeftCenter = 'LeftCenter',
}

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
