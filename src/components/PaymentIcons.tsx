const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#1A1F71" />
    <path d="M19.5 21H17L18.8 11H21.3L19.5 21Z" fill="white" />
    <path d="M28.5 11.2C28 11 27.2 10.8 26.2 10.8C23.7 10.8 22 12.1 22 13.9C22 15.3 23.2 16 24.1 16.4C25 16.8 25.3 17.1 25.3 17.5C25.3 18.1 24.6 18.4 23.9 18.4C22.9 18.4 22.4 18.3 21.6 17.9L21.3 17.8L21 19.6C21.6 19.9 22.6 20.1 23.7 20.1C26.4 20.1 28 18.8 28 16.9C28 15.8 27.3 15 25.9 14.4C25.1 14 24.6 13.7 24.6 13.3C24.6 12.9 25.1 12.5 26 12.5C26.8 12.5 27.4 12.7 27.8 12.9L28 13L28.5 11.2Z" fill="white" />
    <path d="M32.3 11H30.3C29.7 11 29.2 11.2 29 11.8L25.5 21H28.2L28.7 19.5H32L32.3 21H34.7L32.3 11ZM29.5 17.7L30.7 14.3L31.4 17.7H29.5Z" fill="white" />
    <path d="M16.5 11L14 17.8L13.7 16.3C13.2 14.7 11.7 13 10 12.2L12.3 21H15L19.2 11H16.5Z" fill="white" />
    <path d="M12.7 11H8.5L8.5 11.2C11.7 12 13.8 13.8 14.5 16L13.7 11.8C13.6 11.2 13.1 11 12.7 11Z" fill="#F9A533" />
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#252525" />
    <circle cx="20" cy="16" r="8" fill="#EB001B" />
    <circle cx="28" cy="16" r="8" fill="#F79E1B" />
    <path d="M24 10.3C25.8 11.7 27 13.7 27 16C27 18.3 25.8 20.3 24 21.7C22.2 20.3 21 18.3 21 16C21 13.7 22.2 11.7 24 10.3Z" fill="#FF5F00" />
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#2E77BC" />
    <text x="24" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
  </svg>
);

const DiscoverIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FF6000" />
    <circle cx="28" cy="16" r="7" fill="white" />
    <circle cx="28" cy="16" r="5" fill="#FF6000" />
    <text x="14" y="18" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">D</text>
  </svg>
);

const UnionPayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#E21836" />
    <rect x="16" y="4" width="12" height="24" rx="2" fill="#00447C" />
    <rect x="26" y="4" width="12" height="24" rx="2" fill="#007B84" />
    <text x="24" y="18" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="Arial">UP</text>
  </svg>
);

const PaypalIcon = () => (
  <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="32" rx="4" fill="#FFF" stroke="hsl(220,13%,20%)" strokeWidth="1" />
    <path d="M18.5 8H23C25.5 8 27 9.5 26.7 12C26.3 15 24.5 16.5 22 16.5H20.5L19.5 22H16.5L18.5 8Z" fill="#003087" />
    <path d="M21 10H25.5C28 10 29.5 11.5 29.2 14C28.8 17 27 18.5 24.5 18.5H23L22 24H19L21 10Z" fill="#009CDE" />
  </svg>
);

export { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, UnionPayIcon, PaypalIcon };
