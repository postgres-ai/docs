import React, {useRef} from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import type {Props} from '@theme/ColorModeToggle';
import styles from './styles.module.css';

// Keep option order, icons and keyboard behavior aligned with Console's ThemeToggle.
const commonSvgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

// Lucide-style sun: small center circle + eight short rays.
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} {...commonSvgProps}>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2.5" x2="12" y2="4.5" />
    <line x1="12" y1="19.5" x2="12" y2="21.5" />
    <line x1="2.5" y1="12" x2="4.5" y2="12" />
    <line x1="19.5" y1="12" x2="21.5" y2="12" />
    <line x1="5.1" y1="5.1" x2="6.5" y2="6.5" />
    <line x1="17.5" y1="17.5" x2="18.9" y2="18.9" />
    <line x1="5.1" y1="18.9" x2="6.5" y2="17.5" />
    <line x1="17.5" y1="6.5" x2="18.9" y2="5.1" />
  </svg>
)

// Thin crescent moon.
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} {...commonSvgProps}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 0 0 10.5 10.5z" />
  </svg>
)

// Thin monitor/display outline for the System (auto) option.
const MonitorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} {...commonSvgProps}>
    <rect x="3" y="4.5" width="18" height="12" rx="1.6" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="16.5" x2="12" y2="20" />
  </svg>
)


const options = [
  {value: null, label: 'System', Icon: MonitorIcon},
  {value: 'light', label: 'Light', Icon: SunIcon},
  {value: 'dark', label: 'Dark', Icon: MoonIcon},
] as const;

// Index of the option that a radiogroup key selects, or null for keys the group does not handle.
export function nextIndex(key: string, index: number, length: number): number | null {
  switch (key) {
    case 'ArrowRight': case 'ArrowDown': return (index + 1) % length;
    case 'ArrowLeft': case 'ArrowUp': return (index + length - 1) % length;
    case 'Home': return 0;
    case 'End': return length - 1;
    default: return null;
  }
}

export default function ColorModeToggle({className, buttonClassName, value, onChange}: Props) {
  const isBrowser = useIsBrowser();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextIndex(event.key, index, options.length);
    if (next === null) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].value);
  }
  return (
    <div className={clsx(styles.group, className)} role="radiogroup" aria-label="Theme preference">
      <span className={styles.chip} style={{left: 2 + selectedIndex * 24}} aria-hidden="true" />
      {options.map(({value: option, label, Icon}, index) => (
        <button key={label} ref={el => {refs.current[index] = el;}}
          type="button" role="radio" aria-checked={option === value}
          tabIndex={option === value ? 0 : -1} disabled={!isBrowser}
          className={clsx(styles.segment, buttonClassName)}
          title={`${label} theme`} aria-label={`${label} theme`}
          onClick={() => onChange(option)} onKeyDown={event => handleKeyDown(event, index)}>
          <Icon className={styles.icon} />
        </button>
      ))}
    </div>
  );
}
