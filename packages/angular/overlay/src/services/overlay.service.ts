import {
  ApplicationRef,
  ComponentRef,
  inject,
  Injectable,
  Injector,
  StaticProvider,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';

import { OverlayRef } from './overlay-ref';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { OverlayAnimationType, OverlayConfig, RenderedOverlay } from '../models/overlay-config.model';

const DEFAULT_CONFIG: OverlayConfig<any> = {
  panelClass: [],
  hasBackdrop: true,
  disableBackdropClose: false,
  positionStrategy: {
    type: 'auto',
    animationType: OverlayAnimationType.BottomToCenter,
  },
  data: null,
};

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private applicationRef = inject(ApplicationRef);

  public open<TData, TResult = unknown>(
    componentOrTemplate: Type<any> | TemplateRef<any>,
    partialConfig: Partial<OverlayConfig<TData>> = {}
  ): RenderedOverlay<TData, TResult> {
    const config = { ...DEFAULT_CONFIG, ...partialConfig };

    const rootComponentRef = this.applicationRef.components[0];
    const viewContainerRef: ViewContainerRef =
      config.viewContainerRef || rootComponentRef.injector.get(ViewContainerRef);

    const overlayRef = new OverlayRef<TData, TResult>(componentOrTemplate, config);
    const providers: StaticProvider[] = [{ provide: OverlayRef, useValue: overlayRef }];
    const overlayComponentRef = viewContainerRef.createComponent(OverlayComponent<TData, TResult>, {
      injector: Injector.create({ providers }),
    });

    const afterClose = this.closeHandler<TData, TResult>(overlayRef, viewContainerRef, overlayComponentRef);

    return {
      overlayComponentRef: overlayComponentRef,
      viewContainerRef,
      overlayRef,
      afterClose,
    };
  }

  private closeHandler<TData, TResult>(
    overlayRef: OverlayRef<TData, TResult>,
    viewContainerRef: ViewContainerRef,
    overlayComponentRef: ComponentRef<OverlayComponent<TData, TResult>>
  ): Promise<TResult | undefined> {
    return new Promise<TResult | undefined>((resolve) => {
      overlayRef.close$.subscribe(() => {
        const indexView = viewContainerRef.indexOf(overlayComponentRef.hostView);
        viewContainerRef.remove(indexView);
      });

      overlayComponentRef.instance.closeAnimationDone$.subscribe((dialogResult) => {
        resolve(dialogResult);
      });
    });
  }
}
