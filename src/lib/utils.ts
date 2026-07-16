import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import {
  LazyBase64Converter,
  LazyColorConverter,
  LazyCronParser,
  LazyCurlCodeConverter,
  LazyHashGenerator,
  LazyHttpStatusCodeReference,
  LazyJsonFormatter,
  LazyJwtDecoder,
  LazyKeyPairGenerator,
  LazyMarkdownPreview,
  LazyMimeTypeLookup,
  LazyNumberBaseConverter,
  LazyRegExpTester,
  LazySqlFormatter,
  LazySslCertificateDecoder,
  LazyStringAnalyser,
  LazyTextDiff,
  LazyTimestampConverter,
  LazyUrlEncoderDecoder,
  LazyUuidGeneratorDecoder,
  LazyYamlValidator,
  LazyZlibCompressor,
} from "@/lib/lazyUtils";
import {
  FileKeyIcon,
  Braces,
  FingerprintIcon,
  Binary,
  Clock,
  FileDiffIcon,
  Calendar,
  Palette,
  Hash,
  FileCode,
  FileText,
  Type,
  Zap,
  ShieldCheck,
  Regex,
  Database,
  Link,
  DecimalsArrowRight,
  Globe,
  FileType,
  Key,
  LucideIcon,
  FileSearch,
  TerminalSquare,
} from "lucide-react";

export type UtilCategory = "Encoding & Decoding" | "Formatting & Validation" | "Generators" | "Text & Diff" | "Security & Crypto" | "Reference";

export const utilCategories: UtilCategory[] = [
  "Encoding & Decoding",
  "Formatting & Validation",
  "Generators",
  "Text & Diff",
  "Security & Crypto",
  "Reference",
];

export interface Util {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType<{ initialContent?: string; action?: string; navigate?: (id: string | null) => void }>;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  category: UtilCategory;
}

