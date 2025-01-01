import { JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, viewChild, ViewEncapsulation } from '@angular/core';

import { OverlayRef } from '@cocokits/angular-cdk';
import { ButtonComponent, FormFieldComponent, InputComponent } from '@cocokits/angular-components';

@Component({
  standalone: true,
  imports: [JsonPipe, FormFieldComponent, InputComponent, ButtonComponent],
  templateUrl: './example-overlay-default-overlay.component.html',
  styleUrl: './example-overlay-default-overlay.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'example-overlay-default-overlay__host',
  },
})
export class ExampleOverlayDefaultOverlayComponent {
  overlayRef = inject(OverlayRef);

  private input = viewChild.required('input', { read: ElementRef });

  onCloseClick() {
    this.overlayRef.close({ text: this.input().nativeElement.value });
  }
}
