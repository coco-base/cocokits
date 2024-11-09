import  { useEffect, useRef } from 'react';
import { OverlayProps } from '../models/overlay-props.model';
import { runEnterAnimation } from './overlay.animation';
import styled from 'styled-components';


export const Overlay = <TData = unknown, TResult = unknown>(props: OverlayProps<TData, TResult>) => {

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
      <StyledBackdrop className="cck-overlay__backdrop" ref={backdropRef} onClick={() => {
        if (!props.config.disableBackdropClose) {
          props.close();
        }
      }}/>
      <StyledContent className="cck-overlay__content" ref={contentRef}>
        <props.componentRef {...props} />
      </StyledContent>
    </>
  );
};

// region ---------------- STYLES ----------------
const StyledBackdrop = styled.div`
    :where(&) {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: -1;
        transition: opacity 300ms;
        pointer-events: initial;
        touch-action: initial;
    }
`;

const StyledContent = styled.div`
    :where(&) {
        display: flex;
        position: relative;
        overflow: hidden;
        transition: opacity 500ms, transform 300ms;
        pointer-events: initial;
        touch-action: initial;
    }
`;
// endregion