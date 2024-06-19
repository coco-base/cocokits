import { Overlay, OverlayAnimationType, OverlayConfig, OverlayProps, OverlayRef } from '@coco-kits/react-overlay';
import React, { FC } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ScrollLocker } from '@coco-kits/common-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_CONFIG: OverlayConfig<any> = {
  animationType: OverlayAnimationType.None,
  disableBackdropClose: false,
  parentElement: document.body,
  data: null
}

export function openOverlay<TData = unknown, TResult = unknown>(componentRef: FC<OverlayRef<TData, TResult>>, _config: Partial<OverlayConfig<TData>> = {}) {

  const scrollLocker = ScrollLocker.globalInstance();

  return new Promise<TResult | undefined>(resolve => {

    const config: OverlayConfig<TData> = { ...DEFAULT_CONFIG, ..._config };

    const container = createContainerElement();
    config.parentElement.appendChild(container);
    const root = ReactDOM.createRoot(container);

    const onClose: OverlayRef<TData, TResult>['close'] = (result?) => {
      container.style.opacity = '0';

      // Wait for close animation (css transition for opacity)
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
      <Overlay {...overlayProps}/>
  );
  })
}

function createContainerElement() {
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

  return container;
}