'use client';
import { useWebsiteContext } from './app.context';
import { ForDesigners } from '../src/components/home/for-users/for-designer';
import { ForDevelopers } from '../src/components/home/for-users/for-developers';
import { Frameworks } from '../src/components/home/frameworks/frameworks';
import { InsideCocoKits } from '../src/components/home/inside-cocokits/inside-cocokits';
import { JoinUs } from '../src/components/home/join-us/join-us';
import { UiComponents } from '../src/components/home/ui-components/ui-components';
import { Welcome } from '../src/components/home/welcome/welcome';
import Nav from '../src/components/nav/nav';

export default function Index() {
  const context = useWebsiteContext();

  if (!context) {
    return null;
  }

  return (
    <>
      <Nav />
      <main>
        <Welcome />
        <InsideCocoKits />
        <JoinUs />
        <Frameworks />
        <ForDesigners />
        <ForDevelopers />
        <UiComponents />
      </main>
    </>
  );
}
