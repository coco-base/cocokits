import { OverlayAnimationType, OverlayConfig, OverlayConnectElemOrigin } from '../../models/overlay-config.model';

interface OverlayAnimationParams {
  translateX: string; // % or px
  translateY: string; // % or px
  rotateX: number;
  rotateY: number;
  scale: number;
}

export function getAnimationEnd(contentWrapper: HTMLElement, overlayConfig: OverlayConfig) {
  const { translateX, translateY, rotateX, rotateY, scale } =
    overlayConfig.positionStrategy.type === 'connectToElement'
      ? getConnectedToElemAnimationEnd(
          contentWrapper,
          overlayConfig.positionStrategy.connectTo,
          overlayConfig.positionStrategy.origin
        )
      : getAutoAnimationEnd();

  return `translateX(${translateX}) translateY(${translateY}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
}

export function getAnimationStart(contentWrapper: HTMLElement, overlayConfig: OverlayConfig) {
  const { translateX, translateY, rotateX, rotateY, scale } =
    overlayConfig.positionStrategy.type === 'connectToElement'
      ? getConnectedToElemAnimationStart(
          contentWrapper,
          overlayConfig.positionStrategy.connectTo,
          overlayConfig.positionStrategy.origin
        )
      : getAutoAnimationStart(overlayConfig.positionStrategy.animationType);

  return `translateX(${translateX}) translateY(${translateY}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
}

// region ---------------- AUTO ----------------
function getAutoAnimationStart(animationType: OverlayAnimationType): OverlayAnimationParams {
  switch (animationType) {
    case OverlayAnimationType.TopToCenter:
    case OverlayAnimationType.ToTopLeft:
    case OverlayAnimationType.ToTopRight:
    case OverlayAnimationType.ToTopCenter:
      return { translateX: '0px', translateY: '-30%', rotateX: 10, rotateY: 0, scale: 1 };

    case OverlayAnimationType.RightToCenter:
    case OverlayAnimationType.ToRightCenter:
      return { translateX: '30%', translateY: '0px', rotateX: 0, rotateY: 10, scale: 1 };

    case OverlayAnimationType.BottomToCenter:
    case OverlayAnimationType.ToBottomLeft:
    case OverlayAnimationType.ToBottomRight:
    case OverlayAnimationType.ToBottomCenter:
      return { translateX: '0px', translateY: '30%', rotateX: -10, rotateY: 0, scale: 1 };

    case OverlayAnimationType.LeftToCenter:
    case OverlayAnimationType.ToLeftCenter:
      return { translateX: '-30%', translateY: '0px', rotateX: 0, rotateY: -10, scale: 1 };

    default:
      return { translateX: '0px', translateY: '0px', rotateX: 0, rotateY: 0, scale: 1 };
  }
}

function getAutoAnimationEnd(): OverlayAnimationParams {
  return {
    translateX: '0%',
    translateY: '0%',
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  };
}
// endregion

// region ---------------- CONNECT TO ELEMENT ----------------
function getConnectedToElemAnimationEnd(
  wrapperElem: HTMLElement,
  connectToElem: HTMLElement,
  origin: OverlayConnectElemOrigin
): OverlayAnimationParams {
  const { x, y } = getConnectedToElemAnimationTransform(wrapperElem, connectToElem, origin);
  return {
    translateX: `${x}px`,
    translateY: `${y}px`,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  };
}

function getConnectedToElemAnimationStart(
  wrapperElem: HTMLElement,
  connectToElem: HTMLElement,
  origin: OverlayConnectElemOrigin
): OverlayAnimationParams {
  const { x, y } = getConnectedToElemAnimationTransform(wrapperElem, connectToElem, origin);
  return {
    translateX: `${x}px`,
    translateY: `${y}px`,
    rotateX: 0,
    rotateY: 0,
    scale: 0.8,
  };
}

export function getConnectedToElemAnimationTransform(
  wrapperElem: HTMLElement,
  connectToElem: HTMLElement,
  origin: OverlayConnectElemOrigin
): { x: number; y: number } {
  const connectToElemReact = connectToElem.getBoundingClientRect();
  const wrapperElementRect = wrapperElem.getBoundingClientRect();

  switch (origin) {
    case OverlayConnectElemOrigin.TopLeft:
      return {
        x: connectToElemReact.left - wrapperElementRect.left,
        y: connectToElemReact.top - wrapperElementRect.top - wrapperElementRect.height,
      };

    case OverlayConnectElemOrigin.TopRight:
      return {
        x: connectToElemReact.right - wrapperElementRect.right,
        y: connectToElemReact.top - wrapperElementRect.top - wrapperElementRect.height,
      };

    case OverlayConnectElemOrigin.BottomRight:
      return {
        x: connectToElemReact.right - wrapperElementRect.right,
        y: connectToElemReact.top - wrapperElementRect.top + connectToElemReact.height,
      };

    case OverlayConnectElemOrigin.BottomLeft:
      return {
        x: connectToElemReact.left - wrapperElementRect.left,
        y: connectToElemReact.top - wrapperElementRect.top + connectToElemReact.height,
      };

    default:
      return { x: 0, y: 0 };
  }
}

export function setConnectedToElemAnimationStyle(wrapperElem: HTMLElement, origin: OverlayConnectElemOrigin) {
  const transformOrigin = getConnectedToElemTransformOrigin(origin);

  wrapperElem.style.position = 'absolute';
  wrapperElem.style.transformOrigin = transformOrigin;
}

function getConnectedToElemTransformOrigin(origin: OverlayConnectElemOrigin) {
  switch (origin) {
    case OverlayConnectElemOrigin.TopLeft:
      return 'bottom left';

    case OverlayConnectElemOrigin.TopRight:
      return 'bottom right';

    case OverlayConnectElemOrigin.BottomLeft:
      return 'top left';

    case OverlayConnectElemOrigin.BottomRight:
      return 'top right';

    default:
      return '';
  }
}
