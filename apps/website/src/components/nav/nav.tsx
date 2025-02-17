'use client';
import { useWebsiteContext } from 'apps/website/app/app.context';
import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@cocokits/common-icons';
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import styles from './nav.module.scss';

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
        
        <Link className={styles.nav__item} href="#section__features">
          Features
        </Link>
        <Link className={styles.nav__item} href="#section__frameworks">
          Frameworks
        </Link>
        <Link className={styles.nav__item} href="#section__for-designer">
          For Designers
        </Link>
        <Link className={styles.nav__item} href="#section__for-developer">
          For Developers
        </Link>
        <Link className={styles.nav__item} href="#section__join-us">
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

        {/* <IconButton onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
          <SvgIcon icon={colorMode === 'dark' ? Icons.dark : Icons.light}></SvgIcon>
        </IconButton> */}
      </div>
    </nav>
  );
}
