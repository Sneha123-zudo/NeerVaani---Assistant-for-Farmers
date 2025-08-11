// A set of animated weather icons

interface IconProps {
  className?: string;
}

export const SunIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} animate-spin-slow`}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const CloudIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} animate-float`}
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

export const CloudRainIcon = ({ className }: IconProps) => (
  <div className={`relative ${className}`}>
    <CloudIcon className="w-full h-full absolute" />
    <div className="absolute w-full h-full top-1/2 left-1/4">
        <i className="absolute bg-current rounded-full w-0.5 h-2 animate-fall" style={{ animationDelay: '0s', animationDuration: '1s' }}></i>
        <i className="absolute bg-current rounded-full w-0.5 h-2 animate-fall" style={{ left: '20%', animationDelay: '0.6s', animationDuration: '1.2s' }}></i>
        <i className="absolute bg-current rounded-full w-0.5 h-3 animate-fall" style={{ left: '40%', animationDelay: '0.2s', animationDuration: '0.8s' }}></i>
        <i className="absolute bg-current rounded-full w-0.5 h-2 animate-fall" style={{ left: '60%', animationDelay: '0.8s', animationDuration: '1.1s' }}></i>
    </div>
  </div>
);
