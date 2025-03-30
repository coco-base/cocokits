import { JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, viewChild, ViewEncapsulation } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-button';
import { FormFieldComponent, InputComponent } from '@cocokits/angular-form-field';
import { OverlayRef } from '@cocokits/angular-overlay';

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
