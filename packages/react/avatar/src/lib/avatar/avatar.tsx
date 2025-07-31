import React, { useLayoutEffect } from 'react';

import { hasNotValue, hasValue } from '@cocokits/common-utils';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { AvatarGroupContext } from '../avatar-group/avatar-group';
import { AvatarLabelContext } from '../avatar-label/avatar-label';

export interface AvatarProps extends UIBaseComponentProps {
  /**
   * Source URL for the avatar image.
   */
  src?: string;

  /**
   * Alternative text for the avatar image for accessibility purposes.
   */
  alt?: string;

  /**
   * Source URL for a fallback image to display when the primary image fails to load.
   */
  fallbackSrc?: string;

  /**
   * Source URL for a placeholder image to display while the primary image is loading.
   */
  placeholderSrc?: string;

  /**
   * Text label to display when no image source is provided.
   */
  label?: string;

  /**
   * Whether the avatar should be clickable.
   * @defaultValue false
   */

  clickable?: boolean;

  /**
   * Use this template to display custom content inside the avatar component.
   * This is useful for advanced scenarios, such as displaying multiple images as a single avatar,
   * or having full control over the avatar's image rendering and logic.
   *
   * @note:
   * When a custom template is provided, all default content, css selectors, styles,
   * and component configurations related to child elements will be removed.
   * Only your custom template and the host component will be rendered.
   */
  contentTemp?: React.ReactNode;
}

export function Avatar({ clickable = false, ...restProps }: AvatarProps) {
  const avatarGroupContext = React.useContext(AvatarGroupContext);
  const avatarLabelContext = React.useContext(AvatarLabelContext);

  const type = restProps.type ?? avatarGroupContext?.type ?? avatarLabelContext?.type;
  const size = restProps.size ?? avatarGroupContext?.size ?? avatarLabelContext?.size;
  const color = restProps.color ?? avatarGroupContext?.color ?? avatarLabelContext?.color;
  const additional = { ...avatarGroupContext?.additional, ...restProps.additional, ...avatarLabelContext?.additional };

  const withImage = !restProps.contentTemp && hasValue(restProps.src);
  const withLabel = !restProps.contentTemp && hasNotValue(restProps.src) && hasValue(restProps.label);

  const [imageStatus, setImageStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('loading');

  const canShowImg = withImage && imageStatus !== 'error';
  const canShowPlaceholder = withImage && imageStatus === 'loading' && hasValue(restProps.placeholderSrc);
  const canShowFallback = withImage && imageStatus === 'error' && hasValue(restProps.fallbackSrc);
  const canShowLabel = withLabel && hasValue(restProps.label);

  useLayoutEffect(() => {
    setImageStatus(withImage ? 'loading' : 'idle');
  }, [restProps.src]);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'avatar',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: imageStatus === 'loading', classes: (cn) => [cn.loading] },
      { if: imageStatus === 'loaded', classes: (cn) => [cn.loaded] },
      { if: imageStatus === 'error', classes: (cn) => [cn.fallback] },
      { if: withImage, classes: (cn) => [cn.withImage] },
      { if: withLabel, classes: (cn) => [cn.withLabel] },
      { if: !!restProps.contentTemp, classes: (cn) => [cn.withCustomContent] },
      { if: clickable, classes: (cn) => [cn.clickable] },
    ],
  });

  return (
    <div className={hostClassNames}>
      {restProps.contentTemp || (
        <>
          {canShowImg && (
            <img
              className={classNames.image}
              src={restProps.src}
              alt={restProps.alt}
              style={{ display: imageStatus === 'loaded' ? 'block' : 'none' }}
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
            />
          )}

          {canShowPlaceholder && (
            <img className={classNames.placeholderImage} src={restProps.placeholderSrc} alt={restProps.alt} />
          )}

          {canShowFallback && (
            <img className={classNames.fallbackImage} src={restProps.fallbackSrc} alt={restProps.alt} />
          )}

          {canShowLabel && <span className={classNames.label}>{restProps.label}</span>}
        </>
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';
export default Avatar;
