import { JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, viewChild } from '@angular/core';

import { OverlayRef } from '../../../src/services/overlay-ref';

@Component({
  standalone: true,
  imports: [JsonPipe],
  template: `
    <p class="p-sm-regular-4">THIS IS A OVERLAY</p>
    <p class="p-sm-regular-2"><b>Data: </b>{{ overlayRef.data | json }}</p>
    <input class="story-input" #input />
    <button class="story-button" (click)="onCloseClick()">Close</button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ],
  host: {
    class: 'story-card',
  },
})
export class DefaultOverlayExampleComponent {
  overlayRef = inject(OverlayRef);

  private input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  onCloseClick() {
    this.overlayRef.close({ text: this.input().nativeElement.value });
  }
}
