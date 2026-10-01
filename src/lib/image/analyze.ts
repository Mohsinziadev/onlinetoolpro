/**
 * Pure pixel-analysis functions. Everything here operates on ImageData and is
 * deterministic, so results are reproducible for the same image.
 *
 * These are descriptive measurements of an image. None of them predicts
 * click-through rate or performance.
 */

export type Rgb = [number, number, number];

export type ColorSwatch = { rgb: Rgb; hex: string; share: number };

export type BlockGrid = {
  cols: number;
  rows: number;
  blockSize: number;
  /** per-block values, row-major */
  edgeDensity: Float32Array;
  lumaStd: Float32Array;
  textLike: Uint8Array;
  saliency: Float32Array;
};

export type ThumbnailAnalysis = {
  width: number;
  height: number;
  brightness: number; // 0–100, mean luma
  contrastRms: number; // 0–100, RMS contrast (std of luma / 255)
  lumaP5: number;
  lumaP95: number;
  dynamicRange: number; // p95 - p5, 0–100
  saturation: number; // 0–100, mean HSV saturation
  colorfulness: number; // Hasler–Süsstrunk M metric
  colorfulnessLabel: string;
  colorDiversity: number; // 0–100, normalized entropy of quantized colors
  hueFamilies: number; // number of hue families with ≥ 3% share
  dominantColors: ColorSwatch[];
  lumaHistogram: number[]; // 32 bins, fractions
  edgeDensity: number; // 0–100, % pixels on a strong edge
  spatialInformation: number; // ITU-T P.910 SI (std of Sobel magnitude)
  complexityLabel: "Low" | "Moderate" | "High";
  lowDetailArea: number; // 0–100, % of blocks that are flat/quiet
  textLikeArea: number; // 0–100, % of blocks classified as text-like
  subject: {
    x: number; // 0–1 centroid
    y: number;
    box: { x: number; y: number; w: number; h: number }; // normalized
    region: string; // e.g. "right third, middle"
  };
  grid: BlockGrid;
  /** Sobel magnitude per analysis pixel (for overlays) */
  edgeMagnitude: Float32Array;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Rec. 709 luma on gamma-encoded values (perceptual brightness proxy). */
export function lumaArray(data: ImageData): Float32Array {
  const { data: px, width, height } = data;
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    out[i] = 0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2];
  }
  return out;
}

/** Sobel gradient magnitude. Border pixels are 0. */
export function sobel(luma: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const tl = luma[i - width - 1],
        t = luma[i - width],
        tr = luma[i - width + 1];
      const l = luma[i - 1],
        r = luma[i + 1];
      const bl = luma[i + width - 1],
        b = luma[i + width],
        br = luma[i + width + 1];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      out[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return out;
}

function mean(arr: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function std(arr: ArrayLike<number>, m = mean(arr)): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += (arr[i] - m) ** 2;
  return Math.sqrt(s / arr.length);
}

function percentileFromHistogram(hist: Uint32Array, total: number, p: number): number {
  const target = total * p;
  let acc = 0;
  for (let i = 0; i < hist.length; i++) {
    acc += hist[i];
    if (acc >= target) return i;
  }
  return hist.length - 1;
}

/** Deterministic PRNG so k-means gives the same result every run. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** k-means++ on a pixel sample. Returns clusters sorted by share. */
export function dominantColors(data: ImageData, k = 6, sampleSize = 6000): ColorSwatch[] {
  const { data: px } = data;
  const total = px.length / 4;
  const step = Math.max(1, Math.floor(total / sampleSize));
  const samples: Rgb[] = [];
  for (let i = 0; i < total; i += step) {
    const p = i * 4;
    if (px[p + 3] < 16) continue; // skip transparent
    samples.push([px[p], px[p + 1], px[p + 2]]);
  }
  if (samples.length === 0) return [];
  const rand = mulberry32(42);
  const dist2 = (a: Rgb, b: Rgb) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

  const centers: Rgb[] = [samples[Math.floor(rand() * samples.length)]];
  while (centers.length < k) {
    const d = samples.map((s) => Math.min(...centers.map((c) => dist2(s, c))));
    const sum = d.reduce((a, b) => a + b, 0);
    if (sum === 0) break;
    let r = rand() * sum;
    let idx = 0;
    for (; idx < d.length - 1; idx++) {
      r -= d[idx];
      if (r <= 0) break;
    }
    centers.push([...samples[idx]] as Rgb);
  }

  const assign = new Int32Array(samples.length);
  for (let iter = 0; iter < 12; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < samples.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dd = dist2(samples[i], centers[c]);
        if (dd < bestD) {
          bestD = dd;
          best = c;
        }
      }
      assign[i] = best;
      const s = sums[best];
      s[0] += samples[i][0];
      s[1] += samples[i][1];
      s[2] += samples[i][2];
      s[3]++;
    }
    for (let c = 0; c < centers.length; c++) {
      const s = sums[c];
      if (s[3] > 0) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    }
  }

  const counts = new Array(centers.length).fill(0);
  for (let i = 0; i < samples.length; i++) counts[assign[i]]++;
  return centers
    .map((c, i) => ({ rgb: c.map(Math.round) as Rgb, hex: toHex(c), share: counts[i] / samples.length }))
    .filter((c) => c.share > 0.005)
    .sort((a, b) => b.share - a.share);
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max / 255];
}

