import { lazy } from "react";

// Lazy-loaded util components with prefetch support
const utilImports = {
  base64: () => import("@/components/utils/Base64Converter"),
  color: () => import("@/components/utils/ColorConverter"),
  cron: () => import("@/components/utils/CronParser"),
  curl: () => import("@/components/utils/CurlCodeConverter"),
  hash: () => import("@/components/utils/HashGenerator"),
  httpstatus: () => import("@/components/utils/HttpStatusCodeReference"),
  json: () => import("@/components/utils/JsonFormatter"),
  jwt: () => import("@/components/utils/JwtDecoder"),
  keypair: () => import("@/components/utils/KeyPairGenerator"),
  markdown: () => import("@/components/utils/MarkdownPreview"),
  mimetype: () => import("@/components/utils/MimeTypeLookup"),
  numberbase: () => import("@/components/utils/NumberBaseConverter"),
  regex: () => import("@/components/utils/RegExpTester"),
  sql: () => import("@/components/utils/SqlFormatter"),
  ssl: () => import("@/components/utils/SslCertificateDecoder"),
  string: () => import("@/components/utils/StringAnalyser"),
  diff: () => import("@/components/utils/TextDiff"),
  timestamp: () => import("@/components/utils/TimestampConverter"),
  url: () => import("@/components/utils/UrlEncoderDecoder"),
  uuid: () => import("@/components/utils/UuidGeneratorDecoder"),
  yaml: () => import("@/components/utils/YamlValidator"),
  zlib: () => import("@/components/utils/ZlibCompressor"),
} as const;

export type UtilId = keyof typeof utilImports;

// Cache for prefetched modules
const prefetchCache = new Map<string, Promise<unknown>>();

// Prefetch a util component (call on hover)
// Silently catches errors to avoid issues with page refresh, network failures, etc.
export function prefetchUtil(utilId: string): void {
  try {
    if (utilId in utilImports && !prefetchCache.has(utilId)) {
      const importFn = utilImports[utilId as UtilId];
      const promise = importFn().catch(() => {
        // Remove from cache on error so it can be retried
        prefetchCache.delete(utilId);
      });
      prefetchCache.set(utilId, promise);
    }
  } catch {
    // Silently ignore any errors during prefetch
  }
}

// Create lazy components with the same import functions
export const LazyBase64Converter = lazy(() => utilImports.base64().then(m => ({ default: m.Base64Converter })));
export const LazyColorConverter = lazy(() => utilImports.color().then(m => ({ default: m.ColorConverter })));
export const LazyCronParser = lazy(() => utilImports.cron().then(m => ({ default: m.CronParser })));
export const LazyCurlCodeConverter = lazy(() => utilImports.curl().then(m => ({ default: m.CurlCodeConverter })));
export const LazyHashGenerator = lazy(() => utilImports.hash().then(m => ({ default: m.HashGenerator })));
export const LazyHttpStatusCodeReference = lazy(() => utilImports.httpstatus().then(m => ({ default: m.HttpStatusCodeReference })));
export const LazyJsonFormatter = lazy(() => utilImports.json().then(m => ({ default: m.JsonFormatter })));
export const LazyJwtDecoder = lazy(() => utilImports.jwt().then(m => ({ default: m.JwtDecoder })));
export const LazyKeyPairGenerator = lazy(() => utilImports.keypair().then(m => ({ default: m.KeyPairGenerator })));
export const LazyMarkdownPreview = lazy(() => utilImports.markdown().then(m => ({ default: m.MarkdownPreview })));
export const LazyMimeTypeLookup = lazy(() => utilImports.mimetype().then(m => ({ default: m.MimeTypeLookup })));
export const LazyNumberBaseConverter = lazy(() => utilImports.numberbase().then(m => ({ default: m.NumberBaseConverter })));
export const LazyRegExpTester = lazy(() => utilImports.regex().then(m => ({ default: m.RegExpTester })));
export const LazySqlFormatter = lazy(() => utilImports.sql().then(m => ({ default: m.SqlFormatter })));
export const LazySslCertificateDecoder = lazy(() => utilImports.ssl().then(m => ({ default: m.SslCertificateDecoder })));
export const LazyStringAnalyser = lazy(() => utilImports.string().then(m => ({ default: m.StringAnalyser })));
export const LazyTextDiff = lazy(() => utilImports.diff().then(m => ({ default: m.TextDiff })));
export const LazyTimestampConverter = lazy(() => utilImports.timestamp().then(m => ({ default: m.TimestampConverter })));
export const LazyUrlEncoderDecoder = lazy(() => utilImports.url().then(m => ({ default: m.UrlEncoderDecoder })));
export const LazyUuidGeneratorDecoder = lazy(() => utilImports.uuid().then(m => ({ default: m.UuidGeneratorDecoder })));
export const LazyYamlValidator = lazy(() => utilImports.yaml().then(m => ({ default: m.YamlValidator })));
export const LazyZlibCompressor = lazy(() => utilImports.zlib().then(m => ({ default: m.ZlibCompressor })));
