import { ElementAnchorPoint } from '@cocokits/common-utils';
import { OverlayAnimationType, OverlayConfig } from '../models/overlay.model';

export const OVERLAY_DEFAULT_CONFIG: OverlayConfig<any> = {
  zIndex: 10,
  disableBackdropClose: false,
  parentElement: document.body,
  data: null,
  panelClass: [],
  hasBackdrop: true,
  allowInteractionBehindOverlay: false,
  positionStrategy: {
    type: 'auto',
    animationType: OverlayAnimationType.BottomToCenter,
  },
};

export const OVERLAY_STYLE: {
  container: {
    alignItemsMap: Record<OverlayAnimationType, 'flex-start' | 'flex-end' | 'center'>;
    justifyContentMap: Record<OverlayAnimationType, 'flex-start' | 'flex-end' | 'center'>;
  };
  content: {
    transformOriginMap: Record<ElementAnchorPoint, 'top left' | 'top right' | 'bottom left' | 'bottom right'>;
    transform: (translate: { x: number; y: number }) => string;
  };
} = {
  container: {
    // Auto Animation
    alignItemsMap: {
      // align-items: flex-start
      [OverlayAnimationType.ToTopCenter]: 'flex-start',
      [OverlayAnimationType.ToTopLeft]: 'flex-start',
      [OverlayAnimationType.ToTopRight]: 'flex-start',

      // align-items: flex-end
      [OverlayAnimationType.ToBottomCenter]: 'flex-end',
      [OverlayAnimationType.ToBottomRight]: 'flex-end',
      [OverlayAnimationType.ToBottomLeft]: 'flex-end',

      // align-items: center
      [OverlayAnimationType.ToRightCenter]: 'center',
      [OverlayAnimationType.TopToCenter]: 'center',
      [OverlayAnimationType.RightToCenter]: 'center',
      [OverlayAnimationType.BottomToCenter]: 'center',
      [OverlayAnimationType.LeftToCenter]: 'center',
      [OverlayAnimationType.ToLeftCenter]: 'center',
      [OverlayAnimationType.None]: 'center',
    },

    // Auto Animation
    justifyContentMap: {
      // align-items: flex-start
      [OverlayAnimationType.ToRightCenter]: 'flex-end',
      [OverlayAnimationType.ToTopRight]: 'flex-end',
      [OverlayAnimationType.ToBottomRight]: 'flex-end',

      // align-items: flex-end
      [OverlayAnimationType.ToLeftCenter]: 'flex-start',
      [OverlayAnimationType.ToTopLeft]: 'flex-start',
      [OverlayAnimationType.ToBottomLeft]: 'flex-start',

      // align-items: center
      [OverlayAnimationType.ToBottomCenter]: 'center',
      [OverlayAnimationType.ToTopCenter]: 'center',
      [OverlayAnimationType.TopToCenter]: 'center',
      [OverlayAnimationType.RightToCenter]: 'center',
      [OverlayAnimationType.BottomToCenter]: 'center',
      [OverlayAnimationType.LeftToCenter]: 'center',
      [OverlayAnimationType.None]: 'center',
    },
  },
  content: {
    // ConnectTo Animation: transform-origin
    transformOriginMap: {
      [ElementAnchorPoint.TopLeft]: 'bottom left',
      [ElementAnchorPoint.TopRight]: 'bottom right',
      [ElementAnchorPoint.BottomRight]: 'top right',
      [ElementAnchorPoint.BottomLeft]: 'top left',
    },
    transform: (translate) => `translate(${translate.x}px, ${translate.y}px) rotateX(0deg) rotateY(0deg) scale(1)`,
  },
};

export const OVERLAY_ANIMATION: {
  backdrop: {
    enter: Record<string, [string, string]>;
    leave: Record<string, [string, string]>;
  };
  contentAuto: {
    enter: (type: OverlayAnimationType) => Record<string, [string, string]>;
    leave: (type: OverlayAnimationType) => Record<string, [string, string]>;
  };
  contentConnect: {
    enter: (translate: { x: number; y: number }) => Record<string, [string, string]>;
    leave: (translate: { x: number; y: number }) => Record<string, [string, string]>;
  };
} = {
  // Backdrop: Shared
  backdrop: {
    enter: { opacity: ['0', '*'] },
    leave: { opacity: ['*', '0'] },
  },
  // Content: Auto Animation
  contentAuto: {
    enter: (type) => ({
      transform: [CONTENT_AUTO_ANIM_TRANSFORM_MAP[type], '*'],
      opacity: ['0', '*'],
    }),
    leave: (type) => ({
      transform: ['*', CONTENT_AUTO_ANIM_TRANSFORM_MAP[type]],
      opacity: ['*', '0'],
    }),
  },
  // Content: ConnectTo Animation
  contentConnect: {
    enter: (translate) => ({
      transform: [
        `translate(${translate.x}px, ${translate.y}px) rotateX(0deg) rotateY(0deg) scale(0.8)`,
        `translate(${translate.x}px, ${translate.y}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      ],
      opacity: ['0', '*'],
    }),
    leave: (translate) => ({
      transform: [
        `translate(${translate.x}px, ${translate.y}px) rotateX(0deg) rotateY(0deg) scale(1)`,
        `translate(${translate.x}px, ${translate.y}px) rotateX(0deg) rotateY(0deg) scale(0.8)`,
      ],
      opacity: ['*', '0'],
    }),
  },
};

const CONTENT_AUTO_ANIM_TRANSFORM_MAP: Record<OverlayAnimationType, string> = {
  [OverlayAnimationType.TopToCenter]: 'translate(0px, -30%) rotateX(10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToTopLeft]: 'translate(0px, -30%) rotateX(10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToTopRight]: 'translate(0px, -30%) rotateX(10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToTopCenter]: 'translate(0px, -30%) rotateX(10deg) rotateY(0deg) scale(1)',

  [OverlayAnimationType.RightToCenter]: 'translate(30%, 0px) rotateX(0deg) rotateY(10deg) scale(1)',
  [OverlayAnimationType.ToRightCenter]: 'translate(30%, 0px) rotateX(0deg) rotateY(10deg) scale(1)',

  [OverlayAnimationType.BottomToCenter]: 'translate(0px, 30%) rotateX(-10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToBottomLeft]: 'translate(0px, 30%) rotateX(-10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToBottomRight]: 'translate(0px, 30%) rotateX(-10deg) rotateY(0deg) scale(1)',
  [OverlayAnimationType.ToBottomCenter]: 'translate(0px, 30%) rotateX(-10deg) rotateY(0deg) scale(1)',

  [OverlayAnimationType.LeftToCenter]: 'translate(-30%, 0px) rotateX(0deg) rotateY(-10deg) scale(1)',
  [OverlayAnimationType.ToLeftCenter]: 'translate(-30%, 0px) rotateX(0deg) rotateY(-10deg) scale(1)',

  [OverlayAnimationType.None]: '',
};