/** Hasler & Süsstrunk (2003) colorfulness metric and its published labels. */
function colorfulnessOf(data: ImageData): { value: number; label: string } {
  const { data: px } = data;
  const n = px.length / 4;
  let sumRg = 0,
    sumYb = 0,
    sumRg2 = 0,
    sumYb2 = 0;
  for (let p = 0; p < px.length; p += 4) {
    const rg = px[p] - px[p + 1];
    const yb = 0.5 * (px[p] + px[p + 1]) - px[p + 2];
    sumRg += rg;
    sumYb += yb;
    sumRg2 += rg * rg;
    sumYb2 += yb * yb;
  }
  const mRg = sumRg / n,
    mYb = sumYb / n;
  const sRg = Math.sqrt(Math.max(0, sumRg2 / n - mRg * mRg));
  const sYb = Math.sqrt(Math.max(0, sumYb2 / n - mYb * mYb));
  const value = Math.sqrt(sRg ** 2 + sYb ** 2) + 0.3 * Math.sqrt(mRg ** 2 + mYb ** 2);
  const label =
    value < 15
      ? "Not colorful"
      : value < 33
        ? "Slightly colorful"
        : value < 45
          ? "Moderately colorful"
          : value < 59
            ? "Averagely colorful"
            : value < 82
              ? "Quite colorful"
              : value < 109
                ? "Highly colorful"
                : "Extremely colorful";
  return { value, label };
}

const THIRDS_X = ["left third", "center", "right third"];
const THIRDS_Y = ["top", "middle", "bottom"];

/** Strong-edge threshold on Sobel magnitude (0 … ~1442 for 8-bit luma). */
export const EDGE_THRESHOLD = 110;

/**
 * Block-level classification. A block is "text-like" when it has dense strong
 * edges AND a wide local luminance spread (dark strokes on light fill or vice
 * versa) AND a horizontally adjacent block that also qualifies — text sits on
 * horizontal lines. This is a heuristic approximation, not OCR.
 */
