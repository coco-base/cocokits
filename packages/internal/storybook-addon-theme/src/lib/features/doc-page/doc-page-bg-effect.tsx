import styled from 'styled-components';

export function DocPageBgEffect() {
  return (
    <Wrapper>
      <BrandGradient/>

      <BoxWrapper>
        <Box/>
        <Box/>
        <Box/>
        <Box/>
      </BoxWrapper>

      <SharkEffect>
        {/* packages/internal/storybook-addon-theme/src/assets/images/doc-page-header-effect-shark.png */}
        <SharkEffectImg src="/images/doc-page-header-effect-shark.png"/>
      </SharkEffect>

      <Surface/>
    </Wrapper>
  );
}


// region ---------------- STYLES ----------------
const Wrapper = styled.div`
    height: 480px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    position: absolute;
    left: 0;
    right: 0;
    top: 0;

    overflow: hidden;
`;

const BrandGradient = styled.div`
    background: radial-gradient(
      45% 66% at 50% 0%,
      var(--cck-doc-color-main-effect-primary-start) 0%,
      var(--cck-doc-color-main-effect-primary-end) 100%
    );
    height: 100%;
    position: absolute;
    width: 100%;
`;

const BoxWrapper = styled.div`
    position: absolute;
    display: flex;
    align-items: baseline;
    gap: 24px;
    height: 100%;
    width: 1280px;
`;

const Box = styled.div`
    width: 25%;
    aspect-ratio: 1 / 1;
    flex: 1;
    
    border-width: 0 1px 0 1px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    background: linear-gradient(
      180deg,
      var(--cck-doc-color-main-effect-box-start) 0%,
      var(--cck-doc-color-main-effect-box-end) 100%
    );
    transform: rotate(45deg);
`;

const SharkEffect = styled.div`
    position: absolute;
    inset: -28px -24px;
    opacity: 0.2;
    z-index: 0;
`;

const SharkEffectImg = styled.img`
    width: 100%;
`;

const Surface = styled.div`
    background: radial-gradient(
      45% 66% at 50% 0%,
      var(--cck-doc-color-main-effect-surface-start) 0%,
      var(--cck-doc-color-main-effect-surface-end) 100%
    );

    inset: -5px -18px -20px;
    position: absolute;
`;
// endregion