import { Component, computed, input, signal } from '@angular/core';

import { IconButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';

import { ExampleArgs } from './_story.config';

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
        return Icons.volumeMute;
      case 1:
        return Icons.volumeOff;
      case 2:
        return Icons.volumeLow;
      case 3:
        return Icons.volume;
      case 4:
        return Icons.volumeHigh;
      default:
        return Icons.volumeHigh;
    }
  });
  protected readonly Icons = Icons;

  increaseVolume() {
    this.volume.set(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, this.volume() + 1)));
  }

  decreaseVolume() {
    this.volume.set(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, this.volume() - 1)));
  }
}
