import { JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, input, signal, viewChild, ViewEncapsulation } from '@angular/core';

import { ExampleOverlayDefaultOverlayComponent } from './example-overlay-default-overlay.component';
import { OverlayAnimationType, OverlayConfig, OverlayService } from '@cocokits/angular-cdk';
import { ButtonComponent, FormFieldComponent, InputComponent } from '@cocokits/angular-components';
import { Overlay } from '../../../../../react/overlay/src/components/overlay';

@Component({
  standalone: true,
  selector: 'example-overlay-default',
  imports: [JsonPipe, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './example-overlay-default.component.html',
  styleUrl: './example-overlay-default.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'example-overlay-default__host',
  },
})
export class ExampleOverlayDefaultComponent {
  private overlay = inject(OverlayService);
  protected result = signal<any>(null);

  public hasBackdrop = input.required<boolean>();
  public disableBackdropClose = input.required<boolean>();
  public animationType = input.required<OverlayAnimationType>();

  private input = viewChild.required('input', { read: ElementRef });

  async onOpenClick() {
    const renderedOverlay = this.overlay.open(ExampleOverlayDefaultOverlayComponent, {
      hasBackdrop: this.hasBackdrop(),
      disableBackdropClose: this.disableBackdropClose(),
      positionStrategy: {
        type: 'auto',
        animationType: this.animationType(),
      },
      data: { text: this.input().nativeElement.value },
    });
    const result = await renderedOverlay.afterClose;
    this.result.set(result);
  }
}
