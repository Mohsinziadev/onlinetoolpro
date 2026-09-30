/**
 * Tools whose page is fully described by the catalog (copy, FAQs, notes) and only
 * need their interface component. The route wraps each one in <ToolPage>.
 * Tools with custom page copy use a module in src/tools/registry.ts instead.
 *
 * Adding a tool: write the component, add its catalog entry, add one line here.
 */
import type { ComponentType } from "react";

type Loader = () => Promise<ComponentType>;
const text = (n: string): Loader => () => import("@/components/tools/text").then((m) => m[n as keyof typeof m] as ComponentType);
const dev = (n: string): Loader => () => import("@/components/tools/developer").then((m) => m[n as keyof typeof m] as ComponentType);
const design = (n: string): Loader => () => import("@/components/tools/design").then((m) => m[n as keyof typeof m] as ComponentType);
const image = (n: string): Loader => () => import("@/components/tools/image").then((m) => m[n as keyof typeof m] as ComponentType);
const pdf = (n: string): Loader => () => import("@/components/tools/pdf").then((m) => m[n as keyof typeof m] as ComponentType);
const misc = (n: string): Loader => () => import("@/components/tools/misc").then((m) => m[n as keyof typeof m] as ComponentType);

export const toolInterfaces: Record<string, Loader> = {
  "text/remove-duplicate-lines": text("RemoveDuplicateLines"),
  "text/sort-lines": text("LineSorter"),
  "text/whitespace-remover": text("WhitespaceRemover"),
  "text/text-diff": text("TextDiff"),
  "text/lorem-ipsum-generator": text("LoremIpsumGenerator"),

  "image/compressor": image("ImageCompressor"),
  "image/resizer": image("ImageResizer"),
  "image/cropper": image("ImageCropper"),
  "image/converter": image("ImageConverter"),
  "image/color-extractor": image("ImageColorExtractor"),
  "image/image-to-base64": image("ImageToBase64"),
  "image/svg-to-png": image("SvgToPng"),

  "pdf/merge": pdf("PdfMerger"),
  "pdf/split": pdf("PdfSplitter"),
  "pdf/images-to-pdf": pdf("ImagesToPdf"),

  "developer/json-formatter": dev("JsonFormatter"),
  "developer/url-encoder": dev("UrlEncoder"),
  "developer/base64": dev("Base64Tool"),
  "developer/html-entities": dev("HtmlEntities"),
  "developer/hash-generator": dev("HashGenerator"),
  "developer/uuid-generator": dev("UuidGenerator"),
  "developer/jwt-decoder": dev("JwtDecoder"),
  "developer/timestamp-converter": dev("TimestampConverter"),
  "developer/regex-tester": dev("RegexTester"),

  "color/color-converter": design("ColorConverter"),
  "color/contrast-checker": design("ContrastChecker"),
  "color/shades-generator": design("ShadesGenerator"),

  "css/gradient-generator": design("GradientGenerator"),
  "css/box-shadow-generator": design("BoxShadowGenerator"),
  "css/border-radius-generator": design("BorderRadiusGenerator"),
  "css/minifier": design("CssMinifier"),

  "productivity/qr-code-generator": misc("QrCodeGenerator"),
  "productivity/password-generator": misc("PasswordGenerator"),
  "productivity/list-randomizer": misc("ListRandomizer"),
  "productivity/random-number-generator": misc("RandomNumberGenerator"),

  "calculators/percentage-calculator": misc("PercentageCalculator"),
  "calculators/age-calculator": misc("AgeCalculator"),

  "seo/meta-tag-generator": misc("MetaTagGenerator"),
  "seo/slug-generator": misc("SlugGenerator"),

  "marketing/utm-builder": misc("UtmBuilder"),
};
