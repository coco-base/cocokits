import { useStaticText } from '@cocokits/react-utils';
import { deepMerge } from '@cocokits/common-utils';
import { createPortal } from 'react-dom';
import { Overlay } from './overlay';
import { useOverlayManager } from './overlay.hooks';
import { OVERLAY_DEFAULT_CONFIG } from './overlay.config';
import { OverlayConfig } from '../models/overlay.model';



export interface OverlayPortalProps<TData = unknown> extends Partial<OverlayConfig<TData>> {
  portalId: string;
  children: React.ReactNode | React.ReactNode[];
}


export const OverlayPortal = <TData, TResult>(props: OverlayPortalProps) => {
  const portalId = useStaticText(props.portalId);
  const manager = useOverlayManager<TData, TResult>(portalId);
  const managerState = manager.getState(); 

  if (!managerState.isOpened) {
    return null;
  }

  const componentConfig: OverlayConfig<TData> = {
    panelClass: props.panelClass ?? OVERLAY_DEFAULT_CONFIG.panelClass,
    hasBackdrop: props.hasBackdrop ?? OVERLAY_DEFAULT_CONFIG.hasBackdrop,
    disableBackdropClose: props.disableBackdropClose ?? OVERLAY_DEFAULT_CONFIG.disableBackdropClose,
    parentElement: props.parentElement ?? OVERLAY_DEFAULT_CONFIG.parentElement,
    positionStrategy: props.positionStrategy ?? OVERLAY_DEFAULT_CONFIG.positionStrategy,
    size: props.size ?? OVERLAY_DEFAULT_CONFIG.size,
    data: props.data ?? OVERLAY_DEFAULT_CONFIG.data,

  };
  const config = deepMerge(componentConfig, managerState.managerConfig);

  return createPortal(
    <Overlay
      config={config}
      afterClosedPromise={managerState.afterClosedPromise}
      closedPromise={managerState.closedPromise}>
      {props.children}
    </Overlay>,
    config.parentElement
  );
};

