export function WelcomeBgEffect({className = ''}: {className?: string}) {
  return (
    <svg
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path fill="url(#a)" d="M0 0h1200v720H0z"></path>
      <path fill="url(#b)" d="M0 0h1200v720H0z"></path>
      <path fill="url(#c)" d="M0 0h1200v720H0z"></path>
      <defs>
        <radialGradient
          id="c"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(-150.99958 -241.49975 370.71887 -231.79483 782.5 327)">
          <stop stopOpacity="0"></stop>
          <stop offset="1" stopColor="var(--website-cck-color-bg-0)"></stop>
        </radialGradient>
        <linearGradient id="a" x1="519.995" y1="0" x2="610.408" y2="736.058" gradientUnits="userSpaceOnUse">
          <stop stopColor="#010101"></stop>
          <stop offset=".5671" stopColor="#0B1F20"></stop>
          <stop offset=".7038" stopColor="#0C191F"></stop>
          <stop offset="1" stopColor="#122416"></stop>
        </linearGradient>
        <pattern id="b" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#d" transform="matrix(.00098 0 0 .00163 0 -.3333)"></use>
        </pattern>
      </defs>
    </svg>
  );
}