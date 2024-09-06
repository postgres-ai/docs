import { FunctionComponent } from 'react'
import { Hint, HintType } from '@site/src/components/BotSample/hints'
import { WrenchIcon } from '@site/src/icons/WrenchIcon/WrenchIcon'
import { ArrowGrowthIcon } from '@site/src/icons/ArrowGrowthIcon/ArrowGrowthIcon'
import { TableIcon } from '@site/src/icons/TableIcon/TableIcon'
import { CommonTypeIcon } from '@site/src/icons/CommonTypeIcon/CommonTypeIcon'

export function setCookie(name: string, value: string, duration: number): void {
  const date = new Date();
  date.setTime(date.getTime() + duration); // 1 hour in milliseconds
  const expires = `expires=${date.toUTCString()}`;
  const domain = `domain=.${window.location.hostname.split('.').slice(-2).join('.')}`;
  document.cookie = `${name}=${value};${expires};path=/;${domain}`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) == ' ') cookie = cookie.substring(1, cookie.length);
    if (cookie.indexOf(nameEQ) == 0) return cookie.substring(nameEQ.length, cookie.length);
  }
  return null;
}

export function matchHintTypeAndIcon(hintType: HintType): FunctionComponent<SVGElement> {
  switch (hintType) {
    case 'performance':
      return ArrowGrowthIcon
    case 'settings':
      return WrenchIcon
    case 'design':
      return TableIcon
    default:
      return CommonTypeIcon
  }
}

export function getRandomHints(hints: Hint[]): Hint[] {
  const selectedHints: Hint[] = [];
  const usedTypes: Set<HintType> = new Set();

  while (selectedHints.length < 4) {
    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    // Check if the type has already been used
    if (!usedTypes.has(randomHint.type)) {
      selectedHints.push(randomHint);
      usedTypes.add(randomHint.type);
    }
  }

  return selectedHints;
}