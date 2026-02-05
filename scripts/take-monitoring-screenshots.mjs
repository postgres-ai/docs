import { chromium } from 'playwright';

const OUTPUT_DIR = '/Users/nik/gitlab/docs/static/img/monitoring/dashboards';
const BASE_URL = 'http://localhost:3000';
// Use 15 minutes to avoid the gap from earlier
const TIME_RANGE = 'from=now-15m&to=now&timezone=utc';
const VARS = 'var-cluster_name=default&var-node_name=host-docker-internal-postgres&var-db_name=postgres';
const THEME = 'theme=light';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Standard viewport for most dashboards
  const standardContext = await browser.newContext({
    viewport: { width: 1499, height: 820 },
    deviceScaleFactor: 1,
  });

  // Taller viewport for dashboards that need to show more panels
  const tallContext = await browser.newContext({
    viewport: { width: 1499, height: 1200 },
    deviceScaleFactor: 1,
  });

  const page = await standardContext.newPage();
  const tallPage = await tallContext.newPage();

  // Login on both pages
  console.log('Logging in to Grafana...');
  for (const p of [page, tallPage]) {
    await p.goto(`${BASE_URL}/login`);
    await p.fill('input[name="user"]', process.env.GRAFANA_USER || 'monitor');
    await p.fill('input[name="password"]', process.env.GRAFANA_PASSWORD || '');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
  }
  console.log('Logged in successfully');

  // 1. 01-node-overview (standard)
  {
    console.log('\n1. Taking 01-node-overview');
    const url = `${BASE_URL}/d/f90500a0-a12e-4081-a2f0-07ed96f27915/01-single-node-performance-overview-high-level?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/01-node-overview.png`, type: 'png' });
    console.log('  Saved 01-node-overview.png');
  }

  // 2. 01-node-overview-ash-panel (scroll to ASH)
  {
    console.log('\n2. Taking 01-node-overview-ash-panel');
    // Scroll down to show ASH panel - use scrollable container in Grafana
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.scrollbar-view') || document.documentElement;
      scrollContainer.scrollTop = 500;
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUTPUT_DIR}/01-node-overview-ash-panel.png`, type: 'png' });
    console.log('  Saved 01-node-overview-ash-panel.png');
  }

  // 3. 02-query-analysis (standard)
  {
    console.log('\n3. Taking 02-query-analysis');
    const url = `${BASE_URL}/d/3ceb2e98-639d-48df-8e1f-7686d2052170/02-query-performance-analysis-top-n?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/02-query-analysis.png`, type: 'png' });
    console.log('  Saved 02-query-analysis.png');
  }

  // 4. 02-query-analysis-exec-time-panel (scroll to exec time)
  {
    console.log('\n4. Taking 02-query-analysis-exec-time-panel');
    // Scroll down to show execution time panels
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.scrollbar-view') || document.documentElement;
      scrollContainer.scrollTop = 600;
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUTPUT_DIR}/02-query-analysis-exec-time-panel.png`, type: 'png' });
    console.log('  Saved 02-query-analysis-exec-time-panel.png');
  }

  // 5. 02-query-analysis-table-view (expand table section)
  {
    console.log('\n5. Taking 02-query-analysis-table-view');
    // Use 6h time range for table view to show more accumulated data
    const tableTimeRange = 'from=now-6h&to=now&timezone=utc';
    // Go back to top and expand table view
    await page.goto(`${BASE_URL}/d/3ceb2e98-639d-48df-8e1f-7686d2052170/02-query-performance-analysis-top-n?orgId=1&${tableTimeRange}&${VARS}&theme=light&kiosk`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    try {
      const tableViewHeader = await page.locator('text=Detailed table view').first();
      await tableViewHeader.click();
      await page.waitForTimeout(8000);
      await tableViewHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`  Warning: Could not expand table view: ${e.message}`);
    }
    await page.screenshot({ path: `${OUTPUT_DIR}/02-query-analysis-table-view.png`, type: 'png' });
    console.log('  Saved 02-query-analysis-table-view.png');
  }

  // 6. 03-single-query - use TALL page to show multiple panels
  {
    const queryid = '1144016440436625022';
    console.log(`\n6. Taking 03-single-query with queryid=${queryid} (tall viewport)`);
    const url = `${BASE_URL}/d/db52944d-b025-4e18-b70b-89c0af3e7e41/03-single-queryid-analysis?orgId=1&${TIME_RANGE}&${VARS}&var-query_id=${queryid}&theme=light&kiosk`;
    await tallPage.goto(url, { waitUntil: 'networkidle' });
    await tallPage.waitForTimeout(7000);
    // Scroll down a bit to skip the query text and show more metric panels
    await tallPage.evaluate(() => window.scrollBy(0, 200));
    await tallPage.waitForTimeout(2000);
    await tallPage.screenshot({ path: `${OUTPUT_DIR}/03-single-query.png`, type: 'png' });
    console.log('  Saved 03-single-query.png');
  }

  // 7. 04-wait-events (3 panels with scrolling)
  {
    console.log('\n7. Taking 04-wait-events panels');
    // Use specific time range with good data
    const waitEventsTime = 'from=2026-02-04T20:08:37.920Z&to=2026-02-04T21:58:13.410Z&timezone=browser';
    const url = `${BASE_URL}/d/a222b233-acef-4bac-a451-1591023e4d4f/04-wait-event-analysis-active-session-history?orgId=1&${waitEventsTime}&${VARS}&theme=light&kiosk`;
    await tallPage.goto(url, { waitUntil: 'networkidle' });
    await tallPage.waitForTimeout(5000);

    // Panel 1: ASH by type (at top)
    await tallPage.screenshot({ path: `${OUTPUT_DIR}/04-wait-events-ash-by-type.png`, type: 'png' });
    console.log('  Saved 04-wait-events-ash-by-type.png');

    // Panel 2: ASH by event (scroll down)
    await tallPage.evaluate(() => window.scrollBy(0, 700));
    await tallPage.waitForTimeout(1000);
    await tallPage.screenshot({ path: `${OUTPUT_DIR}/04-wait-events-ash-by-event.png`, type: 'png' });
    console.log('  Saved 04-wait-events-ash-by-event.png');

    // Panel 3: ASH by query (scroll more)
    await tallPage.evaluate(() => window.scrollBy(0, 700));
    await tallPage.waitForTimeout(1000);
    await tallPage.screenshot({ path: `${OUTPUT_DIR}/04-wait-events-ash-by-query.png`, type: 'png' });
    console.log('  Saved 04-wait-events-ash-by-query.png');
  }

  // 8. 08-table-stats
  {
    console.log('\n8. Taking 08-table-stats');
    const url = `${BASE_URL}/d/92657f2a-985b-4d1a-99ed-2fac6e0c53e2/08-aggregated-table-analysis?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/08-table-stats.png`, type: 'png' });
    console.log('  Saved 08-table-stats.png');
  }

  // 9. 09-single-table
  {
    console.log('\n9. Taking 09-single-table');
    const url = `${BASE_URL}/d/9-single-table-analysis/09-single-table-analysis?orgId=1&${TIME_RANGE}&${VARS}&var-schema_name=public&var-table_name=pgbench_accounts&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/09-single-table.png`, type: 'png' });
    console.log('  Saved 09-single-table.png');
  }

  // 10. 10-index-health
  {
    console.log('\n10. Taking 10-index-health');
    const url = `${BASE_URL}/d/db3b37d1-1540-4f7e-95c9-4082f2ca349e/10-aggregated-index-analysis?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/10-index-health.png`, type: 'png' });
    console.log('  Saved 10-index-health.png');
  }

  // 11. 11-single-index
  {
    console.log('\n11. Taking 11-single-index');
    const url = `${BASE_URL}/d/aa0128c5-c5a0-4418-a99e-c941af10426e/11-single-index-analysis?orgId=1&${TIME_RANGE}&${VARS}&var-schema_name=public&var-index_name=pgbench_accounts_pkey&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/11-single-index.png`, type: 'png' });
    console.log('  Saved 11-single-index.png');
  }

  // 12. 12-slru
  {
    console.log('\n12. Taking 12-slru');
    const url = `${BASE_URL}/d/slru_stats/12-slru-cache-stats?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/12-slru.png`, type: 'png' });
    console.log('  Saved 12-slru.png');
  }

  // 13. 13-lock-contention - use tall page to show table below charts
  {
    console.log('\n13. Taking 13-lock-contention (tall viewport to show table)');
    const url = `${BASE_URL}/d/lock-contention/13-lock-contention?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await tallPage.goto(url, { waitUntil: 'networkidle' });
    await tallPage.waitForTimeout(5000);
    await tallPage.screenshot({ path: `${OUTPUT_DIR}/13-lock-contention.png`, type: 'png' });
    console.log('  Saved 13-lock-contention.png');
  }

  // 14. self-monitoring
  {
    console.log('\n14. Taking self-monitoring');
    const url = `${BASE_URL}/d/self-monitoring/self-monitoring-dashboard?orgId=1&${TIME_RANGE}&${VARS}&theme=light&kiosk`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUTPUT_DIR}/self-monitoring.png`, type: 'png' });
    console.log('  Saved self-monitoring.png');
  }

  await browser.close();
  console.log('\nAll screenshots captured!');
}

main().catch(console.error);
