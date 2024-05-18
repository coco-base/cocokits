import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'trustHtml',
  standalone: true,
})
export class TrustHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(htmlString: string): unknown {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
}
