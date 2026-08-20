import { memo, type ReactElement, type SVGProps } from 'react';
import styles from './Icon.module.css';

type IconPath = ReactElement;

export type IconName =
  | 'mic'
  | 'mic-off'
  | 'video'
  | 'video-off'
  | 'screen-share'
  | 'screen-share-off'
  | 'users'
  | 'chat'
  | 'more'
  | 'leave'
  | 'settings'
  | 'chevron-down'
  | 'close'
  | 'alert'
  | 'spinner'
  | 'user'
  | 'signal'
  | 'signal-poor'
  | 'refresh'
  | 'copy'
  | 'check';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const PATHS: Record<IconName, IconPath> = {
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" />
    </>
  ),
  'mic-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M9 9v2a3 3 0 0 0 4.6 2.55M15 9V5a3 3 0 0 0-5.7-1.3" />
      <path d="M5 10a7 7 0 0 0 10.6 5.9M19 10a7 7 0 0 1-1.1 3.7" />
      <path d="M12 19v3M8 22h8" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2.5" />
      <path d="M16 10.5l5-3v9l-5-3" />
    </>
  ),
  'video-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M16 8.5V8a2.5 2.5 0 0 0-2.5-2.5H6a2.5 2.5 0 0 0-2.5 2.5v8c0 .53.2 1.02.55 1.4M9 18h4.5A2.5 2.5 0 0 0 16 15.5v-1" />
      <path d="M16 10.5l5-3v9l-5-3" />
    </>
  ),
  'screen-share': (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M12 8v5M9.5 10.5L12 8l2.5 2.5" />
    </>
  ),
  'screen-share-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M2 6.5V15a2 2 0 0 0 2 2h9M20 12V6a2 2 0 0 0-2-2H7" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5c1.66.28 2.94 1.7 2.94 3.5S17.66 12.22 16 12.5M21.5 20a5.5 5.5 0 0 0-4.5-5.4" />
    </>
  ),
  chat: (
    <>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v8A2.5 2.5 0 0 1 18.5 16H9l-5 4v-4H5.5A2.5 2.5 0 0 1 3 13.5v-8Z" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </>
  ),
  leave: (
    <>
      <path d="M2.5 12c0-2.5 4-4 9.5-4s9.5 1.5 9.5 4c0 1-1.2 1.8-2 2.3-.6.4-1.3.2-1.7-.4l-1-1.4c-.3-.5-1-.6-1.5-.3-1 .6-2.1.9-3.3.9s-2.3-.3-3.3-.9c-.5-.3-1.2-.2-1.5.3l-1 1.4c-.4.6-1.1.8-1.7.4-.8-.5-2-1.3-2-2.3Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  alert: (
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4M12 17v.01" />
    </>
  ),
  spinner: <path d="M12 3a9 9 0 1 0 9 9" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  signal: (
    <>
      <rect x="3" y="14" width="3" height="6" rx="0.5" />
      <rect x="9" y="10" width="3" height="10" rx="0.5" />
      <rect x="15" y="6" width="3" height="14" rx="0.5" />
    </>
  ),
  'signal-poor': (
    <>
      <rect x="3" y="14" width="3" height="6" rx="0.5" />
      <rect x="9" y="10" width="3" height="10" rx="0.3" opacity="0.3" />
      <rect x="15" y="6" width="3" height="14" rx="0.3" opacity="0.3" />
    </>
  ),
  refresh: <path d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M4 4v5h5M20 20v-5h-5" />,
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3H5.5A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
};

function IconComponent({ name, size = 20, className, ...rest }: IconProps) {
  const classes = [styles.icon, name === 'spinner' ? styles.spin : '', className].filter(Boolean).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={classes}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const Icon = memo(IconComponent);