export const utils: Util[] = [
  { id: "base64", label: "Base64 Converter", icon: DecimalsArrowRight, component: LazyBase64Converter, description: "Encode and decode Base64 strings", color: "from-rose-500 to-rose-600", textColor: "text-rose-600", bgColor: "bg-rose-500/10", category: "Encoding & Decoding" },
  { id: "url", label: "URL Encoder/Decoder", icon: Link, component: LazyUrlEncoderDecoder, description: "Encode and decode URL strings", color: "from-pink-500 to-pink-600", textColor: "text-pink-600", bgColor: "bg-pink-500/10", category: "Encoding & Decoding" },
  { id: "curl", label: "cURL to Code", icon: TerminalSquare, component: LazyCurlCodeConverter, description: "Convert cURL commands to application code", color: "from-stone-500 to-stone-600", textColor: "text-stone-600", bgColor: "bg-stone-500/10", category: "Encoding & Decoding" },
  { id: "numberbase", label: "Number Base Converter", icon: Binary, component: LazyNumberBaseConverter, description: "Convert between binary, octal, decimal, hex", color: "from-yellow-500 to-yellow-600", textColor: "text-yellow-600", bgColor: "bg-yellow-500/10", category: "Encoding & Decoding" },
  { id: "zlib", label: "Zlib Compressor/Decompressor", icon: Zap, component: LazyZlibCompressor, description: "Compress & decompress (zlib + Base64)", color: "from-slate-500 to-slate-600", textColor: "text-slate-600", bgColor: "bg-slate-500/10", category: "Encoding & Decoding" },
  { id: "color", label: "Colour Converter", icon: Palette, component: LazyColorConverter, description: "Convert between colour formats", color: "from-fuchsia-500 to-fuchsia-600", textColor: "text-fuchsia-600", bgColor: "bg-fuchsia-500/10", category: "Encoding & Decoding" },
  { id: "json", label: "JSON Toolbox", icon: Braces, component: LazyJsonFormatter, description: "Format, validate, diff, schema, convert & query", color: "from-amber-500 to-amber-600", textColor: "text-amber-600", bgColor: "bg-amber-500/10", category: "Formatting & Validation" },
  { id: "yaml", label: "YAML Validator", icon: FileCode, component: LazyYamlValidator, description: "Validate and convert YAML", color: "from-lime-500 to-lime-600", textColor: "text-lime-600", bgColor: "bg-lime-500/10", category: "Formatting & Validation" },
  { id: "sql", label: "SQL Formatter", icon: Database, component: LazySqlFormatter, description: "Format SQL for PostgreSQL, MySQL, MariaDB, PL/SQL", color: "from-purple-500 to-purple-600", textColor: "text-purple-600", bgColor: "bg-purple-500/10", category: "Formatting & Validation" },
  { id: "markdown", label: "Markdown", icon: FileText, component: LazyMarkdownPreview, description: "Live preview of markdown", color: "from-orange-500 to-orange-600", textColor: "text-orange-600", bgColor: "bg-orange-500/10", category: "Formatting & Validation" },
  { id: "cron", label: "Cron Parser", icon: Calendar, component: LazyCronParser, description: "Parse and explain cron expressions", color: "from-sky-500 to-sky-600", textColor: "text-sky-600", bgColor: "bg-sky-500/10", category: "Formatting & Validation" },
  { id: "regex", label: "RegExp Tester", icon: Regex, component: LazyRegExpTester, description: "Test and debug regular expressions", color: "from-blue-500 to-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-500/10", category: "Formatting & Validation" },
  { id: "uuid", label: "UUID Generator/Decoder", icon: FingerprintIcon, component: LazyUuidGeneratorDecoder, description: "Generate, validate, and decode UUIDs (versions 1, 3, 4, 5, 6, and 7)", color: "from-cyan-500 to-cyan-600", textColor: "text-cyan-600", bgColor: "bg-cyan-500/10", category: "Generators" },
  { id: "hash", label: "Hash Generator", icon: Hash, component: LazyHashGenerator, description: "Generate MD5, SHA1, SHA256, SHA512, Bcrypt hashes", color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-600", bgColor: "bg-emerald-500/10", category: "Generators" },
  { id: "keypair", label: "Key Pair Generator", icon: Key, component: LazyKeyPairGenerator, description: "Generate RSA/Ed25519/ECDSA key pairs for SSL & SSH", color: "from-red-800 to-red-900", textColor: "text-red-800", bgColor: "bg-red-800/10", category: "Generators" },
  { id: "timestamp", label: "Timestamp/Date Converter", icon: Clock, component: LazyTimestampConverter, description: "Convert Unix timestamps to dates, diff, and more", color: "from-teal-500 to-teal-600", textColor: "text-teal-600", bgColor: "bg-teal-500/10", category: "Generators" },
  { id: "string", label: "String Analyser", icon: Type, component: LazyStringAnalyser, description: "Analyse text stats and convert case", color: "from-violet-500 to-violet-600", textColor: "text-violet-600", bgColor: "bg-violet-500/10", category: "Text & Diff" },
  { id: "diff", label: "Text Diff", icon: FileDiffIcon, component: LazyTextDiff, description: "Compare texts and find differences", color: "from-red-500 to-red-600", textColor: "text-red-600", bgColor: "bg-red-500/10", category: "Text & Diff" },
  { id: "jwt", label: "JWT Decoder/Encoder", icon: FileKeyIcon, component: LazyJwtDecoder, description: "Decode, Encode and validate JWT tokens", color: "from-indigo-500 to-indigo-600", textColor: "text-indigo-600", bgColor: "bg-indigo-500/10", category: "Security & Crypto" },
  { id: "ssl", label: "SSL Certificate Decoder", icon: ShieldCheck, component: LazySslCertificateDecoder, description: "Decode and inspect X.509 certificates", color: "from-green-500 to-green-600", textColor: "text-green-600", bgColor: "bg-green-500/10", category: "Security & Crypto" },
  { id: "httpstatus", label: "HTTP Status Code Reference", icon: Globe, component: LazyHttpStatusCodeReference, description: "Lookup HTTP status codes and their meanings", color: "from-cyan-700 to-cyan-800", textColor: "text-cyan-700", bgColor: "bg-cyan-700/10", category: "Reference" },
  { id: "mimetype", label: "MIME Type Lookup", icon: FileSearch, component: LazyMimeTypeLookup, description: "Convert between file extensions and MIME types", color: "from-green-700 to-green-800", textColor: "text-green-700", bgColor: "bg-green-700/10", category: "Reference" }
];

export type { } from "./stringUtils"
export { length, charCount, wordCount, lineCount, toLowerCase, toUpperCase } from "./stringUtils"
