import type { Metadata } from 'next';
import './global.scss';
import Nav from '../src/components/nav/nav';
import { websiteThemeConfig } from '../theme/theme-config';
import App from './app';
// import { ThemeConfigContext } from '@cocokits/react-core';
// import { websiteThemeConfig } from '../theme/theme-config';

export const metadata: Metadata = {
  title: 'Home • CocoKits',
  description:
    'everything you need to build your project with any framework. We provide you with all you need, such as utilities, CDK, and core components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">

      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>

      <body>
        <App>
          <Nav/>
          <main>
            {children}
          </main>
        </App>
      </body>
    </html>
  );
}
