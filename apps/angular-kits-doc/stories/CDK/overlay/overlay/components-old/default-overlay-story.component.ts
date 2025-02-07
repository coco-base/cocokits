// import { JsonPipe } from '@angular/common';
// import { Component, ElementRef, inject, input, signal, viewChild, ViewContainerRef } from '@angular/core';

// import { ButtonComponent } from '@cocokits/angular-button';
// import { FormFieldComponent, InputComponent } from '@cocokits/angular-form-field';

// import { DefaultOverlayExampleComponent } from './default-overlay-example.component';
// import { OverlayConfig } from '../../../src/models/overlay-config.model';
// import { OverlayService } from '../../../src/services/overlay.service';

// @Component({
//   standalone: true,
//   selector: 'story-default',
//   imports: [JsonPipe, FormFieldComponent, InputComponent, ButtonComponent],
//   template: `
//     <div class="content">
//       <cck-form-field>
//         <input cckInput #input placeholder="Enter any text" />
//       </cck-form-field>
//       <p class="result-text"><b>Overlay Result: </b>{{ result() | json }}</p>
//       <button cck-button (click)="onOpenClick()">Open Overlay</button>
//     </div>
//     @if (customViewContainerRet()) {
//       <div class="container-ref story-overlay-container-ref">
//         <ng-container #containerRef></ng-container>
//       </div>
//     }
//   `,
//   styles: [
//     `
//       :host {
//         min-width: 400px;
//         display: flex;
//         align-items: center;
//         gap: 12px;
//       }
//       .content {
//         display: flex;
//         flex-direction: column;
//         align-items: baseline;
//         gap: 12px;
//       }
//       .container-ref {
//         position: relative;
//         width: 300px;
//         height: 300px;
//         border: 1px dashed var(--cck-storybook-color-border-alpha-default);
//       }
//       .result-text {
//         font: var(--cck-doc-text-sm-regular);
//         color: var(--cck-doc-color-font-1);
//       }
//     `,
//   ],
//   host: {
//     class: 'story-card',
//   },
// })
// export class DefaultOverlayStoryComponent {
//   overlayConfig = input<Partial<OverlayConfig>>({});
//   customViewContainerRet = input(false);

//   private overlay = inject(OverlayService);
//   result = signal<any>(null);

//   private input = viewChild.required('input', { read: ElementRef });
//   private containerRef = viewChild<ViewContainerRef, ViewContainerRef>('containerRef', { read: ViewContainerRef });

//   async onOpenClick() {
//     const renderedOverlay = this.overlay.open(DefaultOverlayExampleComponent, {
//       ...this.overlayConfig(),
//       viewContainerRef: this.containerRef(),
//       data: { text: this.input().nativeElement.value },
//     });
//     const result = await renderedOverlay.afterClose;
//     this.result.set(result);
//   }
// }
