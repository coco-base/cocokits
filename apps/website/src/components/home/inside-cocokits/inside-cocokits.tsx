import './inside-cocokits.scss';

import { TokenSvg } from './token-svg';
import { UiComponentSvg } from './ui-components-svg';
import { CustomizeSvg } from './customize-svg';
import { InsideCocokitsFeature } from './inside-cocokits-feature';

export const InsideCocoKits = () => {
  return (
    <div id="section_features" className="inside-cocokits__host">
      <h2>What’s inside CocoKits?</h2>
      <p>Everything you need to build your application efficiently.</p>

      <div className="inside-cocokits__feature-wrapper">

        <InsideCocokitsFeature
          title="Tokens"
          description="Universal tokens and utilities to bring your design system to life and reduce maintenance costs."
          svgComponent={TokenSvg}
          linkText="Preview Tokens"
          href="https://angular.cocokits.com/?path=/docs/theme-config-tokens--docs"/>

        <InsideCocokitsFeature
          title="UI Components"
          description="Jump start your application development with flexible and reusable components."
          svgComponent={UiComponentSvg}
          linkText="Preview Components"
          href="https://angular.cocokits.com/?path=/docs/ui-components-button--docs" />

        <InsideCocokitsFeature
          title="Easy-to-use and customize"
          description="Build and customize design system themes with enterprise-grade flexibility and control."
          svgComponent={CustomizeSvg}
          linkText="Preview Config"
          href="https://angular.cocokits.com/?path=/docs/getting-started-advanced-configuration--docs" />

      </div>
    </div>
  );
};
