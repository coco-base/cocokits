import { useEffect, useLayoutEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import { lazyPromise } from '@cocokits/common-utils';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { OverlayContext, useOverlayAnimation } from './overlay.hooks';
import { OverlayConfig, OverlayRef } from '../models/overlay.model';

interface OverlayProps<TData, TResult> {
  config: OverlayConfig<TData>;
  closedPromise: ReturnType<typeof lazyPromise<TResult | void>>;
  afterClosedPromise: ReturnType<typeof lazyPromise<TResult | void>>;
  children: React.ReactNode | React.ReactNode[];
}

export const Overlay = <TData, TResult>(props: OverlayProps<TData, TResult>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'overlay',
    props: {},
    extraHostElementClassConditions: [{ if: true, classes: () => props.config.panelClass }],
  });

  const { runEnterAnimation, runExitAnimation } = useOverlayAnimation({
    config: props.config,
    containerRef,
    contentRef,
    backdropRef,
  });

  const onBackdropClick = () => {
    if (props.config.disableBackdropClose) {
      return;
    }

    props.closedPromise.resolve();
  };

  useEffect(() => {
    return () => props.afterClosedPromise.resolve();
  }, []);

  useLayoutEffect(() => {
    props.closedPromise.promise.then(async (result) => {
      await runExitAnimation();
      props.afterClosedPromise.resolve(result);
    });

    runEnterAnimation();
  }, []);

  const overlayRef: OverlayRef<TData, TResult> = {
    data: props.config.data,
    close: (result) => {
      props.closedPromise.resolve(result);
    },
  };

  return (
    <OverlayContext.Provider value={overlayRef}>
      <StyledContainer
        ref={containerRef}
        className={hostClassNames}
        $allowInteraction={props.config.allowInteractionBehindOverlay}
        $zIndex={props.config.zIndex}>
        {props.config.hasBackdrop && (
          <StyledBackdrop ref={backdropRef} className={classNames.backdrop} onClick={onBackdropClick} />
        )}
        <StyledContentWrapper $size={props.config.size} ref={contentRef} className={classNames.contentWrapper}>
          {props.children}
        </StyledContentWrapper>
      </StyledContainer>
    </OverlayContext.Provider>
  );
};

const StyledContainer = styled.div<{ $allowInteraction: boolean; $zIndex: number }>`
  :where(&) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: ${(props) => props.$zIndex};
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
    touch-action: auto;
    pointer-events: auto;

    ${(props) =>
      props.$allowInteraction &&
      css`
        touch-action: none;
        pointer-events: none;
      `}
  }
`;

const StyledBackdrop = styled.div`
  :where(&) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    touch-action: initial;
    pointer-events: initial;
  }
`;

const StyledContentWrapper = styled.div<{ $size: OverlayConfig['size'] }>`
  :where(&) {
    position: relative;
    top: 0;
    left: 0;
    touch-action: initial;
    pointer-events: initial;

    ${(props) => css`
      height: ${props.$size?.height};
      max-height: ${props.$size?.maxHeight};
      max-width: ${props.$size?.maxWidth};
      min-height: ${props.$size?.minHeight};
      min-width: ${props.$size?.minWidth};
      width: ${props.$size?.width};
    `};
  }
`;

Overlay.displayName = 'Overlay';
export default Overlay;
