/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'html',
    filename: 'volume-button.component.html',
    code: `
<button
  cck-icon-button
  [type]="'<%=buttonType%>'"
  [size]="'<%=buttonSize%>'"
  [color]="'<%=buttonColor%>'"
  (click)="decreaseVolume()">
  <cck-svg-icon [icon]="LineIcons.minus"></cck-svg-icon>
</button>

<div class="volume-display-wrapper">
  <cck-svg-icon
    class="volume-icon"
    [size]="'<%=volumeIconSize%>'"
    [color]="null"
    [icon]="volumeIcon()"/>
  
  <span class="volume-label">{{ volume() }}</span>
</div>

<button
  cck-icon-button
  [type]="'<%=buttonType%>'"
  [size]="'<%=buttonSize%>'"
  [color]="'<%=buttonColor%>'"
  (click)="increaseVolume()">
  <cck-svg-icon [icon]="LineIcons.plus"></cck-svg-icon>
</button>
`,
  },
  {
    language: 'scss',
    filename: 'volume-button.component.scss',
    code: `
:host {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-label {
  font: var(--volume-text-font);
  color: var(--volume-text-color);
}

.volume-icon {
  fill: var(--volume-text-color);
}

.volume-display-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}
`,
  },
  {
    language: 'angular-ts',
    filename: 'volume-button.component.ts',
    code: `
import { Component, computed, input, signal } from '@angular/core';

import { IconButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { LineIcons } from '@cocokits/common-icons';


const MAX_VOLUME = 4;
const MIN_VOLUME = 0;

@Component({
  selector: 'cck-volume-button',
  imports: [IconButtonComponent, SvgIconComponent],
  templateUrl: './volume-button.component.html',
  styleUrls: ['./volume-button.component.scss'],
})
export class VolumeButtonComponent {


  protected volume = signal(3);

  protected volumeIcon = computed(() => {
    switch (this.volume()) {
      case 0:
        return LineIcons.volumeMute;
      case 1:
        return LineIcons.volumeOff;
      case 2:
        return LineIcons.volumeLow;
      case 3:
        return LineIcons.volume;
      case 4:
        return LineIcons.volumeHigh;
      default:
        return LineIcons.volumeHigh;
    }
  });
  protected readonly LineIcons = LineIcons;

  increaseVolume() {
    this.volume.set(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, this.volume() + 1)));
  }

  decreaseVolume() {
    this.volume.set(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, this.volume() - 1)));
  }
}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--volume-text-font: var(--text-lg-regular);
        --volume-text-color: var(--color-font-default);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--volume-text-font: var(--text-base-font-regular);
        --volume-text-color: var(--text-dark-primary);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