function buildGrid(
  data: ImageData,
  luma: Float32Array,
  mag: Float32Array,
  blockSize: number,
): BlockGrid {
  const { width, height, data: px } = data;
  const cols = Math.ceil(width / blockSize);
  const rows = Math.ceil(height / blockSize);
  const edgeDensity = new Float32Array(cols * rows);
  const lumaStd = new Float32Array(cols * rows);
  const spread = new Float32Array(cols * rows);
  const meanR = new Float32Array(cols * rows);
  const meanG = new Float32Array(cols * rows);
  const meanB = new Float32Array(cols * rows);

  const vals: number[] = [];
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      vals.length = 0;
      let edges = 0,
        count = 0,
        cr = 0,
        cg = 0,
        cb = 0;
      const y1 = Math.min(height, (by + 1) * blockSize);
      const x1 = Math.min(width, (bx + 1) * blockSize);
      for (let y = by * blockSize; y < y1; y++) {
        for (let x = bx * blockSize; x < x1; x++) {
          const i = y * width + x;
          vals.push(luma[i]);
          if (mag[i] > EDGE_THRESHOLD) edges++;
          cr += px[i * 4];
          cg += px[i * 4 + 1];
          cb += px[i * 4 + 2];
          count++;
        }
      }
      const b = by * cols + bx;
      edgeDensity[b] = edges / count;
      lumaStd[b] = std(vals);
      vals.sort((a, c) => a - c);
      spread[b] = vals[Math.floor(vals.length * 0.92)] - vals[Math.floor(vals.length * 0.08)];
      meanR[b] = cr / count;
      meanG[b] = cg / count;
      meanB[b] = cb / count;
    }
  }

  const candidate = new Uint8Array(cols * rows);
  for (let b = 0; b < candidate.length; b++) {
    candidate[b] = edgeDensity[b] > 0.14 && spread[b] > 85 ? 1 : 0;
  }
  // Morphological closing: bridge short horizontal gaps (letter interiors,
  // word spaces) and fill blocks sandwiched vertically between candidates.
  const closed = candidate.slice();
  for (let by = 0; by < rows; by++) {
    let last = -10;
    for (let bx = 0; bx < cols; bx++) {
      if (!candidate[by * cols + bx]) continue;
      if (bx - last > 1 && bx - last <= 3) for (let k = last + 1; k < bx; k++) closed[by * cols + k] = 1;
      last = bx;
    }
  }
  for (let by = 1; by < rows - 1; by++) {
    for (let bx = 0; bx < cols; bx++) {
      const b = by * cols + bx;
      if (!closed[b] && closed[b - cols] && closed[b + cols]) closed[b] = 1;
    }
  }
  // Text sits on horizontal lines: keep only runs of ≥ 3 blocks.
  const textLike = new Uint8Array(cols * rows);
  for (let by = 0; by < rows; by++) {
    let start = -1;
    for (let bx = 0; bx <= cols; bx++) {
      const on = bx < cols && closed[by * cols + bx] === 1;
      if (on && start < 0) start = bx;
      if (!on && start >= 0) {
        if (bx - start >= 3) for (let k = start; k < bx; k++) textLike[by * cols + k] = 1;
        start = -1;
      }
    }
  }

  // Center-surround color contrast: block color vs. the mean of its
  // neighborhood (radius 3 blocks). Large flat areas score low.
  const colorDist = new Float32Array(cols * rows);
  const R = 3;
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      let sr = 0,
        sg = 0,
        sb = 0,
        c = 0;
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const yy = by + dy,
            xx = bx + dx;
          if ((dx === 0 && dy === 0) || yy < 0 || yy >= rows || xx < 0 || xx >= cols) continue;
          const nb = yy * cols + xx;
          sr += meanR[nb];
          sg += meanG[nb];
          sb += meanB[nb];
          c++;
        }
      }
      const b = by * cols + bx;
      colorDist[b] = c ? Math.sqrt((meanR[b] - sr / c) ** 2 + (meanG[b] - sg / c) ** 2 + (meanB[b] - sb / c) ** 2) : 0;
    }
  }

  // Saliency: normalized edge energy + center-surround color contrast, then 3×3 box blur
  const maxEdge = Math.max(...edgeDensity) || 1;
  const maxColor = Math.max(...colorDist) || 1;
  const raw = new Float32Array(cols * rows);
  for (let b = 0; b < raw.length; b++) raw[b] = 0.55 * (edgeDensity[b] / maxEdge) + 0.45 * (colorDist[b] / maxColor);
  const saliency = new Float32Array(cols * rows);
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      let s = 0,
        c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const yy = by + dy,
            xx = bx + dx;
          if (yy < 0 || yy >= rows || xx < 0 || xx >= cols) continue;
          s += raw[yy * cols + xx];
          c++;
        }
      }
      saliency[by * cols + bx] = s / c;
    }
  }

  return { cols, rows, blockSize, edgeDensity, lumaStd, textLike, saliency };
}

