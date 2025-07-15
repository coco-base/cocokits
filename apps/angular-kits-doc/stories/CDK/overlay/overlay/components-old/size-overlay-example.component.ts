// import { AsyncPipe } from '@angular/common';
// import { Component, inject } from '@angular/core';

// import { OverlayRef } from '../../../src/services/overlay-ref';

// @Component({
//   imports: [AsyncPipe],
//   template: `
//     <p class="p-sm-regular-4">Resize the textarea to change the overlay size</p>
//     <textarea></textarea>
//     <button class="story-button" (click)="onCloseClick()">Close</button>
//   `,
//   styles: [
//     `
//       :host {
//         min-width: inherit;
//         max-width: inherit;
//         min-height: inherit;
//         max-height: inherit;
//         width: 100%;
//         height: 100%;
//         display: flex;
//         flex-direction: column;
//         gap: 24px;
//         overflow: auto;
//       }
//     `,
//   ],
//   host: {
//     class: 'story-card',
//   },
// })
// export class SizeOverlayExampleComponent {
//   overlayRef = inject(OverlayRef);

//   onCloseClick() {
//     this.overlayRef.close();
//   }
// }
