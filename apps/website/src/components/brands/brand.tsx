'use client';
import Image from 'next/image';
import styles from './brand.module.scss';
import { useWebsiteContext } from 'apps/website/app/app.context';

interface BrandProps {
  name: 'cocokits' | 'frames-x';
  highlight?: boolean;
  className?: string;
}

const BRAND_NAMES = {
  cocokits: 'CocoKits',
  'frames-x': 'Frames X',
};

const BRAND_LOGOS = {
  light: {
    cocokits: '/cocokits-icon-logo-dark.svg',
    'frames-x': '/frames-x-icon-logo-dark.svg',
  },
  dark: {
    cocokits: '/cocokits-icon-logo-light.svg',
    'frames-x': '/frames-x-icon-logo-light.svg',
  },
};

const BRAND_LOGO_SIZE = {
  cocokits: styles['brand__logo--md'],
  'frames-x': styles['brand__logo--sm'],
};

export function Brand({ name, highlight = false, className = '' }: BrandProps) {
  const context = useWebsiteContext();
  if (!context) {
    return null;
  }

  const { colorMode } = context;

  return (
    <div className={`${styles.brand__wrapper} ${className}`}>
      <Image
        width={24}
        height={24}
        className={BRAND_LOGO_SIZE[name]}
        src={BRAND_LOGOS[colorMode][name]}
        alt={BRAND_NAMES[name]}
      />
      <div className={highlight ? styles['brand__text--highlight'] : styles.brand__text}>{BRAND_NAMES[name]}</div>
    </div>
  );
}
