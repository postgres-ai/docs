const assert = require('node:assert/strict');
const path = require('node:path');
const {mock, test} = require('bun:test');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');

// Replace the webpack-only Docusaurus alias and the CSS module.
let isBrowser = false;
mock.module('@docusaurus/useIsBrowser', () => ({default: () => isBrowser}));
mock.module(path.join(__dirname, '../src/theme/ColorModeToggle/styles.module.css'), () => ({default: {}}));
const {default: ColorModeToggle, nextIndex} = require('../src/theme/ColorModeToggle/index.tsx');

// Option order: 0 System, 1 Light, 2 Dark.
test('ArrowRight and ArrowDown move forward and wrap from Dark to System', () => {
  for (const key of ['ArrowRight', 'ArrowDown']) {
    assert.equal(nextIndex(key, 0, 3), 1);
    assert.equal(nextIndex(key, 2, 3), 0);
  }
});

test('ArrowLeft and ArrowUp move back and wrap from System to Dark', () => {
  for (const key of ['ArrowLeft', 'ArrowUp']) {
    assert.equal(nextIndex(key, 2, 3), 1);
    assert.equal(nextIndex(key, 0, 3), 2);
  }
});

test('Home and End go to System and Dark', () => {
  assert.equal(nextIndex('Home', 2, 3), 0);
  assert.equal(nextIndex('End', 0, 3), 2);
});

test('Tab, Enter and Space are not intercepted', () => {
  for (const key of ['Tab', 'Enter', ' ']) assert.equal(nextIndex(key, 1, 3), null);
});

function render(value) {
  return renderToStaticMarkup(React.createElement(ColorModeToggle, {value, onChange() {}, respectPrefersColorScheme: true}));
}

for (const [value, label] of [[null, 'System'], ['light', 'Light'], ['dark', 'Dark']]) {
  test(`value ${value}: ${label} is the only checked option and the only tab stop`, () => {
    const buttons = render(value).match(/<button[^>]*>/g);
    assert.deepEqual(buttons.map(b => b.match(/aria-label="(\w+) theme"/)[1]), ['System', 'Light', 'Dark']);
    assert.deepEqual(buttons.filter(b => b.includes('tabindex="0"')).map(b => b.match(/aria-label="(\w+)/)[1]), [label]);
    assert.deepEqual(buttons.filter(b => b.includes('aria-checked="true"')).map(b => b.match(/aria-label="(\w+)/)[1]), [label]);
  });
}

test('buttons are disabled before hydration and enabled after', () => {
  isBrowser = false;
  assert.equal(render('dark').match(/<button[^>]*disabled/g).length, 3);
  isBrowser = true;
  assert(!render('dark').includes('disabled'));
  isBrowser = false;
});

test('fresh visits follow the OS color scheme', () => {
  assert.deepEqual(require('../docusaurus.config.js').themeConfig.colorMode, {
    defaultMode: 'light',
    respectPrefersColorScheme: true,
  });
});
