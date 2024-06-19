export interface OverlayConfig<TData = unknown> {
  animationType: OverlayAnimationType;
  disableBackdropClose: boolean; // Default is false
  parentElement: HTMLElement; // Default is body
  data: TData;
}

export enum OverlayAnimationType {
  None = 'none',
  CenterTopToBottom = 'center-top-to-bottom',
  CenterBottomToTop = 'center-bottom-to-top',
}

export interface OverlayRef<TData = unknown, TResult = unknown> {
  data: TData;
  close: (result?: TResult | undefined) => void;
}
