import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { SvgIcon } from '@coco-kits/theme-core';

@Component({
  selector: 'cck-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SvgIconComponent {
  @Input({ required: true }) icon!: SvgIcon;

  private sanitizer = inject(DomSanitizer);

  protected get iconContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this.icon.content);
  }
}