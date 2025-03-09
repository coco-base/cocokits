import { Component, computed, input, signal } from '@angular/core';

import { IconButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { LineIcons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/volume-button.config';

const MAX_VOLUME = 4;
const MIN_VOLUME = 0;

@Component({
  standalone: true,
  selector: 'cck-volume-button',
  imports: [IconButtonComponent, SvgIconComponent],
  templateUrl: './volume-button.component.html',
  styleUrls: ['./volume-button.component.scss'],
})
export class VolumeButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();

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
