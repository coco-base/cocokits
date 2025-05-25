import styled from 'styled-components';

interface StoryCanvasWrapperProps {
  className?: string;
  children: React.ReactNode | React.ReactNode[];
}

export function StoryCanvasWrapper({ className: classNames = '', children }: StoryCanvasWrapperProps) {
  return <StyledHost className={classNames}>{children}</StyledHost>;
}

const StyledHost = styled.div`
  position: relative;
  border-radius: var(--cck-doc-radius-md);
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: linear-gradient(
      90deg,
      var(--cck-doc-color-main-effect-surface-end) 0%,
      var(--cck-doc-color-main-effect-surface-start) 50%,
      var(--cck-doc-color-main-effect-surface-end) 100%
    ),
    linear-gradient(
      180deg,
      var(--cck-doc-color-main-effect-surface-end) 3.62%,
      var(--cck-doc-color-main-effect-surface-start) 51.49%,
      var(--cck-doc-color-main-effect-surface-end) 100%
    ),
    radial-gradient(circle at 3px 3px, var(--cck-doc-color-bg-5) 3px, transparent 3px);
  background-repeat: no-repeat, no-repeat, repeat;
  background-size:
    cover,
    cover,
    16px 16px;
`;
