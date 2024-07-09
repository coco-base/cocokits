import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

function trim(value: string) {
  return value.trim();
}

@Component({
  selector: 'cck-highlight',
  standalone: true,
  template: ` <pre><code class="hljs" [innerHTML]="src()"></code></pre> `,
  styleUrl: './highlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HighlightComponent {
  public code = input.required({ transform: trim });

  protected src = computed<string>(() => hljs.highlight(this.code(), { language: 'typescript' }).value);

  constructor() {
    hljs.registerLanguage('typescript', typescript);
  }
}
