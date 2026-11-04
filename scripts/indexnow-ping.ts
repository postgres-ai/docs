// Submits every URL in build/sitemap.xml to IndexNow (Bing, Yandex, Seznam,
// Naver and others share submissions). Run after `bun run build`:
//
//   bun run indexnow            # submit
//   bun run indexnow --dry-run  # print what would be sent
//
// The key file is static/${KEY}.txt, served at https://postgres.ai/${KEY}.txt.
// Not wired into CI yet.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const KEY = '72765c9fba2db716a057736cdd0c6513'
const HOST = 'postgres.ai'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const BATCH = 10_000 // IndexNow limit per request

const sitemapPath = join(import.meta.dir, '..', 'build', 'sitemap.xml')
const xml = readFileSync(sitemapPath, 'utf8')
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim())
  .filter((u) => new URL(u).host === HOST)

if (urls.length === 0) {
  console.error(`No https://${HOST} URLs in ${sitemapPath}; was the build run with URL=https://${HOST}?`)
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')
console.log(`${urls.length} URLs from ${sitemapPath}${dryRun ? ' (dry run)' : ''}`)

for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH)
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }
  if (dryRun) {
    console.log(JSON.stringify({ ...body, urlList: urlList.slice(0, 3) }, null, 2))
    continue
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })
  // 200 OK and 202 Accepted are both success.
  console.log(`batch ${i / BATCH + 1}: ${res.status} ${res.statusText}`)
  if (!res.ok) {
    console.error(await res.text())
    process.exit(1)
  }
}
