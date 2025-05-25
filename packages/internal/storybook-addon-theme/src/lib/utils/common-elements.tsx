import styled from 'styled-components';

export const StyledLoader = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 50%;
  display: inline-block;
  background: linear-gradient(0deg, var(--cck-doc-color-bg-3) 33%, var(--cck-doc-color-brand-default) 100%);
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--cck-doc-color-bg-3);
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
