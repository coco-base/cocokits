import { createContext, MutableRefObject, useContext, useRef } from 'react';

import { getElementAnchorPosition } from '@cocokits/common-utils';

import { getOverlayAnimationProps, getOverlayStyles } from './overlay.animation';
import { OverlayPortalManager } from './overlay-portal.manager';
import { OverlayAnimationType, OverlayConfig, OverlayRef } from '../models/overlay.model';

export const OverlayContext = createContext<OverlayRef<any, any> | null>(null);

export function useOverlayRef<TData, TResult>() {
  return useContext(OverlayContext) as OverlayRef<TData, TResult>;
}

export function useOverlayManager<TData, TResult>(overlayId: string) {
  const managerRef = useRef(OverlayPortalManager.getWithId<TData, TResult>(overlayId));
  return managerRef.current;
}

// internal hooks
export function useOverlayAnimation(props: {
  config: OverlayConfig;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  backdropRef: MutableRefObject<HTMLDivElement | null>;
}) {
  const contentTranslateRef = useRef({ x: 0, y: 0 });

  const isNoneAnimation =
    props.config.positionStrategy.type === 'auto' &&
    props.config.positionStrategy.animationType === OverlayAnimationType.None;

  const backdropDuration = isNoneAnimation ? 0 : 100;
  const contentDuration = isNoneAnimation ? 0 : 150;

  const throwMissingElementsError: () => never = () => {
    const missingElements = [];
    if (!props.containerRef.current) {
      missingElements.push('containerRef');
    }
    if (!props.contentRef.current) {
      missingElements.push('contentRef');
    }

    throw new Error(`Missing elements by run overlay animation: ${missingElements.join(', ')}`);
  };

  const runEnterAnimation = () => {
    if (!props.containerRef.current || !props.contentRef.current) {
      throwMissingElementsError();
    }

    const anchorPosition =
      props.config.positionStrategy.type === 'auto'
        ? { x: 0, y: 0 }
        : getElementAnchorPosition(
          props.contentRef.current,
          props.config.positionStrategy.connectTo,
          props.config.positionStrategy.anchorPoint
        );

    const styles = getOverlayStyles(props.config);
    const animationProps = getOverlayAnimationProps(props.config, 'enter', anchorPosition);

    contentTranslateRef.current = { ...anchorPosition };

    // Apply styles
    Object.assign(props.containerRef.current.style, styles.container);
    Object.assign(props.backdropRef.current?.style ?? {}, styles.backdrop);
    Object.assign(props.contentRef.current.style, styles.content);

    // Animation
    return Promise.all([
      props.backdropRef.current?.animate(animationProps.backdrop, { duration: backdropDuration, fill: 'both' })
        .finished,
      props.contentRef.current.animate(animationProps.content, { duration: contentDuration, fill: 'both' }).finished,
    ]);
  };

  const runExitAnimation = () => {
    if (!props.containerRef.current || !props.contentRef.current) {
      throwMissingElementsError();
    }

    const animationProps = getOverlayAnimationProps(props.config, 'leave', contentTranslateRef.current);

    return Promise.all([
      props.backdropRef.current?.animate(animationProps.backdrop, { duration: backdropDuration, fill: 'both' })
        .finished,
      props.contentRef.current.animate(animationProps.content, { duration: contentDuration, fill: 'both' }).finished,
    ]);
  };

  return {
    runEnterAnimation,
    runExitAnimation,
  };
}
