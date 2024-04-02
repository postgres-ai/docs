import React, { useEffect } from 'react';

export const TwitterEmbedScript = () => {
  useEffect(() => {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    } else {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null;
};