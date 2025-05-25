// Don't remove `React` import, without this we get an error on opening overlay in react doc page
import React, { FC } from 'react';
import * as ReactDOM from 'react-dom/client';

import { lazyPromise, ScrollLocker } from '@cocokits/common-utils';

import { Overlay } from './overlay';
import { OVERLAY_DEFAULT_CONFIG } from './overlay.config';
import { OverlayConfigStandalone, OverlayRef, RenderedOverlay } from '../models/overlay.model';

export function openStandaloneOverlay<TData = unknown, TResult = unknown>(
  componentRef: FC<OverlayRef<TData, TResult>> | React.ReactNode,
  _config: Partial<OverlayConfigStandalone<TData>> = {}
): RenderedOverlay<TResult> {
  const scrollLocker = ScrollLocker.globalInstance();

  const closedPromise = lazyPromise<TResult | void>();
  const afterClosedPromise = lazyPromise<TResult | void>();

  const config: OverlayConfigStandalone<TData> = { ...OVERLAY_DEFAULT_CONFIG, ..._config };

  const decorator = config.decorator ?? ((element) => element);

  const container = createContainerElement(config.zIndex);
  config.parentElement.appendChild(container);
  const root = ReactDOM.createRoot(container);

  scrollLocker.lock();

  afterClosedPromise.promise.then(() => {
    root.unmount();
    container.remove();
    scrollLocker.unlock();
  });

  const close = (result?: TResult) => {
    closedPromise.resolve(result);
  };

  root.render(
    decorator(
      <Overlay config={config} afterClosedPromise={afterClosedPromise} closedPromise={closedPromise}>
        {typeof componentRef === 'function'
          ? React.createElement(componentRef, { data: config.data, close })
          : componentRef}
      </Overlay>
    )
  );

  return {
    afterClosed: afterClosedPromise.promise,
    closed: closedPromise.promise,
    close,
  };
}

function createContainerElement(zIndex: number) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = `${zIndex}`;
  container.style.perspective = '1000px';
  container.style.display = 'flex';
  container.style.position = 'fixed';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.pointerEvents = 'none';
  container.style.touchAction = 'none';
  // container.style.transition = 'opacity 200ms';

  return container;
}
