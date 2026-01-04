/**
 * Site-wide constants for PostgresAI documentation
 *
 * Re-exports from site.json which serves as the single source of truth
 * for both Docusaurus config (CommonJS) and React components (ESM).
 */

import siteConfig from './site.json'

export const SITE_NAME: string = siteConfig.SITE_NAME
export const SITE_SLOGAN: string = siteConfig.SITE_SLOGAN
export const SITE_SUBTITLE: string = siteConfig.SITE_SUBTITLE
