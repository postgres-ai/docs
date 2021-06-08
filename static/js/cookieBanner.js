"use strict";
// After each changes, please recompile it here https://babeljs.io/repl.

(w => {
  const element = (tagName, options) => {
    const result = w.document.createElement(tagName);
    if (options.className) result.classList.add(options.className);
    if (options.text) result.innerText = options.text;
    if (options.children) options.children.forEach(child => result.appendChild(child));
    if (options.attrs) Object.entries(options.attrs).forEach(([key, value]) => result.setAttribute(key, value));
    return result;
  };

  const handleAccept = root => () => {
    w.localStorage.setItem("is-cookies-accepted", true);
    root.classList.add("cookie-banner_hidden");
  };

  const renderCookieBanner = () => {
    const desc = element("p", {
      className: "cookie-banner__desc",
      text: "This website or its third-party tools process personal data (e.g. browsing data or IP addresses) and use cookies or other identifiers, which are necessary for its functioning and required to achieve the purposes illustrated in the cookie policy. You accept the use of cookies or other identifiers by closing or dismissing this notice, by clicking a link or button or by continuing to browse otherwise."
    });
    const href = "/privacy";
    const learnMoreButton = element("a", {
      className: "cookie-banner__learn-more-button",
      text: "Learn more (Privacy Policy)",
      attrs: {
        href: "/privacy"
      }
    });
    const acceptButton = element("button", {
      className: "cookie-banner__accept-button",
      text: "Accept"
    });
    const actions = element("div", {
      className: "cookie-banner__actions",
      children: [acceptButton, learnMoreButton]
    });
    const root = element("div", {
      className: "cookie-banner",
      children: [desc, actions]
    });
    acceptButton.addEventListener("click", handleAccept(root));
    w.document.body.appendChild(root);
  };

  const main = () => {
    const isCookieAccepted = w.localStorage.getItem("is-cookies-accepted");
    if (isCookieAccepted) return;
    renderCookieBanner();
  }

  const state = w.document.readyState

  // This script loads in async and defer mods to be more friendly for the interface interactivity.
  // Mods are specified in /docusaurus.config.js.
  // Script can be loaded at any time, before or after document loaded.
  // See https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState.
  if (state === "interactive" || state === "complete") {
    main();
  } else {
    w.addEventListener("DOMContentLoaded", main);
  }
})(window);
