import { useLayoutEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { OverlayConfig, OverlayRef } from "../models/overlay.model";
import { lazyPromise } from "@cocokits/common-utils";
import { OverLayContext, useOverlayAnimation } from "./overlay.hooks";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

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
    extraHostElementClassConditions: [
      { if: true, classes: () => props.config.panelClass },
    ],
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
  }

  return (
    <OverLayContext.Provider value={overlayRef}>
      <StyledContainer ref={containerRef} className={hostClassNames}>
        {props.config.hasBackdrop && (
          <StyledBackdrop ref={backdropRef} className={classNames.backdrop} onClick={onBackdropClick} />
        )}
        <StyledContentWrapper $size={props.config.size} ref={contentRef} className={classNames.contentWrapper}>
          {props.children}
        </StyledContentWrapper>
      </StyledContainer>
    </OverLayContext.Provider>
  );
};

const StyledContainer = styled.div`
  :where(&) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
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
  }
`;

const StyledContentWrapper = styled.div<{$size: OverlayConfig['size']}>`
  :where(&) {
    position: relative;
    top: 0;
    left: 0;

    ${props => css`
        height: ${props.$size?.height};
        max-height: ${props.$size?.maxHeight};
        max-width: ${props.$size?.maxWidth};
        min-height: ${props.$size?.minHeight};
        min-width: ${props.$size?.minWidth};
        width: ${props.$size?.width};
    `};

  }
`;
