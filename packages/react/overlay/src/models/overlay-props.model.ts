import { OverlayConfig, OverlayRef } from './overlay-config.model';
import { FC } from 'react';

export interface OverlayProps<TData = unknown, TResult = unknown> extends OverlayRef<TData, TResult> {
  config: OverlayConfig<TData>;
  componentRef: FC<OverlayRef<TData, TResult>>;
}
