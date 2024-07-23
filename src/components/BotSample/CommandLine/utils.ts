export const isMobileDevice = (): boolean => {
  let hasTouchScreen = false;

  // Check for modern touch screen devices using maxTouchPoints
  if ("maxTouchPoints" in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  }
  // Check for older versions of IE with msMaxTouchPoints
  else if ("msMaxTouchPoints" in navigator) {
    hasTouchScreen = (navigator as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0;
  }
  // Use matchMedia to check for coarse pointer devices
  else {
    const mQ = window.matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
      hasTouchScreen = mQ.matches;
    }
    // Check for the presence of the orientation property as a fallback (deprecated in modern browsers)
    else if ('orientation' in window) {
      hasTouchScreen = true;
    }
    // Last resort: fallback with user agent sniffing
    else {
      const UA = navigator.userAgent;
      hasTouchScreen = (
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
      );
    }
  }

  // Check for mobile screen width, 1366 because of iPad Pro in Landscape mode
  // If this is not necessary, may reduce value to 1024 or 768
  const isMobileScreen = window.innerWidth <= 1366;

  return hasTouchScreen && isMobileScreen;
}

export const checkIsSendCmd = (e: KeyboardEvent): boolean => {
  if (isMobileDevice()) {
    return false;
  }
  return e.code === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey;
};

export const checkIsNewLineCmd = (e: KeyboardEvent): boolean => {
  if (isMobileDevice()) {
    return e.code === 'Enter'; // On mobile devices, Enter should create a new line.
  }
  return e.code === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey);
};

export const addNewLine = (
  value: string,
  element: HTMLInputElement | HTMLTextAreaElement,
) => {
  const NEW_LINE_STR = '\n'

  const firstLineLength = element.selectionStart ?? value.length
  const secondLineLength = element.selectionEnd ?? value.length

  const firstLine = value.substring(0, firstLineLength)
  const secondLine = value.substring(secondLineLength)

  return {
    value: `${firstLine}${NEW_LINE_STR}${secondLine}`,
    caretPosition: firstLineLength + NEW_LINE_STR.length,
  }
}
