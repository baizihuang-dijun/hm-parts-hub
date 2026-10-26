/**
 * Intrinsic pixel dimensions of the product photos in public/images/products/.
 * Used to emit width/height attributes on <img> so the browser reserves the
 * correct box before the image loads (prevents CLS). Regenerate this map when
 * the photo set changes; scripts/check-data.mjs asserts full coverage.
 */
export const IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  'caterpillar-320d-final-drive.jpg': { width: 1200, height: 1600 },
  'caterpillar-320d-final-drive-2.jpg': { width: 1000, height: 1333 },
  'caterpillar-320d-final-drive-3.jpg': { width: 1000, height: 1333 },
  'caterpillar-330c-final-drive.jpg': { width: 1200, height: 1600 },
  'caterpillar-330c-final-drive-2.jpg': { width: 1000, height: 1333 },
  'caterpillar-330c-final-drive-3.jpg': { width: 1000, height: 1333 },
  'doosan-dx225-final-drive.jpg': { width: 1080, height: 1440 },
  'doosan-dx225-final-drive-2.jpg': { width: 1000, height: 1333 },
  'doosan-dx225-final-drive-3.jpg': { width: 1000, height: 1333 },
  'hitachi-zx200-3-final-drive.jpg': { width: 1200, height: 900 },
  'hitachi-zx200-3-final-drive-2.jpg': { width: 1000, height: 1333 },
  'hitachi-zx330-3-final-drive.jpg': { width: 1080, height: 1440 },
  'hitachi-zx330-3-final-drive-2.jpg': { width: 1000, height: 1333 },
  'hyundai-r140lc-7-final-drive.jpg': { width: 576, height: 738 },
  'hyundai-r485vs-final-drive.jpg': { width: 1200, height: 1600 },
  'hyundai-r485vs-final-drive-2.jpg': { width: 1000, height: 1333 },
  'hyundai-r485vs-final-drive-3.jpg': { width: 1000, height: 1333 },
  'kobelco-sk200-8-final-drive.jpg': { width: 1080, height: 1440 },
  'kobelco-sk200-8-final-drive-2.jpg': { width: 1000, height: 1333 },
  'komatsu-pc200-7-final-drive.jpg': { width: 1080, height: 1273 },
  'sany-sy285-final-drive.jpg': { width: 1090, height: 1080 },
  'volvo-ec220d-final-drive.jpg': { width: 1200, height: 1600 },
  'volvo-ec220d-final-drive-2.jpg': { width: 1000, height: 1333 },
  'volvo-ec220d-final-drive-3.jpg': { width: 1000, height: 1333 },
  'volvo-ec480d-final-drive.jpg': { width: 1080, height: 1920 },
}

/** Fallback box (3:4 portrait) if a file is missing from the map. */
export const FALLBACK_IMAGE_SIZE = { width: 1200, height: 1600 } as const

export function imageSize(file: string): { width: number; height: number } {
  return IMAGE_SIZES[file] ?? FALLBACK_IMAGE_SIZE
}
