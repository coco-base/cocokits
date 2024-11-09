import { mergeClasses } from '@griffel/react';

import { useStyles } from './StorybookThemeIcon.style';

interface StorybookDarkThemeIconProps {
  size?: 'small';
  selected?: boolean;
}

export const StorybookDarkThemeIcon = ({ size, selected }: StorybookDarkThemeIconProps) => {
  const styles = useStyles();
  return (
    <svg
      className={mergeClasses(
        styles.dark,
        size === 'small' && styles.smallSize,
        selected && styles.selected
      )}
      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.5049 1.67111C11.6916 2.06743 11.5985 2.5391 11.2754 2.83488C9.8756 4.11608 9 5.95507 9 8.00002C9 11.866 12.134 15 16 15C18.0449 15 19.8839 14.1244 21.1651 12.7246C21.4609 12.4015 21.9326 12.3085 22.3289 12.4951C22.7252 12.6818 22.9539 13.1047 22.8931 13.5385C22.1442 18.8857 17.5534 23 12 23C5.92487 23 1 18.0752 1 12C1 6.44661 5.11437 1.85586 10.4615 1.10688C10.8953 1.04611 11.3182 1.2748 11.5049 1.67111Z">
      </path>
    </svg>
  );
};
