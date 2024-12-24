import { lazyPromise, ScrollLocker } from '@cocokits/common-utils';
import { OverlayConfig, RenderedOverlay } from '../models/overlay.model';
import { createComponentStore } from '@cocokits/react-utils';
import { OVERLAY_DEFAULT_CONFIG } from './overlay.config';

type OverlayPortalManagerState<TData, TResult> =
  | OverlayPortalManagerOpenState<TData, TResult>
  | OverlayPortalManagerCloseState;


interface OverlayPortalManagerOpenState<TData, TResult> {
  isOpened: true;
  managerConfig: Partial<OverlayConfig<TData>>;
  closedPromise: ReturnType<typeof lazyPromise<TResult | void>>;
  afterClosedPromise: ReturnType<typeof lazyPromise<TResult | void>>;
}


interface OverlayPortalManagerCloseState {
  isOpened: false;
}


export class OverlayPortalManager<TData, TResult> {
  private static instances = new Map<string, OverlayPortalManager<unknown, unknown | void>>();

  public static getWithId<TData, TResult>(id: string) {
    if (!this.instances.has(id)) {
      this.instances.set(id, new OverlayPortalManager(id));
    }

    return this.instances.get(id) as OverlayPortalManager<TData, TResult | undefined>;
  }

  public static removeWithId(id: string, { autoClose = true } = {}) {
    const instance = this.instances.get(id);

    if (!instance) {
      return;
    }

    if (autoClose) {
      instance.close();
    }

    this.instances.delete(id);
  }

  private state = createComponentStore<OverlayPortalManagerState<TData, TResult>>({ isOpened: false });

  constructor(private id: string) {}

  public getState() {
    return this.state.getState();
  }

  public open(_config: Partial<OverlayConfig<TData>>): RenderedOverlay<TResult> {
    const scrollLocker = ScrollLocker.globalInstance();

    const closedPromise = lazyPromise<TResult | void>();
    const afterClosedPromise = lazyPromise<TResult | void>();
    const config: OverlayConfig<TData> = { ...OVERLAY_DEFAULT_CONFIG, ..._config };

    afterClosedPromise.promise.then(() => {
      scrollLocker.unlock();
      this.state.setState({ isOpened: false });
    });

    this.state.setState({
      isOpened: true,
      managerConfig: config,
      closedPromise, afterClosedPromise
    });
  
    scrollLocker.lock();

    return {
      afterClosed: afterClosedPromise.promise,
      closed: closedPromise.promise,
      close: this.close.bind(this)
    };
  }

  public close(result?: TResult) {
    const state = this.state.getState();

    if (!state.isOpened) {
      return;
    }

    state.closedPromise.resolve(result);
  }

  public destroy() {
    this.close();
    OverlayPortalManager.removeWithId(this.id);
  }
}