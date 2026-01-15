"use strict";
/**
 * @fileoverview Cross-domain tracking capture for Reddit ads attribution
 *
 * Captures UTM parameters and Google Click ID (gclid) from URL query strings
 * and stores them in first-party cookies accessible across postgres.ai subdomains.
 *
 * Security features:
 * - Input sanitization to prevent injection attacks
 * - Secure cookie flags (Secure, SameSite=Lax)
 * - 30-day attribution window with timestamp tracking
 *
 * @version 1.0.0
 */

(w => {
  const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
  const COOKIE_NAME = 'pai_attribution';
  const COOKIE_DOMAIN = '.postgres.ai'; // Works for both postgres.ai and console.postgres.ai
  const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

  /**
   * Sanitize tracking param value to prevent injection attacks.
   * Allows only alphanumeric characters, hyphens, underscores, and dots.
   * This covers all legitimate UTM params and gclid values while providing strong protection.
   */
  const sanitize = (value) => {
    if (!value || typeof value !== 'string') return '';
    // Allow only safe characters: alphanumeric, hyphens, underscores, and dots
    return value.replace(/[^a-zA-Z0-9_.-]/g, '').substring(0, 100);
  };

  /**
   * Set cookie with cross-domain scope
   */
  const setCookie = (name, value, options = {}) => {
    const opts = {
      path: '/',
      domain: COOKIE_DOMAIN,
      'max-age': COOKIE_MAX_AGE,
      secure: true,
      samesite: 'Lax', // Lax required for cross-domain navigation (postgres.ai → console.postgres.ai)
      ...options
    };

    let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value);

    for (const [key, val] of Object.entries(opts)) {
      cookieString += '; ' + key;
      if (val !== true) {
        cookieString += '=' + val;
      }
    }

    w.document.cookie = cookieString;
  };

  /**
   * Capture tracking params from URL and store in cookie
   */
  const captureTrackingParams = () => {
    try {
      const params = new URLSearchParams(w.location.search);
      const attribution = {};
      let hasParams = false;

      // Capture any tracking params present in URL
      TRACKING_PARAMS.forEach(param => {
        const value = params.get(param);
        if (value) {
          const sanitized = sanitize(value);
          if (sanitized) {
            attribution[param] = sanitized;
            hasParams = true;
          }
        }
      });

      // If we captured any params, store them in cookie
      if (hasParams) {
        // Add timestamp for attribution window tracking
        attribution.captured_at = new Date().toISOString();

        setCookie(COOKIE_NAME, JSON.stringify(attribution));
      }
    } catch (e) {
      console.error('[Tracking] Failed to capture params:', e);
    }
  };

  /**
   * Main entry point
   */
  const main = () => {
    captureTrackingParams();
  };

  const state = w.document.readyState;

  if (state === "interactive" || state === "complete") {
    main();
  } else {
    w.addEventListener("DOMContentLoaded", main);
  }
})(window);
