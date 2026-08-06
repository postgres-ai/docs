import React, { useState, useEffect, useRef } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import styles from './styles.module.css'
import { SupabaseLogo, SupabaseMark, GitLabLogo, SunoLogo, MiroLogo } from '../pricing'

// ============================================================================
// Dynamic Variant Types and API (for long-tail ads)
// ============================================================================
//
// Dynamic content variants are loaded via `?problem=key` URL parameter.
// Falls back to static content if API fetch fails or returns invalid data.
// Used for long-tail ad campaign landing pages to show targeted messaging.
// ============================================================================

interface VariantContent {
  headline_suffix?: string
  hero_subhead: string
  bridge_title: string
  bridge_bullets: string[]
  example_finding: string
  social_proof?: string
  cta_hint: string
}

interface VariantData {
  content: VariantContent
  version: number
}

interface VariantResponse {
  problem_key: string
  content: VariantContent
  version: number
}

/**
 * Validates that the API response content matches the expected VariantContent structure.
 * Required fields: hero_subhead, bridge_title, bridge_bullets, example_finding, cta_hint.
 * Optional fields: headline_suffix, social_proof.
 */
function isValidVariantContent(content: unknown): content is VariantContent {
  if (!content || typeof content !== 'object') return false
  const c = content as Record<string, unknown>
  return (
    typeof c.hero_subhead === 'string' &&
    typeof c.bridge_title === 'string' &&
    Array.isArray(c.bridge_bullets) &&
    c.bridge_bullets.every((b) => typeof b === 'string') &&
    typeof c.example_finding === 'string' &&
    typeof c.cta_hint === 'string'
  )
}

/**
 * Fetches landing page variant content from the API.
 * @param apiUrl - The base API URL (e.g., from docusaurus config)
 * @param problemKey - The problem variant key to fetch (from URL param)
 * @param signal - Optional AbortSignal for request cancellation/timeout
 * @returns VariantData object if found and valid, null on error/not found
 */
