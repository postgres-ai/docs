import includeLanguages from '@theme-original/prism-include-languages';

export default function prismIncludeLanguages(Prism) {
  includeLanguages(Prism);

  // Recognize default psql prompts before SQL's generic # comment rule.
  // Keep the upstream SQL grammar (including other dialects' comments) intact.
  Prism.languages.insertBefore('sql', 'comment', {
    'psql-prompt': {
      pattern: /^[\w.-]+[=*-][*!?]?[#>](?=\s|$)/m,
      alias: 'symbol',
    },
  });
}
