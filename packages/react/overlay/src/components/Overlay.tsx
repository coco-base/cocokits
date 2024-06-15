import { OverlayAnimationType, OverlayConfig } from '../models/overlay-config.model';
import React, { useEffect, useRef } from 'react';
import { ScrollLocker } from '@coco-kits/common-utils';
import { useStyles } from './Overlay.style';
import { OverlayProps } from '../models/overlay-props.model';


export const OverLay = <TData = unknown, TResult = unknown>(props: OverlayProps<TData, TResult>) => {

  const style = useStyles();
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Enter Animation
  useEffect(() => {
    const contentElem = contentRef.current;
    const backdropElem = backdropRef.current;

    if (!contentElem || !backdropElem) {
      return;
    }

    runEnterAnimation({ config: props.config, contentElem, backdropElem});
  });


  return (
    <>
      <div className={style.backdrop} ref={backdropRef} onClick={() => {
        if (!props.config.disableBackdropClose) {
          props.close();
        }
      }}></div>
      <div className={style.content} ref={contentRef}>
        <props.componentRef {...props} />
      </div>
    </>
  );
};

interface AnimationProps {
  config: OverlayConfig,
  contentElem: HTMLElement,
  backdropElem: HTMLElement
}

function runEnterAnimation(props: AnimationProps) {

  const ANIMATION_FN_MAP: Record<OverlayAnimationType, (props: AnimationProps) => void> = {
    [OverlayAnimationType.CenterTopToBottom]: enterAnimationCenterTopToBottom,
    [OverlayAnimationType.CenterBottomToTop]: enterAnimationCenterBottomToTop,
    [OverlayAnimationType.None]: enterAnimationNone,
  }

  const animationFn = ANIMATION_FN_MAP[props.config.animationType] ?? enterAnimationNone;
  animationFn(props);
}

function enterAnimationNone({ config, contentElem, backdropElem }: AnimationProps) {
  backdropElem.style.opacity = `${config.backdropOpacity}`;
  ScrollLocker.globalInstance().lock();
}

function enterAnimationCenterTopToBottom({ config, contentElem, backdropElem }: AnimationProps) {
  contentElem.style.opacity = '0';
  contentElem.style.transform = 'translateY(-30%) rotateX(20deg)';
  ScrollLocker.globalInstance().lock();

  // Wait for previous style applied to DOM
  setTimeout(() => {
    backdropElem.style.opacity = `${config.backdropOpacity}`;
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
    backdropElem.style.opacity = `${config.backdropOpacity}`;
    contentElem.style.opacity = '1';
    contentElem.style.transform = 'translateY(0) rotateX(0deg)';
  }, 100);
}
