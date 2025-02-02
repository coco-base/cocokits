'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './nav.module.scss';
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { Icons } from '@cocokits/common-icons';
import { useWebsiteContext } from 'apps/website/app/app.context';

export default function Nav() {
  const context = useWebsiteContext();

  if (!context) {
    return null;
  }

  const { colorMode, setColorMode } = context;

  return (
    <nav className={styles.nav}>
      <Image
        src={colorMode === 'dark' ? '/cocokits-full-logo-light.svg' : '/cocokits-full-logo-dark.svg'}
        width={208}
        height={42}
        alt="CocoKits Logo"
      />
      <div className={styles['nav__item-wrapper']}>
        
        <Link className={styles.nav__item} href="#section_features">
          Features
        </Link>
        <Link className={styles.nav__item} href="#section_frameworks">
          Frameworks
        </Link>
        <Link className={styles.nav__item} href="#section_for-designer">
          For Designers
        </Link>
        <Link className={styles.nav__item} href="#section_for-developers">
          For Developers
        </Link>
        <Link className={styles.nav__item} href="#section_join-us">
          Join Us
        </Link>
      </div>

      <div className={styles.nav__social}>
        <Link href="https://x.com/coco_kits" target="_blank" rel="noopener noreferrer">
          <IconButton>
            <SvgIcon icon={Icons.x}></SvgIcon>
          </IconButton>
        </Link>

        <Link href="https://github.com/coco-base/cocokits" target="_blank" rel="noopener noreferrer">
          <IconButton>
            <SvgIcon icon={Icons.github}></SvgIcon>
          </IconButton>
        </Link>

        <IconButton onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
          <SvgIcon icon={colorMode === 'dark' ? Icons.dark : Icons.light}></SvgIcon>
        </IconButton>
      </div>
    </nav>
  );
}