async function getLandingVariant(
  apiUrl: string,
  problemKey: string,
  signal?: AbortSignal
): Promise<VariantData | null> {
  try {
    const response = await fetch(
      `${apiUrl}/landing_page_variants?problem_key=eq.${encodeURIComponent(problemKey)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      }
    )
    if (!response.ok) return null
    const data: VariantResponse[] = await response.json()
    if (data.length === 0) return null
    const variant = data[0]
    if (!isValidVariantContent(variant.content)) {
      console.warn(`[getLandingVariant] Invalid content for: ${problemKey}`)
      return null
    }
    return { content: variant.content, version: variant.version }
  } catch (error) {
    // Don't log abort errors (expected on timeout)
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('[getLandingVariant] Fetch error:', error)
    }
    return null
  }
}

// Analytics helpers (safe to call even if umami not loaded)
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void
    }
  }
}

/**
 * Tracks analytics events via Umami. Safe to call even if Umami is not loaded.
 * @param eventName - The analytics event name
 * @param eventData - Optional event properties (values are sanitized)
 */
function trackEvent(eventName: string, eventData?: Record<string, string | number | boolean>) {
  try {
    if (typeof window !== 'undefined' && window.umami?.track) {
      // Sanitize string values to prevent analytics data pollution
      const sanitizedData = eventData
        ? Object.fromEntries(
            Object.entries(eventData).map(([k, v]) => [
              k,
              typeof v === 'string' ? v.slice(0, 100).replace(/[<>]/g, '') : v,
            ])
          )
        : undefined
      window.umami.track(eventName, sanitizedData)
    }
  } catch {
    // Silently fail - analytics should never break the page
  }
}

// Platform logo components (from simple-icons - official brand SVGs)
const AwsLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333334 199332" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" role="img" {...props}>
    <path d="M93937 72393c0 4102 443 7428 1219 9867 887 2439 1996 5100 3548 7982 554 887 776 1774 776 2550 0 1109-665 2217-2106 3326l-6985 4656c-998 665-1995 998-2882 998-1109 0-2217-554-3326-1552-1552-1663-2882-3437-3991-5211-1109-1885-2217-3991-3437-6541-8648 10200-19512 15299-32594 15299-9312 0-16740-2661-22172-7982-5432-5322-8204-12417-8204-21286 0-9424 3326-17073 10089-22838s15743-8647 27161-8647c3769 0 7650 332 11752 887 4102 554 8315 1441 12749 2439v-8093c0-8426-1774-14301-5211-17738-3548-3437-9534-5100-18071-5100-3880 0-7871 443-11973 1441s-8093 2217-11973 3769c-1774 776-3104 1219-3880 1441s-1330 332-1774 332c-1552 0-2328-1109-2328-3437v-5432c0-1774 222-3104 776-3880s1552-1552 3104-2328c3880-1996 8537-3659 13969-4989C43606 885 49370 220 55468 220c13193 0 22838 2993 29046 8980 6098 5987 9202 15077 9202 27272v35920h222zM48926 89244c3659 0 7428-665 11419-1995s7539-3769 10532-7095c1774-2106 3104-4435 3770-7095 665-2661 1108-5876 1108-9645v-4656c-3215-776-6652-1441-10199-1885-3548-443-6984-665-10421-665-7428 0-12860 1441-16519 4435-3659 2993-5432 7206-5432 12749 0 5211 1330 9091 4102 11751 2661 2772 6541 4102 11641 4102zm89023 11973c-1996 0-3326-332-4213-1109-887-665-1663-2217-2328-4324l-26053-85697c-665-2217-998-3658-998-4434 0-1774 887-2772 2661-2772h10865c2106 0 3548 333 4324 1109 887 665 1552 2217 2217 4324l18625 73391 17295-73391c554-2217 1219-3659 2106-4324s2439-1109 4435-1109h8869c2106 0 3548 333 4435 1109 887 665 1663 2217 2106 4324l17516 74278 19180-74278c665-2217 1441-3659 2217-4324 887-665 2328-1109 4324-1109h10310c1774 0 2772 887 2772 2772 0 554-111 1109-222 1774s-333 1552-776 2772l-26718 85697c-665 2217-1441 3658-2328 4324-887 665-2328 1109-4213 1109h-9534c-2107 0-3548-333-4435-1109s-1663-2217-2106-4435l-17184-71507-17073 71396c-554 2217-1220 3658-2107 4434s-2439 1109-4434 1109h-9534zm142459 2993c-5765 0-11530-665-17073-1995s-9867-2772-12749-4435c-1774-998-2993-2106-3437-3104-443-998-665-2106-665-3104v-5654c0-2328 887-3437 2550-3437 665 0 1330 111 1995 333s1663 665 2772 1109c3769 1663 7871 2993 12195 3880 4435 887 8758 1330 13193 1330 6984 0 12417-1220 16186-3659s5765-5987 5765-10532c0-3104-998-5654-2993-7760-1996-2107-5765-3991-11197-5765l-16075-4989c-8093-2550-14080-6319-17738-11308-3658-4878-5543-10310-5543-16075 0-4656 998-8758 2993-12306s4656-6652 7982-9091c3326-2550 7095-4434 11530-5765S279190-2 284068-2c2439 0 4989 111 7428 443 2550 333 4878 776 7206 1219 2217 554 4324 1109 6319 1774s3548 1330 4656 1996c1552 887 2661 1774 3326 2771 665 887 998 2107 998 3659v5211c0 2328-887 3548-2550 3548-887 0-2328-444-4213-1331-6319-2882-13415-4324-21286-4324-6319 0-11308 998-14745 3104s-5211 5321-5211 9867c0 3104 1109 5765 3326 7871s6319 4213 12195 6097l15743 4989c7982 2550 13747 6098 17184 10643s5100 9756 5100 15521c0 4767-998 9091-2882 12860-1996 3770-4656 7095-8093 9756-3437 2771-7539 4767-12306 6208-4989 1552-10199 2328-15854 2328z" fill="currentColor"/>
    <path d="M301362 158091c-36474 26940-89467 41241-135031 41241-63858 0-121395-23614-164854-62859-3437-3104-332-7317 3770-4878 47006 27272 104988 43791 164964 43791 40465 0 84921-8426 125830-25721 6097-2772 11308 3991 5321 8426z" fill="#f90"/>
    <path d="M316550 140796c-4656-5987-30820-2883-42682-1441-3548 443-4102-2661-887-4989 20842-14634 55099-10421 59090-5543 3991 4989-1109 39246-20620 55653-2993 2550-5876 1220-4545-2106 4435-10976 14301-35698 9645-41574z" fill="#f90"/>
  </svg>
)

const GoogleCloudLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333334 268125" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" role="img" {...props}>
    <path d="M212126 74104l10677 183 29010-29011 1406-12291C229395 11715 198568-27 166631 1 106527 1 55798 40897 40782 96293c3167-2209 9937-552 9937-552l57969-9531s2979-4932 4489-4687c13706-15059 33128-23638 53489-23630 17188 36 33021 6109 45459 16156v56h1z" fill="#ea4335"/>
    <path d="M292553 96355c-6735-24844-20615-46781-39349-63422l-41078 41078c16459 13281 27016 33604 27016 56354v7250c19984 0 36219 16271 36219 36219 0 19984-16271 36219-36219 36219h-72438l-7250 7292v43469l7250 7213h72438c51989-73 94115-42198 94193-94187-37-32057-16146-60417-40781-77479v-5z" fill="#4285f4"/>
    <path d="M94193 268125h72396v-58020H94193c-5144 1-10227-1104-14906-3240l-10453 3203-29010 29010-2541 9792c16348 12472 36343 19224 56906 19214l5 41z" fill="#34a853"/>
    <path d="M94193 79688C42204 79813 73 121938 0 173928c0 30589 14652 57787 37323 75016l41999-42000c-12984-5856-21337-18772-21349-33016 0-19984 16271-36219 36219-36219 14687 0 27313 8854 33021 21355l42000-42000c-17224-22672-44427-37323-75015-37323l-5-53z" fill="#fbbc05"/>
  </svg>
)

const AzureLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit={2} role="img" {...props}>
    <defs>
      <linearGradient id="azure-grad1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="rotate(108.701 26.35 33.911) scale(131.7791)">
        <stop offset="0" stopColor="#114a8b"/>
        <stop offset="1" stopColor="#0669bc"/>
      </linearGradient>
      <linearGradient id="azure-grad2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="rotate(161.318 33.644 45.587) scale(10.31703)">
        <stop offset="0" stopOpacity=".3"/>
        <stop offset=".07" stopOpacity=".2"/>
        <stop offset=".32" stopOpacity=".1"/>
        <stop offset=".62" stopOpacity=".05"/>
        <stop offset="1" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="azure-grad3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="rotate(69.426 25.69 62.036) scale(131.9816)">
        <stop offset="0" stopColor="#3ccbf4"/>
        <stop offset="1" stopColor="#2892df"/>
      </linearGradient>
    </defs>
    <g fillRule="nonzero">
      <path d="M52.091 10.225h40.684L50.541 135.361a6.5 6.5 0 01-6.146 4.412H12.732c-3.553 0-6.477-2.923-6.477-6.476 0-.704.115-1.403.34-2.07L45.944 14.638a6.501 6.501 0 016.147-4.415v.002z" fill="url(#azure-grad1)" transform="translate(2.076 1.626) scale(3.37462)"/>
      <path d="M377.371 319.374H159.644c-5.527 0-10.076 4.549-10.076 10.077 0 2.794 1.164 5.466 3.206 7.37l139.901 130.577a21.986 21.986 0 0015.004 5.91H430.96l-53.589-153.934z" fill="#0078d4"/>
      <path d="M52.091 10.225a6.447 6.447 0 00-6.161 4.498L6.644 131.12a6.457 6.457 0 00-.38 2.185c0 3.548 2.92 6.468 6.469 6.468H45.23a6.95 6.95 0 005.328-4.531l7.834-23.089 27.985 26.102a6.622 6.622 0 004.165 1.518h36.395l-15.962-45.615-46.533.011 28.48-83.944H52.091z" fill="url(#azure-grad2)" transform="translate(2.076 1.626) scale(3.37462)"/>
      <path d="M104.055 14.631a6.492 6.492 0 00-6.138-4.406H52.575a6.493 6.493 0 016.138 4.406l39.35 116.594c.225.668.34 1.367.34 2.072 0 3.554-2.924 6.478-6.478 6.478h45.344c3.553-.001 6.476-2.925 6.476-6.478 0-.705-.115-1.404-.34-2.072l-39.35-116.594z" fill="url(#azure-grad3)" transform="translate(2.076 1.626) scale(3.37462)"/>
    </g>
  </svg>
)

const KubernetesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 118.78" role="img" {...props}>
    {/* Blue heptagon */}
    <path fill="#326DE6" d="M112.13,26.42c-0.7-2.25-2.39-4.08-4.5-5.2L64.78,0.7C63.65,0.14,62.39,0,61.26,0s-2.39,0-3.51,0.28 L14.89,20.94c-2.11,0.98-3.65,2.81-4.22,5.2L0.14,72.37c-0.42,2.39,0.14,4.78,1.55,6.75l29.65,36.67c1.69,1.69,4.08,2.81,6.46,2.95 h47.21c2.53,0.28,4.92-0.84,6.46-2.95l29.65-36.67c1.41-1.97,1.97-4.36,1.69-6.75L112.13,26.42L112.13,26.42L112.13,26.42z"/>
    {/* White helm wheel */}
    <path fill="#fff" d="M105.59,69.45L105.59,69.45c-0.14,0-0.28,0-0.28-0.14c0-0.14-0.28-0.14-0.56-0.14 c-0.56-0.14-1.12-0.14-1.69-0.14c-0.28,0-0.56,0-0.84-0.14l-0.14,0c-1.55-0.14-3.23-0.42-4.78-0.84c-0.42-0.14-0.84-0.56-0.98-0.98 c0.14,0,0,0,0,0l0,0l-1.12-0.28c0.56-4.08,0.28-8.29-0.56-12.37c-0.98-4.08-2.67-8.01-4.92-11.52l0.84-0.84l0,0v-0.14 c0-0.42,0.14-0.98,0.42-1.26c1.26-1.12,2.53-1.97,3.93-2.81l0,0c0.28-0.14,0.56-0.28,0.84-0.42c0.56-0.28,0.98-0.56,1.55-0.84 c0.14-0.14,0.28-0.14,0.42-0.28s0-0.14,0-0.28l0,0c1.26-0.98,1.55-2.67,0.56-3.93c-0.42-0.56-1.26-0.98-1.97-0.98 c-0.7,0-1.41,0.28-1.97,0.7l0,0l-0.14,0.14c-0.14,0.14-0.28,0.28-0.42,0.28c-0.42,0.42-0.84,0.84-1.12,1.26 c-0.14,0.28-0.42,0.42-0.56,0.56l0,0c-0.98,1.12-2.25,2.25-3.51,3.09c-0.28,0.14-0.56,0.28-0.84,0.28c-0.14,0-0.42,0-0.56-0.14 l-0.14,0l-1.12,0.7c-1.12-1.12-2.39-2.25-3.51-3.37c-5.2-4.08-11.66-6.6-18.27-7.31l-0.14-1.12l0,0v0.14 c-0.42-0.28-0.56-0.7-0.7-1.12c0-1.55,0-3.09,0.28-4.78v-0.14c0-0.28,0.14-0.56,0.14-0.84c0.14-0.56,0.14-1.12,0.28-1.69V16.9l0,0 c0.14-1.41-0.98-2.81-2.39-2.95c-0.84-0.14-1.69,0.28-2.39,0.98c-0.56,0.56-0.84,1.26-0.84,1.97l0,0v0.7 c0,0.56,0.14,1.12,0.28,1.69c0.14,0.28,0.14,0.56,0.14,0.84v0.14c0.28,1.55,0.28,3.09,0.28,4.78c-0.14,0.42-0.28,0.84-0.7,1.12 v0.28l0,0l-0.14,1.12c-1.55,0.14-3.09,0.42-4.78,0.7c-6.6,1.41-12.65,4.92-17.28,9.84l-0.84-0.56l-0.14,0 c-0.14,0-0.28,0.14-0.56,0.14c-0.28,0-0.56-0.14-0.84-0.28c-1.26-0.98-2.53-2.11-3.51-3.23l0,0c-0.14-0.28-0.42-0.42-0.56-0.56 c-0.42-0.42-0.7-0.84-1.12-1.26c-0.14-0.14-0.28-0.14-0.42-0.28c-0.14-0.14-0.14-0.14-0.14-0.14l0,0c-0.56-0.42-1.26-0.7-1.97-0.7 c-0.84,0-1.55,0.28-1.97,0.98c-0.84,1.26-0.56,2.95,0.56,3.93l0,0c0.14,0,0.14,0.14,0.14,0.14s0.28,0.28,0.42,0.28 c0.42,0.28,0.98,0.56,1.55,0.84c0.28,0.14,0.56,0.28,0.84,0.42l0,0c1.41,0.84,2.81,1.69,3.93,2.81c0.28,0.28,0.56,0.84,0.42,1.26 v-0.14l0,0l0.84,0.84c-0.14,0.28-0.28,0.42-0.42,0.7c-4.36,6.89-6.18,15.04-4.92,23.05l-1.12,0.28l0,0c0,0.14-0.14,0.14-0.14,0.14 c-0.14,0.42-0.56,0.7-0.98,0.98c-1.55,0.42-3.09,0.7-4.78,0.84l0,0c-0.28,0-0.56,0-0.84,0.14c-0.56,0-1.12,0.14-1.69,0.14 c-0.14,0-0.28,0.14-0.56,0.14c-0.14,0-0.14,0-0.28,0.14l0,0c-1.55,0.28-2.53,1.69-2.25,3.23l0,0c0.28,1.26,1.55,2.11,2.81,1.97 c0.28,0,0.42,0,0.7-0.14l0,0c0.14,0,0.14,0,0.14-0.14c0-0.14,0.42,0,0.56,0c0.56-0.14,1.12-0.42,1.55-0.56 c0.28-0.14,0.56-0.28,0.84-0.28h0.14c1.55-0.56,2.95-0.98,4.64-1.26h0.14c0.42,0,0.84,0.14,1.12,0.42c0.14,0,0.14,0.14,0.14,0.14 l0,0l1.26-0.14c2.11,6.46,6.04,12.23,11.52,16.44c1.26,0.98,2.39,1.83,3.79,2.53l-0.7,0.98l0,0c0,0.14,0.14,0.14,0.14,0.14 c0.28,0.42,0.28,0.98,0.14,1.41c-0.56,1.41-1.41,2.81-2.25,4.08v0.14c-0.14,0.28-0.28,0.42-0.56,0.7 c-0.28,0.28-0.56,0.84-0.98,1.41c-0.14,0.14-0.14,0.28-0.28,0.42c0,0,0,0.14-0.14,0.14l0,0c-0.7,1.41-0.14,3.09,1.12,3.79 c0.28,0.14,0.7,0.28,0.98,0.28c1.12,0,2.11-0.7,2.67-1.69l0,0c0,0,0-0.14,0.14-0.14c0-0.14,0.14-0.28,0.28-0.42 c0.14-0.56,0.42-0.98,0.56-1.55l0.28-0.84l0,0c0.42-1.55,1.12-2.95,1.83-4.36c0.28-0.42,0.7-0.7,1.12-0.84c0.14,0,0.14,0,0.14-0.14 l0,0l0.56-1.12c3.93,1.55,8.01,2.25,12.22,2.25c2.53,0,5.06-0.28,7.59-0.98c1.55-0.28,3.09-0.84,4.5-1.26l0.56,0.98l0,0 c0.14,0,0.14,0,0.14,0.14c0.42,0.14,0.84,0.42,1.12,0.84c0.7,1.41,1.41,2.81,1.83,4.36v0.14l0.28,0.84 c0.14,0.56,0.28,1.12,0.56,1.55c0.14,0.14,0.14,0.28,0.28,0.42c0,0,0,0.14,0.14,0.14l0,0c0.56,0.98,1.55,1.69,2.67,1.69 c0.42,0,0.7-0.14,1.12-0.28c0.56-0.28,1.12-0.84,1.26-1.55c0.14-0.7,0.14-1.41-0.14-2.11l0,0c0-0.14-0.14-0.14-0.14-0.14 c0-0.14-0.14-0.28-0.28-0.42c-0.28-0.56-0.56-0.98-0.98-1.41c-0.14-0.28-0.28-0.42-0.56-0.7v-0.28c-0.98-1.26-1.69-2.67-2.25-4.08 c-0.14-0.42-0.14-0.98,0.14-1.41c0-0.14,0.14-0.14,0.14-0.14l0,0l-0.42-1.12c7.17-4.36,12.65-11.1,15.18-19.11l1.12,0.14l0,0 c0.14,0,0.14-0.14,0.14-0.14c0.28-0.28,0.7-0.42,1.12-0.42l0.14,0c1.55,0.28,3.09,0.7,4.5,1.26h0.14c0.28,0.14,0.56,0.28,0.84,0.28 c0.56,0.28,0.98,0.56,1.55,0.7c0.14,0,0.28,0.14,0.56,0.14c0.14,0,0.14,0,0.28,0.14l0,0c0.28,0.14,0.42,0.14,0.7,0.14 c1.26,0,2.39-0.84,2.81-1.97C107.98,70.86,106.85,69.73,105.59,69.45L105.59,69.45L105.59,69.45z M64.98,65.09l-3.79,1.83 l-3.79-1.83l-0.98-4.08l2.67-3.37h4.22l2.67,3.37L64.98,65.09L64.98,65.09z M87.88,55.96c0.7,2.95,0.84,5.9,0.56,8.85l-13.35-3.79 l0,0c-1.26-0.28-1.97-1.55-1.69-2.81c0.14-0.42,0.28-0.7,0.56-0.98l10.54-9.56C86.05,50.2,87.18,53.01,87.88,55.96L87.88,55.96 L87.88,55.96z M80.29,42.47l-11.52,8.15c-0.98,0.56-2.39,0.42-3.09-0.56c-0.28-0.28-0.42-0.56-0.42-0.98l-0.84-14.19 C70.6,35.59,76.08,38.26,80.29,42.47L80.29,42.47L80.29,42.47L80.29,42.47z M54.86,35.3l2.81-0.56l-0.7,14.05l0,0 c0,1.26-1.12,2.25-2.39,2.25c-0.42,0-0.7-0.14-1.12-0.28l-11.66-8.29C45.44,38.96,49.94,36.43,54.86,35.3L54.86,35.3z M37.72,47.67 l10.4,9.27l0,0c0.98,0.84,1.12,2.25,0.28,3.23c-0.28,0.42-0.56,0.56-1.12,0.7l-13.63,3.93C33.22,58.91,34.62,52.87,37.72,47.67 L37.72,47.67z M35.33,71.42l13.91-2.39c1.12,0,2.25,0.7,2.39,1.83c0.14,0.42,0.14,0.98-0.14,1.41l0,0l-5.34,12.93 C41.23,81.96,37.29,77.04,35.33,71.42L35.33,71.42z M67.23,88.84c-1.97,0.42-3.93,0.7-6.04,0.7c-2.95,0-6.04-0.56-8.85-1.41 l6.89-12.51c0.7-0.84,1.83-1.12,2.81-0.56c0.42,0.28,0.7,0.56,1.12,0.98l0,0l6.75,12.23C69.05,88.42,68.21,88.56,67.23,88.84 L67.23,88.84L67.23,88.84z M84.37,76.62c-2.11,3.37-5.06,6.32-8.43,8.43l-5.48-13.21c-0.28-1.12,0.28-2.25,1.26-2.67 c0.42-0.14,0.84-0.28,1.26-0.28l14.05,2.39C86.34,73.24,85.49,75.07,84.37,76.62L84.37,76.62z"/>
  </svg>
)

const ServerLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" role="img" {...props}>
    <rect x="3" y="3" width="18" height="6" rx="1" fill="#9CA3AF" stroke="#6B7280" strokeWidth="0.5"/>
    <circle cx="6" cy="6" r="1" fill="#10B981"/>
    <rect x="9" y="5" width="9" height="2" rx="0.5" fill="#6B7280"/>
    <rect x="3" y="10" width="18" height="6" rx="1" fill="#9CA3AF" stroke="#6B7280" strokeWidth="0.5"/>
    <circle cx="6" cy="13" r="1" fill="#10B981"/>
    <rect x="9" y="12" width="9" height="2" rx="0.5" fill="#6B7280"/>
    <rect x="3" y="17" width="18" height="6" rx="1" fill="#9CA3AF" stroke="#6B7280" strokeWidth="0.5"/>
    <circle cx="6" cy="20" r="1" fill="#10B981"/>
    <rect x="9" y="19" width="9" height="2" rx="0.5" fill="#6B7280"/>
  </svg>
)

// Check items for "What We Check" section
const checkItems = [
  {
    title: 'Table & index bloat',
    description: 'Tables and indexes grow 2-10x larger than needed. We detect and quantify it.',
  },
  {
    title: 'Index hygiene',
    description: 'Missing and unused indexes cause slow reads and heavy writes. We identify them.',
  },
  {
    title: 'Query performance',
    description: 'Slow queries hide inside application traffic. We surface them.',
  },
  {
    title: 'Configuration optimization',
    description: 'Default Postgres settings waste performance headroom. We optimize them.',
  },
  {
    title: 'Autovacuum control',
    description: 'Autovacuum falls behind under real workloads. We bring it under control.',
  },
  {
    title: 'Database observability',
    description: 'Problems appear before outages do. We make them visible.',
  },
]

// How it works steps - generalized
const steps = [
  {
    number: '1',
    title: 'Connect your Postgres database',
    description: 'We only need read-only access. Your data stays yours.',
  },
  {
    number: '2',
    title: 'We run 40+ battle-tested checks',
    description: 'Same checks we use with customers like GitLab, Suno, and Supabase.',
  },
  {
    number: '3',
    title: 'Get your health score + specific fixes',
    description: 'Not generic advice. Actual queries you can run today.',
  },
]

// Platform compatibility items
const platforms = [
  { name: 'AWS RDS', Logo: AwsLogo },
  { name: 'Google Cloud SQL', Logo: GoogleCloudLogo },
  { name: 'Azure Database', Logo: AzureLogo },
  { name: 'Supabase', Logo: SupabaseMark },
  { name: 'Self-managed', Logo: ServerLogo },
  { name: 'Kubernetes', Logo: KubernetesLogo },
]

// FAQ items - generalized for all Postgres users
const faqItems = [
  {
    question: 'Is this really free?',
    answer: 'All Postgres health check reports are free forever - no credit card, no trials, no locked features. Paid plans unlock continuous monitoring and expert recommendations that turn findings into clear, prioritized actions.',
  },
  {
    question: 'Is it safe to connect my database?',
    answer: "We use read-only access. We cannot modify your data. Your connection string is encrypted and deleted after the scan. We've run 5,000+ checks without incident.",
  },
  {
    question: 'Which Postgres versions and platforms do you support?',
    answer: 'We support PostgreSQL 11 and above, running anywhere: AWS RDS, Google Cloud SQL, Azure Database, Supabase, DigitalOcean, self-managed servers, Kubernetes, and more. If you can connect with a standard Postgres connection string, we can check it.',
  },
  {
    question: 'Do I need to install anything?',
    answer: 'No. We connect directly to your database using standard Postgres credentials. No agents, no plugins, no extensions required. Just provide your connection string and we handle the rest.',
  },
  {
    question: 'What if my database is behind a firewall?',
    answer: 'You can whitelist our IP addresses for the duration of the scan, or use an SSH tunnel. We provide detailed instructions for common setups including AWS VPCs, private networks, and bastion hosts.',
  },
  {
    question: 'How is this different from cloud provider dashboards?',
    answer: "Cloud dashboards show you metrics. We show you problems - with specific fixes. We catch issues that don't appear in standard dashboards until they cause outages, like bloat accumulation, missing indexes, and autovacuum lag.",
  },
]

// Trusted companies for this page
const trustedCompanies = [
  { name: 'GitLab', Logo: GitLabLogo, logoScale: 2.2 },
  { name: 'Supabase', Logo: SupabaseLogo, logoScale: 1.2 },
  { name: 'Suno', Logo: SunoLogo, logoScale: 0.68 },
  { name: 'Miro', Logo: MiroLogo, logoScale: 1.4 },
]

interface FAQItemProps {
  question: string
  answer: string
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.faqItem}>
      <button
        className={styles.faqQuestion}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ''}`}>
          &#9660;
        </span>
      </button>
      {isOpen && <div className={styles.faqAnswer}>{answer}</div>}
    </div>
  )
}

