import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { TrustHtmlPipe } from '@cocokits/angular-utils';
import { ThemeSvgIcon } from '@cocokits/core';

@Component({
  selector: 'cck-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  imports: [TrustHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class SvgIconComponent extends _UiBaseComponent<'svgIcon'> {
  protected readonly componentName = 'svgIcon';
  protected extraHostElementClassConditions = computed(() => []);

  private elemRef = inject(ElementRef);

  /**
   * Input property that requires an SVG icon configuration or svg as string
   */
  public icon: InputSignal<ThemeSvgIcon | string> = input.required<ThemeSvgIcon | string>();

  protected legacyIcon: Signal<ThemeSvgIcon | null> = computed(() => {
    const icon = this.icon();
    if (typeof icon === 'string') {
      return null;
    }

    return icon;
  });

  private __updateDOMSvg = effect((onCleanup) => {
    const svgString = this.icon();
    const classNames = this.classNames().svg;

    if (typeof svgString !== 'string') {
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('Error parsing SVG string');
    }

    const svgElement = doc.getElementsByTagName('svg')[0];

    svgElement.classList.add(...classNames.split(' '));
    this.elemRef.nativeElement.appendChild(svgElement);

    onCleanup(() => {
      this.elemRef.nativeElement.removeChild(svgElement);
    });
  });
}
