'use client';
import { useWebsiteContext } from 'apps/website/app/app.context';
import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@cocokits/common-icons';
import { Button } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import styles from './welcome.module.scss';
import { Brand } from '../../brands/brand';

export function Welcome() {
  const context = useWebsiteContext();
  if (!context) {
    return null;
  }

  const { colorMode } = context;

  const isDark = colorMode === 'dark';
  const imageSrc = isDark ? '/components-preview-dark.png' : '/components-preview-light.png';

  return (
    <div className={styles.welcome__host}>
      <div className={styles['welcome__overlay-wrapper']}>
        <Image className={styles['welcome__overlay-image']} width={828} height={556} src={imageSrc} alt="CocoKits" />
        <div className={styles['welcome__overlay-effect']}></div>
      </div>

      <div className={styles.welcome__content}>
        <h1 className={styles.welcome__title}>Bring your design system to life</h1>
        <p className={styles.welcome__description}>
          CocoKits is a comprehensive design system language and CDK that enables you to create highly efficient web
          applications with powerful UI components.
        </p>

        <div className={styles['welcome__actions-wrapper']}>
          <Link href="https://github.com/coco-base/cocokits" rel="noopener noreferrer">
            <Button>GitHub</Button>
          </Link>
          <Link href="#section__frameworks" rel="noopener noreferrer">
            <Button color="secondary">
              Get Started
              <SvgIcon icon={Icons.arrowRight} />
            </Button>
          </Link>
        </div>

        <div className={styles['welcome__ds-title']}>SUPPORTED DESIGN SYSTEMS</div>
        <div className={styles['welcome__ds-wrapper']}>
          <Link className="auto-underline" href="https://cocokits.com" target="_blank" rel="noopener noreferrer">
            <Brand name="cocokits" />
          </Link>

          <Link
            className="auto-underline"
            href="https://framesxdesign.com/?aff=wzMlE8"
            target="_blank"
            rel="noopener noreferrer">
            <Brand name="frames-x" />
          </Link>

          <Link href="/support-design-system" rel="noopener noreferrer">
            <div className={styles['welcome__ds-empty-spot']}>1 spot available</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
