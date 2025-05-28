import * as _ from 'lodash';
import Link from 'next/link';
import React from 'react';

import { AngularLog, HtmlLog, ReactLog, VueLog, WebComponentLog } from './logos';

interface FrameworksProps {
  framework: 'angular' | 'react' | 'vue' | 'html' | 'web-components';
  active?: boolean;
}

const TITLES: Record<FrameworksProps['framework'], string> = {
  angular: 'Angular',
  react: 'React',
  vue: 'Vue',
  html: 'HTML',
  'web-components': 'Web Components',
};

const LOGO: Record<FrameworksProps['framework'], React.FC<void>> = {
  angular: AngularLog,
  react: ReactLog,
  vue: VueLog,
  html: HtmlLog,
  'web-components': WebComponentLog,
};

const LINKS: Record<FrameworksProps['framework'], string> = {
  angular: 'https://angular.cocokits.com',
  react: 'https://react.cocokits.com',
  vue: '',
  html: '',
  'web-components': '',
};

export const Framework = ({ framework, active = false }: FrameworksProps) => {
  if (active) {
    return (
      <Link href={LINKS[framework]} target="_blank">
        <div className="framework-item__host framework-item__host--active">
          <div className="framework-item__logo">{LOGO[framework]()}</div>
          <div className="framework-item__title">{TITLES[framework]}</div>
          <div className="framework-item__text">{active ? 'Read docs ->' : 'Coming soon'}</div>
        </div>
      </Link>
    );
  }
  return (
    <div className="framework-item__host">
      <div className="framework-item__logo">{LOGO[framework]()}</div>
      <div className="framework-item__title">{TITLES[framework]}</div>
      <div className="framework-item__text">{active ? 'Read docs ->' : 'Coming soon'}</div>
    </div>
  );
};
