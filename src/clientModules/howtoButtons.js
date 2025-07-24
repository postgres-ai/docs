import howtoMapping from '@site/src/data/howtoMapping.json';

function addHowtoButtons() {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Check if we're on a postgres howto page
  const pathname = window.location.pathname;
  if (!pathname.includes('/docs/postgres-howtos/') || 
      pathname.endsWith('/postgres-howtos/') ||
      pathname.includes('/index')) {
    return;
  }
  
  // Extract the slug from the URL
  const urlSegments = pathname.split('/').filter(Boolean);
  const slug = urlSegments[urlSegments.length - 1];
  
  // Get the file path from our mapping
  const filePath = howtoMapping[slug];
  if (!filePath) return;
  
  // Build URLs
  const editUrl = `https://gitlab.com/postgres-ai/docs/-/edit/master/docs/postgres-howtos/${filePath}`;
  const rawUrl = `/postgres-howtos/${filePath}`;
  
  // Create buttons container
  const container = document.createElement('div');
  container.className = 'howto-buttons';
  container.innerHTML = `
    <style>
      .howto-buttons {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 0.75rem 1rem;
        background-color: var(--ifm-code-background);
        border-radius: var(--ifm-pre-border-radius);
        font-size: 0.9rem;
      }
      .howto-button {
        color: var(--ifm-link-color);
        text-decoration: underline;
        cursor: pointer;
        transition: color 0.2s;
        background: none;
        border: none;
        padding: 0;
        font: inherit;
      }
      .howto-button:hover {
        color: var(--ifm-link-hover-color);
      }
      .howto-separator {
        margin: 0 0.5rem;
        color: var(--ifm-color-emphasis-600);
      }
    </style>
    <button class="howto-button" id="copy-button">Copy for LLM</button>
    <span class="howto-separator"> | </span>
    <a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="howto-button">View raw</a>
    <span class="howto-separator"> | </span>
    <a href="${editUrl}" target="_blank" rel="noopener noreferrer" class="howto-button">Edit</a>
  `;
  
  // Find the article element and insert buttons
  const article = document.querySelector('article');
  if (article && article.firstChild) {
    article.insertBefore(container, article.firstChild);
    
    // Add copy functionality
    const copyButton = document.getElementById('copy-button');
    copyButton.addEventListener('click', async () => {
      try {
        const response = await fetch(rawUrl);
        const text = await response.text();
        await navigator.clipboard.writeText(text);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy for LLM';
        }, 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    });
  }
}

// Run when the page loads and on route changes
export function onRouteDidUpdate({ location, previousLocation }) {
  // Small delay to ensure DOM is ready
  setTimeout(addHowtoButtons, 100);
}

// Also run on initial load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(addHowtoButtons, 100);
  });
}