export function analyzeImage(data: ImageData): ThumbnailAnalysis {
  const { width, height, data: px } = data;
  const luma = lumaArray(data);
  const n = luma.length;

  // Luma statistics
  const hist256 = new Uint32Array(256);
  for (let i = 0; i < n; i++) hist256[Math.min(255, Math.round(luma[i]))]++;
  const mLuma = mean(luma);
  const sLuma = std(luma, mLuma);
  const p5 = percentileFromHistogram(hist256, n, 0.05);
  const p95 = percentileFromHistogram(hist256, n, 0.95);
  const lumaHistogram = new Array(32).fill(0);
  for (let i = 0; i < 256; i++) lumaHistogram[i >> 3] += hist256[i] / n;

  // Saturation + hue families + quantized color entropy
  let satSum = 0;
  const hueBins = new Array(12).fill(0);
  const quant = new Map<number, number>();
  for (let p = 0; p < px.length; p += 4) {
    const [h, s, v] = rgbToHsv(px[p], px[p + 1], px[p + 2]);
    satSum += s;
    if (s > 0.2 && v > 0.15) hueBins[Math.floor(h / 30) % 12]++;
    const key = ((px[p] >> 5) << 6) | ((px[p + 1] >> 5) << 3) | (px[p + 2] >> 5); // 8×8×8 bins
    quant.set(key, (quant.get(key) ?? 0) + 1);
  }
  let entropy = 0;
  for (const c of quant.values()) {
    const pr = c / n;
    entropy -= pr * Math.log2(pr);
  }
  const colorDiversity = (entropy / 9) * 100; // log2(512) = 9
  const hueFamilies = hueBins.filter((c) => c / n >= 0.03).length;

  // Edges
  const mag = sobel(luma, width, height);
  let strong = 0;
  for (let i = 0; i < n; i++) if (mag[i] > EDGE_THRESHOLD) strong++;
  const si = std(mag);
  const complexityLabel: ThumbnailAnalysis["complexityLabel"] = si < 45 ? "Low" : si < 85 ? "Moderate" : "High";

  const blockSize = Math.max(8, Math.round(width / 40));
  const grid = buildGrid(data, luma, mag, blockSize);
  const blocks = grid.cols * grid.rows;
  let quiet = 0,
    text = 0;
  for (let b = 0; b < blocks; b++) {
    if (grid.lumaStd[b] < 7 && grid.edgeDensity[b] < 0.02) quiet++;
    if (grid.textLike[b]) text++;
  }

  // Subject: strongest connected region of the top-15% saliency blocks,
  // excluding text-like blocks (text is reported separately).
  const subjectSal = Float32Array.from(grid.saliency, (v, b) => (grid.textLike[b] ? 0 : v));
  const sorted = Array.from(subjectSal).sort((a, b) => b - a);
  const cutoff = sorted[Math.floor(sorted.length * 0.15)] ?? 0;
  const label = new Int32Array(blocks).fill(-1);
  let bestWeight = 0;
  let bestLabel = -1;
  let nextLabel = 0;
  for (let start = 0; start < blocks; start++) {
    if (label[start] >= 0 || subjectSal[start] < cutoff || subjectSal[start] === 0) continue;
    const stack = [start];
    label[start] = nextLabel;
    let weight = 0;
    while (stack.length) {
      const b = stack.pop() as number;
      weight += subjectSal[b];
      const bx = b % grid.cols;
      const nbrs = [b - grid.cols, b + grid.cols, bx > 0 ? b - 1 : -1, bx < grid.cols - 1 ? b + 1 : -1];
      for (const nb of nbrs) {
        if (nb < 0 || nb >= blocks || label[nb] >= 0 || subjectSal[nb] < cutoff || subjectSal[nb] === 0) continue;
        label[nb] = nextLabel;
        stack.push(nb);
      }
    }
    if (weight > bestWeight) {
      bestWeight = weight;
      bestLabel = nextLabel;
    }
    nextLabel++;
  }
  let sx = 0,
    sy = 0,
    sw = 0,
    minX = grid.cols,
    minY = grid.rows,
    maxX = 0,
    maxY = 0;
  for (let b = 0; b < blocks; b++) {
    if (label[b] !== bestLabel) continue;
    const bx = b % grid.cols;
    const by = Math.floor(b / grid.cols);
    const s = subjectSal[b];
    sx += (bx + 0.5) * s;
    sy += (by + 0.5) * s;
    sw += s;
    minX = Math.min(minX, bx);
    minY = Math.min(minY, by);
    maxX = Math.max(maxX, bx);
    maxY = Math.max(maxY, by);
  }
  if (sw === 0) {
    minX = 0;
    minY = 0;
    maxX = grid.cols - 1;
    maxY = grid.rows - 1;
  }
  const cx = sw ? sx / sw / grid.cols : 0.5;
  const cy = sw ? sy / sw / grid.rows : 0.5;
  const region = `${THIRDS_X[Math.min(2, Math.floor(cx * 3))]}, ${THIRDS_Y[Math.min(2, Math.floor(cy * 3))]}`.replace(
    "center, middle",
    "center",
  );

  const colorful = colorfulnessOf(data);

  return {
    width,
    height,
    brightness: (mLuma / 255) * 100,
    contrastRms: (sLuma / 255) * 100,
    lumaP5: (p5 / 255) * 100,
    lumaP95: (p95 / 255) * 100,
    dynamicRange: ((p95 - p5) / 255) * 100,
    saturation: (satSum / n) * 100,
    colorfulness: colorful.value,
    colorfulnessLabel: colorful.label,
    colorDiversity: clamp01(colorDiversity / 100) * 100,
    hueFamilies,
    dominantColors: dominantColors(data),
    lumaHistogram,
    edgeDensity: (strong / n) * 100,
    spatialInformation: si,
    complexityLabel,
    lowDetailArea: (quiet / blocks) * 100,
    textLikeArea: (text / blocks) * 100,
    subject: {
      x: cx,
      y: cy,
      box: {
        x: minX / grid.cols,
        y: minY / grid.rows,
        w: (maxX - minX + 1) / grid.cols,
        h: (maxY - minY + 1) / grid.rows,
      },
      region,
    },
    grid,
    edgeMagnitude: mag,
  };
}

/**
 * Fraction of edge energy that survives downscaling to `scaledWidth` and
 * upscaling back. Optionally restricted to a block mask (e.g. text-like blocks).
 */
export function detailRetention(
  original: ImageData,
  roundTrip: ImageData,
  mask?: { grid: BlockGrid; blocks: Uint8Array },
): number {
  const lo = lumaArray(original);
  const lr = lumaArray(roundTrip);
  const mo = sobel(lo, original.width, original.height);
  const mr = sobel(lr, roundTrip.width, roundTrip.height);
  let eo = 0,
    er = 0;
  for (let y = 0; y < original.height; y++) {
    for (let x = 0; x < original.width; x++) {
      if (mask) {
        const b = Math.floor(y / mask.grid.blockSize) * mask.grid.cols + Math.floor(x / mask.grid.blockSize);
        if (!mask.blocks[b]) continue;
      }
      const i = y * original.width + x;
      eo += mo[i];
      er += Math.min(mr[i], mo[i] * 1.5); // cap ringing/sharpening artefacts
    }
  }
  return eo === 0 ? 1 : clamp01(er / eo);
}

/** Relative-luminance contrast ratio (WCAG formula) between two sRGB colors. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const L = (c: Rgb) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const la = L(a),
    lb = L(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
