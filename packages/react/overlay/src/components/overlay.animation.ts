import { OverlayAnimationType, OverlayConfig } from '../models/overlay-config.model';
import { ScrollLocker } from '@coco-kits/common-utils';

interface AnimationProps {
  config: OverlayConfig;
  contentElem: HTMLElement;
  backdropElem: HTMLElement;
}

export function runEnterAnimation(props: AnimationProps) {
  const ANIMATION_FN_MAP: Record<OverlayAnimationType, (props: AnimationProps) => void> = {
    [OverlayAnimationType.CenterTopToBottom]: enterAnimationCenterTopToBottom,
    [OverlayAnimationType.CenterBottomToTop]: enterAnimationCenterBottomToTop,
    [OverlayAnimationType.None]: enterAnimationNone,
  };

  const animationFn = ANIMATION_FN_MAP[props.config.animationType] ?? enterAnimationNone;
  animationFn(props);
}

function enterAnimationNone({ config, contentElem, backdropElem }: AnimationProps) {
  backdropElem.style.opacity = `1`;
  ScrollLocker.globalInstance().lock();
}

function enterAnimationCenterTopToBottom({ config, contentElem, backdropElem }: AnimationProps) {
  contentElem.style.opacity = '0';
  contentElem.style.transform = 'translateY(-30%) rotateX(20deg)';
  ScrollLocker.globalInstance().lock();

  // Wait for previous style applied to DOM
  setTimeout(() => {
    backdropElem.style.opacity = `1`;
    contentElem.style.opacity = '1';
    contentElem.style.transform = 'translateY(0) rotateX(0deg)';
  });
}

function enterAnimationCenterBottomToTop({ config, contentElem, backdropElem }: AnimationProps) {
  contentElem.style.opacity = '0';
  contentElem.style.transform = 'translateY(30%) rotateX(-20deg)';

  ScrollLocker.globalInstance().lock();

  // Wait for previous style applied to DOM
  setTimeout(() => {
    backdropElem.style.opacity = `1`;
    contentElem.style.opacity = '1';
    contentElem.style.transform = 'translateY(0) rotateX(0deg)';
  }, 100);
}
