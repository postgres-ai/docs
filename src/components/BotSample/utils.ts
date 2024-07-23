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