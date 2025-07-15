/** @module pipes */
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * A pipe that sanitizes a string of HTML to bypass Angular's built-in security and display trusted HTML content.
 * It uses Angular's `DomSanitizer` service to safely allow HTML content to be rendered.
 *
 * @example
 * In this example, the HTML content of `someHtmlString` will be rendered as trusted HTML, bypassing Angular's security checks.
 * ```html
 * <div [innerHTML]="someHtmlString | trustHtml"></div>
 * ```
 */
@Pipe({
  name: 'trustHtml',
})
export class TrustHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  /** @ignore */
  transform(htmlString: string | undefined): unknown {
    return htmlString ? this.sanitizer.bypassSecurityTrustHtml(htmlString) : '';
  }
}
