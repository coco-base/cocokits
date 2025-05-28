'use client';
import './join-us.scss';
import Link from 'next/link';

import { Icons } from '@cocokits/common-icons';
import { Button, SvgIcon } from '@cocokits/react-components';
import Image from 'next/image';
import { useCallback } from 'react';

export function JoinUs() {
  return (
    <div id="section__join-us" className="join-us__host">
      <h2>Join the team</h2>

      <p className="join-us__description">
        Join CocoKits to help build the open-source
        <br />
        framework of the future.
      </p>

      <div className="flex-row gap-lg mt-md">
        <Link href="#section__frameworks" rel="noopener noreferrer">
          <Button color="secondary">
            Get Started
            <SvgIcon icon={Icons.arrowRight} />
          </Button>
        </Link>

        <Link href="/collaboration.html" rel="noopener noreferrer" target="_blank">
          <Button>Join our team</Button>
        </Link>
      </div>

      <Image
        className="mt-xxl"
        width={2400}
        height={1468}
        src="/doc-page-screenshot.png"
        alt="Cocokits Doc page Join us"
      />

      <div className="join-us__footer">
        <SvgIcon icon={Icons.email} />

        <div className="join-us__footer-text">
          Get a custom demo. Discover the value of CocoKits for your project.
          <Link href="mailto:hello@cocokits.com" rel="noopener noreferrer">
            Contact us
            <SvgIcon color="brand" icon={Icons.arrowRight} />
          </Link>
        </div>

        <svg
          className="join-us__footer-corner-1"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M1.19209e-07 0H3V9H1.19209e-07V0Z" fill="#61EA94" />
          <path d="M9 4.76837e-07V3L0 3L1.19209e-07 0L9 4.76837e-07Z" fill="#61EA94" />
        </svg>

        <svg
          className="join-us__footer-corner-2"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M1.19209e-07 0H3V9H1.19209e-07V0Z" fill="#61EA94" />
          <path d="M9 4.76837e-07V3L0 3L1.19209e-07 0L9 4.76837e-07Z" fill="#61EA94" />
        </svg>

        <svg
          className="join-us__footer-corner-3"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M1.19209e-07 0H3V9H1.19209e-07V0Z" fill="#61EA94" />
          <path d="M9 4.76837e-07V3L0 3L1.19209e-07 0L9 4.76837e-07Z" fill="#61EA94" />
        </svg>

        <svg
          className="join-us__footer-corner-4"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M1.19209e-07 0H3V9H1.19209e-07V0Z" fill="#61EA94" />
          <path d="M9 4.76837e-07V3L0 3L1.19209e-07 0L9 4.76837e-07Z" fill="#61EA94" />
        </svg>
      </div>
    </div>
  );
}
