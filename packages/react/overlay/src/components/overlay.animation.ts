import { OverlayConfig } from '../models/overlay.model';
import { OVERLAY_ANIMATION, OVERLAY_STYLE } from './overlay.config';

export function getOverlayStyles(config: OverlayConfig<any>) {
  if (config.positionStrategy.type === 'auto') {
    // Auto Animation
    return {
      container: {
        alignItems: OVERLAY_STYLE.container.alignItemsMap[config.positionStrategy.animationType],
        justifyContent: OVERLAY_STYLE.container.justifyContentMap[config.positionStrategy.animationType],
      },
      backdrop: {},
      content: {},
    };
  }

  // ConnectToElement Animation
  return {
    container: {},
    backdrop: {},
    content: {
      transformOrigin: OVERLAY_STYLE.content.transformOriginMap[config.positionStrategy.anchorPoint],
    },
  };
}

export function getOverlayAnimationProps(
  config: OverlayConfig<any>,
  mode: 'enter' | 'leave',
  currentTranslate: { x: number; y: number }
) {
  if (config.positionStrategy.type === 'auto') {
    // Auto Animation
    return {
      backdrop: OVERLAY_ANIMATION.backdrop[mode],
      content: OVERLAY_ANIMATION.contentAuto[mode](config.positionStrategy.animationType),
    };
  }

  // ConnectToElement Animation
  return {
    backdrop: OVERLAY_ANIMATION.backdrop[mode],
    content: OVERLAY_ANIMATION.contentConnect[mode](currentTranslate),
  };
}
