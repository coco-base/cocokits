import { AnimationEvent, AnimationOptions } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  OnInit,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { onceEventListener, OnceSubject } from '@cocokits/common-utils';

import { overlayAnimation } from './overlay.animation';
import { getAnimationEnd, getAnimationStart, setConnectedToElemAnimationStyle } from './overlay.animation.utils';
import { OverlayAnimationType } from '../../models/overlay-config.model';
import { OverlayRef } from '../../services/overlay-ref';

type AnimationState = { value: any } & AnimationOptions;

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [overlayAnimation.backdrop(), overlayAnimation.content(), overlayAnimation.overlay()],
  host: {
    '[class]': 'hostClass',
    '[class.cck-overlay--top-alignment]': 'isTopAlignment',
    '[class.cck-overlay--right-alignment]': 'isRightAlignment',
    '[class.cck-overlay--bottom-alignment]': 'isBottomAlignment',
    '[class.cck-overlay--left-alignment]': 'isLeftAlignment',
    '[@overlayAnim]': 'animationState',
    '(@overlayAnim.done)': 'onBackdropAnimationDone($event)',
    '(@overlayAnim.start)': 'onBackdropAnimationStart($event)',
    '[@.disabled]': 'disableAnimation',
  },
})
export class OverlayComponent<TData = any, TResult = any> implements OnInit {
  private injector = inject(Injector);
  protected overlayRef: OverlayRef<unknown, TResult> = inject(OverlayRef<TData, TResult>);

  protected hostClass = ['cck-overlay', ...this.overlayRef.config.panelClass];
  protected disableAnimation =
    this.overlayRef.config.positionStrategy.type === 'auto' &&
    this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.None;

  private closeAnimationDoneSubject$ = new OnceSubject<TResult | undefined>();

  /**
   * Emit an event when the overlay close animation has done and the component has been destroyed
   * @storybook argType will be overridden by storybook
   */
  public closeAnimationDone$ = this.closeAnimationDoneSubject$.asObservable();

  protected get isTopAlignment() {
    if (this.overlayRef.config.positionStrategy.type !== 'auto') {
      return false;
    }

    return (
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToTopCenter ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToTopLeft ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToTopRight
    );
  }

  protected get isRightAlignment() {
    if (this.overlayRef.config.positionStrategy.type !== 'auto') {
      return false;
    }

    return (
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToRightCenter ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToTopRight ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToBottomRight
    );
  }

  protected get isBottomAlignment() {
    if (this.overlayRef.config.positionStrategy.type !== 'auto') {
      return false;
    }

    return (
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToBottomCenter ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToBottomRight ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToBottomLeft
    );
  }

  protected get isLeftAlignment() {
    if (this.overlayRef.config.positionStrategy.type !== 'auto') {
      return false;
    }

    return (
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToLeftCenter ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToTopLeft ||
      this.overlayRef.config.positionStrategy.animationType === OverlayAnimationType.ToBottomLeft
    );
  }

  protected readonly OverlayAnimationType = OverlayAnimationType;
  protected animationState: AnimationState = { value: true };

  private contentWrapper = viewChild.required<ElementRef<HTMLElement>>('contentWrapper');
  private contentViewContainerRef = viewChild.required<ViewContainerRef, ViewContainerRef>('contentViewContainerRef', {
    read: ViewContainerRef,
  });

  ngOnInit() {
    isTemplateRef(this.overlayRef.componentOrTemplate)
      ? this.contentViewContainerRef().createEmbeddedView(
          this.overlayRef.componentOrTemplate,
          {},
          { injector: this.injector }
        )
      : this.contentViewContainerRef().createComponent(this.overlayRef.componentOrTemplate);

    if (this.overlayRef.config.positionStrategy.type === 'connectToElement') {
      setConnectedToElemAnimationStyle(
        this.contentWrapper().nativeElement,
        this.overlayRef.config.positionStrategy.origin
      );
    }
  }

  protected async onBackdropClick() {
    if (!this.overlayRef.config.disableBackdropClose) {
      this.overlayRef.close();
    }
  }

  protected async onBackdropAnimationDone(event: AnimationEvent) {
    if (event.toState === 'void') {
      const dialogResult = await firstValueFrom(this.overlayRef.close$);
      this.closeAnimationDoneSubject$.next(dialogResult);
    }
  }

  /**
   * Enter animation must be with css, because we need to calculate the position of wrapper element, when overlay is connected to other element
   */
  protected onBackdropAnimationStart(event: AnimationEvent) {
    if (event.fromState !== 'void') {
      return;
    }

    const TRANSITION = 'transform 200ms';
    const contentWrapperElem = this.contentWrapper().nativeElement;
    const transformStart = getAnimationStart(contentWrapperElem, this.overlayRef.config);
    const transformEnd = getAnimationEnd(contentWrapperElem, this.overlayRef.config);

    contentWrapperElem.style.transform = transformStart;

    onceEventListener(contentWrapperElem, 'transitionend', async () => {
      contentWrapperElem.style.transition = '';
    });

    requestAnimationFrame(() => {
      contentWrapperElem.style.transition = TRANSITION;
      contentWrapperElem.style.transform = transformEnd;
    });

    this.animationState = {
      value: true,
      params: {
        transformStart,
        transformEnd,
      },
    };
  }
}

function isTemplateRef<T = any>(ref: Type<T> | TemplateRef<T>): ref is TemplateRef<T> {
  return ref instanceof TemplateRef;
}
