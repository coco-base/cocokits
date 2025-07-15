import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { hasNotValue, hasValue } from '@cocokits/common-utils';

import { AvatarTemplateDirective } from './avatar.tmpl-directive';
import { AvatarGroupComponent } from '../avatar-group/avatar-group.component';
import { AvatarLabelComponent } from '../avatar-label/avatar-label.component';

@Component({
  imports: [CommonModule],
  selector: 'cck-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class AvatarComponent extends _UiBaseComponent<'avatar'> {
  protected readonly componentName = 'avatar';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.imgStatus() === 'loading', classes: this.classNames().loading },
    { if: this.imgStatus() === 'loaded', classes: this.classNames().loaded },
    { if: this.imgStatus() === 'error', classes: this.classNames().fallback },
    { if: this.wihImage(), classes: this.classNames().withImage },
    { if: this.wihLabel(), classes: this.classNames().withLabel },
    { if: this.contentTemp(), classes: this.classNames().withCustomContent },
    { if: this.clickable(), classes: this.classNames().clickable },
  ]);

  private avatarGroup = inject(AvatarGroupComponent, { optional: true });
  private avatarLabel = inject(AvatarLabelComponent, { optional: true });

  /** @ignore */
  override type = computed(() => this._type() ?? this.avatarGroup?.type() ?? this.avatarLabel?.type());

  /** @ignore */
  override size = computed(() => this._size() ?? this.avatarGroup?.size() ?? this.avatarLabel?.size());

  /** @ignore */
  override color = computed(() => this._color() ?? this.avatarGroup?.color() ?? this.avatarLabel?.color());

  /** @ignore */
  override additional = computed(() => ({
    ...this._additional(),
    ...this.avatarGroup?.additional(),
    ...this.avatarLabel?.additional(),
  }));

  /**
   * Source URL for the avatar image.
   * @storybook argType will be overridden by storybook
   */
  public src = input<string>();

  /**
   * Alternative text for the avatar image for accessibility purposes.
   * @storybook argType will be overridden by storybook
   */
  public alt = input<string>();

  /**
   * Source URL for a fallback image to display when the primary image fails to load.
   * @storybook argType will be overridden by storybook
   */
  public fallbackSrc = input<string>();

  /**
   * Source URL for a placeholder image to display while the primary image is loading.
   * @storybook argType will be overridden by storybook
   */
  public placeholderSrc = input<string>();

  /**
   * Text label to display when no image source is provided.
   * @storybook argType will be overridden by storybook
   */
  public label = input<string>();

  /**
   * Whether the avatar should be clickable.
   * @storybook argType will be overridden by storybook
   */
  public clickable = input<boolean>(true);

  private contentTemp = contentChild(AvatarTemplateDirective, { read: TemplateRef<HTMLElement> });
  private defaultTemp = viewChild.required<TemplateRef<HTMLElement>>('defaultTemp');

  protected wihImage = computed(() => !this.contentTemp() && hasValue(this.src()));
  protected wihLabel = computed(() => !this.contentTemp() && hasNotValue(this.src()) && hasValue(this.label()));

  protected template = computed(() => this.contentTemp() ?? this.defaultTemp());

  protected imgStatus = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  protected canShowImg = computed(() => this.wihImage() && this.imgStatus() !== 'error');

  protected canShowPlaceholder = computed(
    () => this.wihImage() && this.imgStatus() === 'loading' && hasValue(this.placeholderSrc())
  );

  protected canShowFallback = computed(
    () => this.wihImage() && this.imgStatus() === 'error' && hasValue(this.fallbackSrc())
  );

  protected canShowLabel = computed(() => this.wihLabel() && hasValue(this.label()));

  private __setImageLoadingState = effect(
    () => {
      this.imgStatus.set(this.wihImage() ? 'loading' : 'idle');
    },
    { allowSignalWrites: true }
  );
}
