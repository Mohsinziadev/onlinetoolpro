/**
 * pdf.js renders PDF pages in a web worker, which must be served as a static file
 * of the same version as the library. Runs after every `npm install` (including on
 * Vercel), copying it to public/pdfjs/. The copy is git-ignored.
 */
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/pdfjs", { recursive: true });
copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdfjs/pdf.worker.min.mjs");
console.log("pdf.js worker → public/pdfjs/pdf.worker.min.mjs");
