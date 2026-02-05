import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const OUTPUT_DIR = '/Users/nik/gitlab/docs/static/img/monitoring/cloud-setup';
const USER_DATA_DIR = join(homedir(), '.playwright-console-session');

async function main() {
  console.log('Launching browser with persistent session...');
  console.log('If not logged in, please log in to console.postgres.ai manually.');
  console.log('The script will wait for you to complete login.\n');

  // Use persistent context to maintain login state
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false, // Show browser for login
    viewport: { width: 1499, height: 820 },
    deviceScaleFactor: 1,
  });

  const page = browser.pages()[0] || await browser.newPage();

  // Navigate to the plans page
  console.log('Navigating to plans page...');
  await page.goto('https://console.postgres.ai/goodvibes-ai/monitoring/plan');
  await page.waitForTimeout(3000);

  // Check if we need to log in
  const currentUrl = page.url();
  if (currentUrl.includes('signin') || currentUrl.includes('login')) {
    console.log('\n>>> Please log in to the console in the browser window <<<');
    console.log('>>> Press Enter here when logged in and on the plans page <<<\n');

    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  // Wait for the page to be ready
  await page.waitForTimeout(2000);

  // 1. Plans page
  console.log('\n1. Taking 01-plans-page.png');
  await page.goto('https://console.postgres.ai/goodvibes-ai/monitoring/plan', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUTPUT_DIR}/01-plans-page.png`, type: 'png' });
  console.log('  Saved');

  // 2. Scale options page
  console.log('\n2. Taking 02-scale-options.png');
  await page.goto('https://console.postgres.ai/goodvibes-ai/monitoring/scale/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUTPUT_DIR}/02-scale-options.png`, type: 'png' });
  console.log('  Saved');

  // 3. Supabase project selection
  console.log('\n3. Taking 03-supabase-project.png');
  await page.goto('https://console.postgres.ai/goodvibes-ai/monitoring/scale/create/supabase', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUTPUT_DIR}/03-supabase-project.png`, type: 'png' });
  console.log('  Saved');

  // 4. Any PostgreSQL database connection form
  console.log('\n4. Taking 04-anydb-connection.png');
  await page.goto('https://console.postgres.ai/goodvibes-ai/monitoring/scale/create/managed', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUTPUT_DIR}/04-anydb-connection.png`, type: 'png' });
  console.log('  Saved');

  console.log('\nAll console screenshots captured!');
  console.log(`Files saved to: ${OUTPUT_DIR}`);

  await browser.close();
}

main().catch(console.error);