// Default static content
const STATIC_CONTENT = {
  heroTitle: "Your Postgres database has hidden problems. Let's find them.",
  heroSubtitle: 'Free health check in 60 seconds. No setup. No credit card. Just answers.',
  bridgeTitle: 'We scan for the issues that kill Postgres databases at scale',
  exampleFinding: 'Missing index on "users.created_at" (causing 3s queries)',
  ctaHint: 'Check my database now',
}

function PostgresCheckPage() {
  const { siteConfig } = useDocusaurusContext()
  const { customFields } = siteConfig
  const { signInUrl, apiUrlPrefix } = customFields

  // State for dynamic variants
  const [variantData, setVariantData] = useState<VariantData | null>(null)
  // Start visible by default for static content (better UX for users without JS or slow connections)
  const [isReady, setIsReady] = useState(true)
  const fetchAttempted = useRef(false)
  const isMounted = useRef(true)

  // Get problem key from URL on mount (client-side only)
  // Empty deps array since we only want this to run once on mount
  useEffect(() => {
    // Reset mounted flag on mount (needed for React StrictMode and remounts)
    isMounted.current = true

    // Only run once
    if (fetchAttempted.current) return
    fetchAttempted.current = true

    const params = new URLSearchParams(window.location.search)
    const problemKey = params.get('problem')

    if (!problemKey) {
      // No variant requested, already showing static content
      trackEvent('landing_page_view', { variant: 'static' })
      return
    }

    // Hide content briefly while fetching variant for fade-in effect
    setIsReady(false)

    // Fetch variant with 5s timeout to prevent infinite loading
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const fetchVariant = async () => {
      const baseUrl = typeof apiUrlPrefix === 'string' ? apiUrlPrefix : ''
      const data = await getLandingVariant(baseUrl, problemKey, controller.signal)
      clearTimeout(timeoutId)

      // Prevent state updates if component unmounted during fetch
      if (!isMounted.current) return

      if (data) {
        setVariantData(data)
        trackEvent('landing_page_view', { variant: problemKey, version: data.version })
      } else {
        // Fallback to static on error/timeout/not found
        trackEvent('landing_page_view', { variant: 'static', fallback_from: problemKey })
      }
      setIsReady(true)
    }

    fetchVariant()

    // Cleanup: cancel pending request and timeout on unmount
    return () => {
      isMounted.current = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (typeof signInUrl !== 'string') {
    console.error('signInUrl customField is not configured in docusaurus.config.js')
    return (
      <Layout title="Configuration error">
        <main className={styles.mainContainer}>
          <p>Page configuration error. Please contact support.</p>
        </main>
      </Layout>
    )
  }

  // Compute display content - variant overrides static (use || to handle empty strings)
  const content = variantData?.content
  const heroTitle = content?.headline_suffix
    ? `Want ${content.headline_suffix}? Let's find out.`
    : STATIC_CONTENT.heroTitle
  const heroSubtitle = content?.hero_subhead || STATIC_CONTENT.heroSubtitle
  const bridgeTitle = content?.bridge_title || STATIC_CONTENT.bridgeTitle
  const exampleFinding = content?.example_finding || STATIC_CONTENT.exampleFinding
  const ctaHint = content?.cta_hint || STATIC_CONTENT.ctaHint

  // Fade-in style
  const fadeStyle: React.CSSProperties = {
    opacity: isReady ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  }

  return (
    <Layout
      title="Free Postgres database health check"
      description="Find hidden issues in your Postgres database. Free health check in 60 seconds. No setup. No credit card. Just answers."
    >
      <main className={styles.mainContainer} style={fadeStyle}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroSubtitle}>{heroSubtitle}</p>
            <a href={signInUrl} className={styles.heroCta}>
              {ctaHint}
            </a>
            <p className={styles.heroTrust}>
              Works with any Postgres: RDS, Cloud SQL, Supabase, self-managed, and more. Read-only access.
            </p>
          </div>
        </section>

        {/* What We Check Section */}
        <section className={styles.checksSection}>
          <h2 className={styles.sectionTitle}>{bridgeTitle}</h2>
          <div className={styles.checksGrid}>
            {checkItems.map((item) => (
              <div key={item.title} className={styles.checkCard}>
                <h3 className={styles.checkTitle}>{item.title}</h3>
                <p className={styles.checkDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorksSection}>
          <h2 className={styles.sectionTitle}>
            Results in 60 seconds. Here's how.
          </h2>
          <div className={styles.stepsContainer}>
            {steps.map((step) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.stepsCta}>
            <a href={signInUrl} className={styles.ctaButton}>
              {ctaHint}
            </a>
          </div>
        </section>

        {/* Sample Results Section */}
        <section className={styles.sampleSection}>
          <h2 className={styles.sectionTitle}>Here's what you'll see</h2>
          <div className={styles.sampleContainer}>
            <pre className={styles.sampleOutput}>{`HEALTH SCORE: 64/100 - Needs Attention
============================================

CRITICAL (2)
|-- Table "events" is 340% bloated (2.1 GiB wasted)
|-- ${exampleFinding}

WARNING (4)
|-- 12 unused indexes consuming 890 MiB
|-- Autovacuum falling behind on "logs" table
|-- Connection pooler at 73% capacity
|-- 3 queries running >5s in last hour

HEALTHY (41 checks passed)`}</pre>
            <p className={styles.sampleCaption}>
              Every issue includes a one-click fix or the exact SQL to run.
            </p>
          </div>
        </section>

        {/* Platform Compatibility Section */}
        <section className={styles.platformSection}>
          <h2 className={styles.sectionTitle}>Works with any Postgres</h2>
          <div className={styles.platformGrid}>
            {platforms.map(({ name, Logo }) => (
              <div key={name} className={styles.platformCard}>
                <Logo className={styles.platformIconSvg} aria-label={name} />
                <span className={styles.platformName}>{name}</span>
              </div>
            ))}
          </div>
          <p className={styles.platformSubtext}>
            Connect via standard Postgres credentials. No agents. No plugins.
          </p>
        </section>

        {/* Social Proof Section */}
        <section className={styles.socialProofSection}>
          <p className={styles.socialProofTitle}>Trusted by teams running serious Postgres</p>
          <div className={styles.logoGrid}>
            {trustedCompanies.map(({ name, Logo, logoScale }) => (
              <div key={name} className={styles.logoCard}>
                {Logo ? (
                  <Logo
                    className={styles.logoSvg}
                    aria-label={name}
                    style={
                      logoScale
                        ? { transform: `scale(${logoScale})`, transformOrigin: 'center' }
                        : undefined
                    }
                  />
                ) : (
                  <span className={styles.logoText}>{name}</span>
                )}
              </div>
            ))}
          </div>
          <blockquote className={styles.testimonial}>
            <p>
              "The PostgresAI team's forensic approach to our database incident provided the technical evidence we needed to gain support and resolution with our infrastructure provider, and their subsequent health check showed valuable insights into our platform's scaling needs."
            </p>
            <cite>
              — Andrew Gershman
              <br />
              Staff SRE at{' '}
              <a href="https://www.linkedin.com/company/cinder-intelligence/" target="_blank" rel="noopener noreferrer">
                Cinder
              </a>
              , USA
              <br />
              Cinder is the industry's first Trust and Safety operations platform to help organizations combat Internet abuse at scale.
            </cite>
          </blockquote>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Questions & answers</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={styles.finalCtaSection}>
          <h2 className={styles.finalCtaTitle}>
            Your database is trying to tell you something.
          </h2>
          <p className={styles.finalCtaSubtitle}>Find out what in 60 seconds.</p>
          <a href={signInUrl} className={styles.finalCtaButton}>
            Run free health check
          </a>
          <p className={styles.finalCtaNote}>
            No signup required for basic scan. Email for detailed report.
          </p>
        </section>
      </main>
    </Layout>
  )
}

export default PostgresCheckPage
