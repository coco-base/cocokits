import { JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, input, signal, viewChild, ViewEncapsulation } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-button';
import { FormFieldComponent, InputComponent } from '@cocokits/angular-form-field';
import { OverlayAnimationType, OverlayService } from '@cocokits/angular-overlay';

import { ExampleOverlayDefaultOverlayComponent } from './example-overlay-default-overlay.component';

@Component({
  standalone: true,
  selector: 'cck-overlay-default',
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
