import { OverlayAnimationType, OverlayConfig, OverlayRef } from '../models/overlay-config.model';
import React, { FC, useEffect, useRef } from 'react';
import { hasValue, ScrollLocker } from '@coco-kits/common-utils';
import { useStyles } from './Overlay.style';
import * as ReactDOM from 'react-dom/client';

const scrollLocker = ScrollLocker.globalInstance();

interface OverlayProps<TData = unknown, TResult = unknown> extends OverlayRef<TData, TResult> {
  config: OverlayConfig<TData>,
  componentRef: FC<OverlayRef<TData, TResult>>
}

export const OverLay = <TData = unknown, TResult = unknown>(props: OverlayProps<TData, TResult>) => {

  const style = useStyles();
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElem = contentRef.current;
    const backdropElem = backdropRef.current;

    if(!contentElem || !backdropElem) {
      return;
    }

    if(props.config.animationType === OverlayAnimationType.None) {
      backdropElem.style.opacity = `${props.config.backdropOpacity}`;
      scrollLocker.lock();
      return;
    }

    if(props.config.animationType === OverlayAnimationType.CenterTopToBottom) {
      contentElem.style.opacity = '0';
      contentElem.style.transform = 'translateY(-30%) rotateX(20deg)';
      scrollLocker.lock();

      setTimeout(() => {
        backdropElem.style.opacity = `${props.config.backdropOpacity}`;

        contentElem.style.opacity = '1';
        contentElem.style.transform = 'translateY(0) rotateX(0deg)';
      });
      return;
    }

    if(props.config.animationType === OverlayAnimationType.CenterBottomToTop) {
      contentElem.style.opacity = '0';
      contentElem.style.transform = 'translateY(30%) rotateX(-20deg)';

      scrollLocker.lock();

      setTimeout(() => {
        backdropElem.style.opacity = `${props.config.backdropOpacity}`;

        contentElem.style.opacity = '1';
        contentElem.style.transform = 'translateY(0) rotateX(0deg)';
      }, 100);

      return;
    }

  }, [])

  const ChildComponent = props.componentRef;
  return (
    <>
      <div className={style.backdrop} ref={backdropRef} onClick={() => {
        if(!props.config.disableBackdropClose) {
          props.close();
        }
      }}></div>
      <div className={style.content} ref={contentRef}>
        <ChildComponent {...props}/>
      </div>
    </>
  )
}



const DEFAULT_CONFIG: OverlayConfig<any> = {
  animationType: OverlayAnimationType.None,
  disableBackdropClose: false,
  backdropOpacity: 0.4,
  containerElement: document.body,
  data: null
}

export function openOverlay<TData = unknown, TResult = unknown>(componentRef: FC<OverlayRef<TData, TResult>>, _config: Partial<OverlayConfig<TData>> = {}) {

  return new Promise(resolve => {

    const config: OverlayConfig<TData> = { ...DEFAULT_CONFIG, ..._config };

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '200';
    container.style.perspective = '1000px';
    container.style.display = 'flex';
    container.style.position = 'fixed';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.pointerEvents = 'none';
    container.style.touchAction = 'none';
    container.style.transition = 'opacity 200ms';

    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    const onClose: OverlayRef<TData, TResult>['close'] = (result?) => {
      container.style.opacity = '0';
      setTimeout(() => {
        root.unmount();
        container.remove();
        scrollLocker.unlock();
        resolve(result);
      }, 200)
    }

    const overlayRef: OverlayRef<TData, TResult> = {
      data: config.data,
      close: onClose
    }

    const overlayProps: OverlayProps<TData, TResult> = {
      ...overlayRef,
      componentRef,
      config
    }

    root.render(
      <OverLay {...overlayProps}/>
    );
  })
}