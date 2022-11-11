export {}

declare global {
  interface Window {
    Intercom?(action: 'show'): void
  }
}
