export interface PackItem {
  name: string
  width: number
  height: number
  qty: number
  allowRotate: boolean
}

export interface PackRect {
  x: number
  y: number
  width: number
  height: number
  type: 'part' | 'waste'
  name: string
}

export interface PackSheetResult {
  rects: PackRect[]
  cuts: number
  placedCount: number
}

export interface PackResult {
  sheets: PackSheetResult[]
  notFit: { name: string; width: number; height: number; qty: number }[]
}

export interface FixedSheetConfig {
  id: number
  stockWidth: number
  stockHeight: number
  kerf: number
  name: string
}

export interface FixedSheetPackResult extends PackSheetResult {
  sheetConfigId: number
}

export type AlgorithmChoice = 'all' | 'maxrects' | 'guillotine' | 'strip' | 'skyline'

export const ALGORITHM_LABELS: Record<Exclude<AlgorithmChoice, 'all'>, string> = {
  maxrects: 'MaxRects',
  guillotine: 'Guillotine',
  strip: 'Strip',
  skyline: 'Skyline',
}

// ─── Free Rectangle (MaxRects) ────────────────────────────────────────────────

interface FreeRect {
  x: number; y: number; w: number; h: number
}

function intersects(a: FreeRect, b: FreeRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function splitFree(free: FreeRect, placed: FreeRect): FreeRect[] {
  const result: FreeRect[] = []
  if (!intersects(free, placed)) return [free]
  if (placed.x > free.x) result.push({ x: free.x, y: free.y, w: placed.x - free.x, h: free.h })
  if (placed.x + placed.w < free.x + free.w) result.push({ x: placed.x + placed.w, y: free.y, w: (free.x + free.w) - (placed.x + placed.w), h: free.h })
  if (placed.y > free.y) result.push({ x: free.x, y: free.y, w: free.w, h: placed.y - free.y })
  if (placed.y + placed.h < free.y + free.h) result.push({ x: free.x, y: placed.y + placed.h, w: free.w, h: (free.y + free.h) - (placed.y + placed.h) })
  return result
}

function pruneFreeRects(rects: FreeRect[]): FreeRect[] {
  return rects.filter((a, i) =>
    !rects.some((b, j) => j !== i && b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h)
  )
}

function buildWasteRects(placed: PackRect[], sw: number, sh: number): PackRect[] {
  const parts = placed.filter(r => r.type === 'part')
  if (!parts.length) return [{ x: 0, y: 0, width: sw, height: sh, type: 'waste', name: '' }]

  const xs = Array.from(new Set([0, sw, ...parts.flatMap(r => [r.x, r.x + r.width])]))
    .filter(x => x >= 0 && x <= sw)
    .sort((a, b) => a - b)
  const ys = Array.from(new Set([0, sh, ...parts.flatMap(r => [r.y, r.y + r.height])]))
    .filter(y => y >= 0 && y <= sh)
    .sort((a, b) => a - b)

  const waste: PackRect[] = []
  for (let yi = 0; yi < ys.length - 1; yi++) {
    for (let xi = 0; xi < xs.length - 1; xi++) {
      const x = xs[xi]
      const y = ys[yi]
      const width = xs[xi + 1] - x
      const height = ys[yi + 1] - y
      if (width < 10 || height < 10) continue

      const occupied = parts.some(part =>
        x >= part.x &&
        y >= part.y &&
        x + width <= part.x + part.width &&
        y + height <= part.y + part.height
      )
      if (!occupied) waste.push({ x, y, width, height, type: 'waste', name: '' })
    }
  }

  return waste
}

type Heuristic = 'BSSF' | 'BLSF' | 'BAF' | 'BL' | 'CP'

function scoreFreeRect(free: FreeRect, pw: number, ph: number, h: Heuristic): number {
  switch (h) {
    case 'BSSF': return Math.min(free.w - pw, free.h - ph)
    case 'BLSF': return Math.max(free.w - pw, free.h - ph)
    case 'BAF':  return free.w * free.h - pw * ph
    case 'BL':   return free.y + ph
    case 'CP':   {
      let contact = 0
      if (free.x === 0) contact += ph
      if (free.y === 0) contact += pw
      return -contact
    }
  }
}

type SortOrder = 'area-desc' | 'area-asc' | 'w-desc' | 'h-desc' | 'perim-desc' | 'ratio-desc' | 'ratio-asc' | 'w-asc' | 'h-asc' | 'random'

function sortItems(items: PackItem[], order: SortOrder): PackItem[] {
  const arr = [...items]
  switch (order) {
    case 'area-desc':  arr.sort((a, b) => b.width * b.height - a.width * a.height); break
    case 'area-asc':   arr.sort((a, b) => a.width * a.height - b.width * b.height); break
    case 'w-desc':     arr.sort((a, b) => b.width - a.width); break
    case 'h-desc':     arr.sort((a, b) => b.height - a.height); break
    case 'perim-desc': arr.sort((a, b) => (b.width + b.height) - (a.width + a.height)); break
    case 'ratio-desc': arr.sort((a, b) => (b.width / b.height) - (a.width / a.height)); break
    case 'ratio-asc':  arr.sort((a, b) => (a.width / a.height) - (b.width / b.height)); break
    case 'w-asc':      arr.sort((a, b) => a.width - b.width); break
    case 'h-asc':      arr.sort((a, b) => a.height - b.height); break
    case 'random':     arr.sort(() => Math.random() - 0.5); break
  }
  return arr
}

function maxRectsPackSingle(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
  heuristic: Heuristic,
  sortOrder: SortOrder,
): { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } {
  let freeRects: FreeRect[] = [{ x: 0, y: 0, w: sw, h: sh }]
  const placed: PackRect[] = []
  const notFitItems: PackItem[] = []
  const sorted = sortItems(items, sortOrder)

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    let pw = item.width + kerf
    let ph = item.height + kerf
    let bestScore = Infinity
    let bestFree: FreeRect | null = null
    let bestRotated = false

    for (const free of freeRects) {
      if (pw <= free.w && ph <= free.h) {
        const score = scoreFreeRect(free, pw, ph, heuristic)
        if (score < bestScore) { bestScore = score; bestFree = free; bestRotated = false }
      }
      if (item.allowRotate && ph <= free.w && pw <= free.h) {
        const score = scoreFreeRect(free, ph, pw, heuristic)
        if (score < bestScore) { bestScore = score; bestFree = free; bestRotated = true }
      }
    }

    if (!bestFree) {
      notFitItems.push(item)
      continue
    }

    if (bestRotated) { [pw, ph] = [ph, pw] }
    const rect: FreeRect = { x: bestFree.x, y: bestFree.y, w: pw - kerf, h: ph - kerf }

    placed.push({
      x: rect.x, y: rect.y,
      width: rect.w, height: rect.h,
      type: 'part', name: item.name,
    })

    const usedRect: FreeRect = { x: rect.x, y: rect.y, w: pw, h: ph }
    freeRects = pruneFreeRects(freeRects.flatMap(f => splitFree(f, usedRect)))
  }

  const wasteRects = buildWasteRects(placed, sw, sh)

  return {
    rects: [...placed, ...wasteRects],
    notFitItems,
    placedCount: placed.length,
  }
}

function estimateCuts(parts: PackRect[], sw: number, sh: number): number {
  const xs = new Set<number>()
  const ys = new Set<number>()
  for (const p of parts) {
    if (p.x > 1) xs.add(Math.round(p.x))
    if (p.x + p.width < sw - 1) xs.add(Math.round(p.x + p.width))
    if (p.y > 1) ys.add(Math.round(p.y))
    if (p.y + p.height < sh - 1) ys.add(Math.round(p.y + p.height))
  }
  return xs.size + ys.size
}

function isGuillotineCuttable(parts: PackRect[], sw: number, sh: number): boolean {
  const placed = parts.filter(r => r.type === 'part')
  if (placed.length <= 1) return true

  const memo = new Map<string, boolean>()

  const canSplit = (subset: PackRect[], x0: number, y0: number, x1: number, y1: number): boolean => {
    if (subset.length <= 1) return true

    const key = `${x0}|${y0}|${x1}|${y1}|${subset
      .map(r => `${r.x},${r.y},${r.width},${r.height},${r.name}`)
      .sort()
      .join(';')}`
    const cached = memo.get(key)
    if (cached !== undefined) return cached

    const verticalCuts = Array.from(new Set(
      subset.flatMap(r => [r.x, r.x + r.width]).filter(x => x > x0 && x < x1)
    )).sort((a, b) => a - b)

    for (const cutX of verticalCuts) {
      const left: PackRect[] = []
      const right: PackRect[] = []
      let blocked = false

      for (const rect of subset) {
        if (rect.x + rect.width <= cutX) left.push(rect)
        else if (rect.x >= cutX) right.push(rect)
        else {
          blocked = true
          break
        }
      }

      if (!blocked && left.length > 0 && right.length > 0 &&
        canSplit(left, x0, y0, cutX, y1) &&
        canSplit(right, cutX, y0, x1, y1)) {
        memo.set(key, true)
        return true
      }
    }

    const horizontalCuts = Array.from(new Set(
      subset.flatMap(r => [r.y, r.y + r.height]).filter(y => y > y0 && y < y1)
    )).sort((a, b) => a - b)

    for (const cutY of horizontalCuts) {
      const top: PackRect[] = []
      const bottom: PackRect[] = []
      let blocked = false

      for (const rect of subset) {
        if (rect.y + rect.height <= cutY) top.push(rect)
        else if (rect.y >= cutY) bottom.push(rect)
        else {
          blocked = true
          break
        }
      }

      if (!blocked && top.length > 0 && bottom.length > 0 &&
        canSplit(top, x0, y0, x1, cutY) &&
        canSplit(bottom, x0, cutY, x1, y1)) {
        memo.set(key, true)
        return true
      }
    }

    memo.set(key, false)
    return false
  }

  return canSplit(placed, 0, 0, sw, sh)
}

// ─── Guillotine Packer ────────────────────────────────────────────────────────
// Priority: maximize wide remnant (prefer keeping sheet width intact)

function guillotinePackSingle(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
): { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } {
  // Sort by area desc for better packing
  const sorted = [...items].sort((a, b) => b.width * b.height - a.width * a.height)
  const placed: PackRect[] = []
  const notFitItems: PackItem[] = []

  // Free rectangles, start with full sheet
  let freeRects: FreeRect[] = [{ x: 0, y: 0, w: sw, h: sh }]

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    let pw = item.width + kerf
    let ph = item.height + kerf
    let bestFreeIdx = -1
    let bestRotated = false
    let bestWasteScore = Infinity

    for (let fi = 0; fi < freeRects.length; fi++) {
      const free = freeRects[fi]
      // No rotation
      if (pw <= free.w && ph <= free.h) {
        // Score: minimize waste, prefer placing at left (keep wide right remnant)
        const waste = free.w * free.h - pw * ph
        const score = waste + free.y * 10000 // prefer top
        if (score < bestWasteScore) { bestWasteScore = score; bestFreeIdx = fi; bestRotated = false }
      }
      // Rotated
      if (item.allowRotate && ph <= free.w && pw <= free.h) {
        const waste = free.w * free.h - ph * pw
        const score = waste + free.y * 10000
        if (score < bestWasteScore) { bestWasteScore = score; bestFreeIdx = fi; bestRotated = true }
      }
    }

    if (bestFreeIdx < 0) { notFitItems.push(item); continue }

    if (bestRotated) { [pw, ph] = [ph, pw] }
    const free = freeRects[bestFreeIdx]

    placed.push({
      x: free.x, y: free.y,
      width: pw - kerf, height: ph - kerf,
      type: 'part', name: item.name,
    })

    // Guillotine split: prefer horizontal cut (keep wide right remnant)
    const newFrees: FreeRect[] = []
    // Right piece (wide remnant priority)
    if (free.w - pw > 10) {
      newFrees.push({ x: free.x + pw, y: free.y, w: free.w - pw, h: free.h })
    }
    // Bottom piece
    if (free.h - ph > 10) {
      newFrees.push({ x: free.x, y: free.y + ph, w: pw, h: free.h - ph })
    }
    freeRects.splice(bestFreeIdx, 1, ...newFrees)
    freeRects = pruneFreeRects(freeRects)
  }

  const wasteRects = buildWasteRects(placed, sw, sh)

  return { rects: [...placed, ...wasteRects], notFitItems, placedCount: placed.length }
}

// ─── Strip Packer ─────────────────────────────────────────────────────────────

function stripPackSingle(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
): { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } {
  const sorted = [...items].sort((a, b) => b.height - a.height || b.width - a.width)
  const placed: PackRect[] = []
  const notFitItems: PackItem[] = []

  let curX = 0, curY = 0, rowH = 0

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    let pw = item.width + kerf
    let ph = item.height + kerf
    if (curX + pw > sw + kerf) {
      // New row
      curY += rowH
      curX = 0
      rowH = 0
    }

    // Try rotated if normal doesn't fit width
    if (curX + pw > sw + kerf && item.allowRotate) {
      [pw, ph] = [ph, pw]
    }

    if (curX + pw > sw + kerf || curY + ph > sh + kerf) {
      notFitItems.push(item); continue
    }

    placed.push({
      x: curX, y: curY,
      width: pw - kerf, height: ph - kerf,
      type: 'part', name: item.name,
    })

    curX += pw
    rowH = Math.max(rowH, ph)
  }

  const wasteRects = buildWasteRects(placed, sw, sh)

  return { rects: [...placed, ...wasteRects], notFitItems, placedCount: placed.length }
}

// ─── Skyline Packer ───────────────────────────────────────────────────────────

interface SkylineNode {
  x: number; y: number; w: number
}

function skylinePackSingle(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
): { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } {
  const sorted = [...items].sort((a, b) => b.width * b.height - a.width * a.height)
  const placed: PackRect[] = []
  const notFitItems: PackItem[] = []

  let skyline: SkylineNode[] = [{ x: 0, y: 0, w: sw }]

  const findBestPos = (pw: number, ph: number) => {
    let bestY = Infinity, bestIdx = -1, bestX = 0
    for (let i = 0; i < skyline.length; i++) {
      const node = skyline[i]
      let x = node.x
      if (x + pw > sw) continue
      // Find max y needed
      let maxY = node.y
      let remW = pw
      let j = i
      while (remW > 0 && j < skyline.length) {
        maxY = Math.max(maxY, skyline[j].y)
        remW -= skyline[j].w
        j++
      }
      if (remW > 0) continue
      if (maxY + ph <= sh && maxY < bestY) {
        bestY = maxY; bestIdx = i; bestX = x
      }
    }
    return { bestY, bestIdx, bestX }
  }

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    const pw = item.width + kerf
    const ph = item.height + kerf
    const pwr = item.height + kerf
    const phr = item.width + kerf

    const norm = findBestPos(pw, ph)
    const rot = item.allowRotate ? findBestPos(pwr, phr) : { bestY: Infinity, bestIdx: -1, bestX: 0 }

    let useRot = false
    if (norm.bestIdx < 0 && rot.bestIdx < 0) { notFitItems.push(item); continue }
    if (norm.bestIdx < 0) useRot = true
    else if (rot.bestIdx >= 0 && rot.bestY < norm.bestY) useRot = true

    const usePW = useRot ? pwr : pw
    const usePH = useRot ? phr : ph
    const { bestY, bestX } = useRot ? rot : norm

    placed.push({
      x: bestX, y: bestY,
      width: usePW - kerf, height: usePH - kerf,
      type: 'part', name: item.name,
    })

    // Update skyline
    const newNode: SkylineNode = { x: bestX, y: bestY + usePH, w: usePW }
    const newSkyline: SkylineNode[] = []
    for (const node of skyline) {
      if (node.x + node.w <= bestX || node.x >= bestX + usePW) {
        newSkyline.push(node)
      } else {
        if (node.x < bestX) newSkyline.push({ x: node.x, y: node.y, w: bestX - node.x })
        if (node.x + node.w > bestX + usePW) newSkyline.push({ x: bestX + usePW, y: node.y, w: node.x + node.w - (bestX + usePW) })
      }
    }
    newSkyline.push(newNode)
    newSkyline.sort((a, b) => a.x - b.x)
    skyline = newSkyline
  }

  const wasteRects = buildWasteRects(placed, sw, sh)

  return { rects: [...placed, ...wasteRects], notFitItems, placedCount: placed.length }
}

// ─── Score a single-sheet pack result ─────────────────────────────────────────

function scoreResult(
  rects: PackRect[],
  sw: number,
  sh: number,
  notFitCount: number,
  isLast: boolean,
): number {
  // Primary: maximize placed parts (minimize notFit)
  const placed = rects.filter(r => r.type === 'part')
  const partArea = placed.reduce((s, r) => s + r.width * r.height, 0)
  const totalArea = sw * sh

  // If last sheet: also score wide remnant
  let remnantScore = 0
  if (isLast) {
    const wideRemnant = Math.max(0, ...rects.filter(r => r.type === 'waste').map(r => Math.max(r.width, r.height)))
    remnantScore = wideRemnant / Math.max(sw, sh)
  }

  const effScore = partArea / totalArea
  return effScore * 1000 - notFitCount * 10000 + (isLast ? remnantScore * 100 : 0)
}

// ─── Run all algos for single sheet, pick best ────────────────────────────────

function packOneSingleSheet(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
  algo: AlgorithmChoice,
  isLast: boolean,
): { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } {
  const heuristics: Heuristic[] = ['BSSF', 'BLSF', 'BAF', 'BL', 'CP']
  const sortOrders: SortOrder[] = ['area-desc', 'w-desc', 'h-desc', 'perim-desc', 'ratio-desc', 'area-asc', 'w-asc', 'h-asc', 'ratio-asc', 'random']

  interface Candidate {
    rects: PackRect[]
    notFitItems: PackItem[]
    placedCount: number
    score: number
  }

  const candidates: Candidate[] = []

  if (algo === 'all' || algo === 'maxrects') {
    for (const h of heuristics) {
      for (const order of sortOrders) {
        const res = maxRectsPackSingle(items, sw, sh, kerf, h, order)
        candidates.push({
          ...res,
          score: scoreResult(res.rects, sw, sh, res.notFitItems.length, isLast),
        })
      }
    }
  }

  if (algo === 'all' || algo === 'guillotine') {
    const res = guillotinePackSingle(items, sw, sh, kerf)
    candidates.push({ ...res, score: scoreResult(res.rects, sw, sh, res.notFitItems.length, isLast) })
  }

  if (algo === 'all' || algo === 'strip') {
    const res = stripPackSingle(items, sw, sh, kerf)
    candidates.push({ ...res, score: scoreResult(res.rects, sw, sh, res.notFitItems.length, isLast) })
  }

  if (algo === 'all' || algo === 'skyline') {
    const res = skylinePackSingle(items, sw, sh, kerf)
    candidates.push({ ...res, score: scoreResult(res.rects, sw, sh, res.notFitItems.length, isLast) })
  }

  if (algo !== 'all' && algo !== 'guillotine') {
    const res = guillotinePackSingle(items, sw, sh, kerf)
    candidates.push({ ...res, score: scoreResult(res.rects, sw, sh, res.notFitItems.length, isLast) - 0.001 })
  }

  const feasible = candidates.filter(c => isGuillotineCuttable(c.rects.filter(r => r.type === 'part'), sw, sh))
  const pool = feasible.length > 0 ? feasible : candidates
  pool.sort((a, b) => b.score - a.score)
  const best = pool[0]

  return {
    rects: best.rects,
    notFitItems: best.notFitItems,
    placedCount: best.placedCount,
  }
}

// ─── Main autoPack ────────────────────────────────────────────────────────────

export function autoPack(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
  algo: AlgorithmChoice = 'all',
): PackResult {
  if (!items.length) return { sheets: [], notFit: [] }

  const expandedItems: PackItem[] = items.flatMap(item =>
    Array.from({ length: item.qty }, () => ({ ...item, qty: 1 }))
  )

  const sheets: PackSheetResult[] = []
  let remaining = [...expandedItems]

  while (remaining.length > 0) {
    const isLast = true // always treat as last for wide-remnant priority
    const result = packOneSingleSheet(remaining, sw, sh, kerf, algo, isLast)

    const cuts = estimateCuts(result.rects.filter(r => r.type === 'part'), sw, sh)
    if (result.placedCount === 0) {
      const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
      for (const item of remaining) {
        const key = `${item.name}||${item.width}||${item.height}`
        if (!notFitMap[key]) notFitMap[key] = { ...item, qty: 0 }
        notFitMap[key].qty++
      }
      return { sheets, notFit: Object.values(notFitMap) }
    }

    sheets.push({
      rects: result.rects,
      cuts,
      placedCount: result.placedCount,
    })

    if (result.notFitItems.length === 0) {
      remaining = []
    } else if (result.notFitItems.length >= remaining.length) {
      // Nothing more can be packed — return remaining as notFit
      const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
      for (const item of remaining) {
        const key = `${item.name}||${item.width}||${item.height}`
        if (!notFitMap[key]) notFitMap[key] = { ...item, qty: 0 }
        notFitMap[key].qty++
      }
      return { sheets, notFit: Object.values(notFitMap) }
    } else {
      remaining = result.notFitItems
    }
  }

  return { sheets, notFit: [] }
}

// ─── Pack for auto mode (multi-sheet, wide-remnant priority on last) ──────────

export function autoPackMultiSheet(
  items: PackItem[],
  sw: number,
  sh: number,
  kerf: number,
  algo: AlgorithmChoice,
  maxSheets: number | null, // null = unlimited (auto-add mode)
): PackResult {
  if (!items.length) return { sheets: [], notFit: [] }

  const expandedItems: PackItem[] = items.flatMap(item =>
    Array.from({ length: item.qty }, () => ({ ...item, qty: 1 }))
  )

  const sheets: PackSheetResult[] = []
  let remaining = [...expandedItems]

  while (remaining.length > 0) {
    if (maxSheets !== null && sheets.length >= maxSheets) {
      // Can't add more sheets — remaining items don't fit
      break
    }

    // Is this going to be the last sheet?
    // We estimate: try packing all remaining on one sheet
    const testResult = packOneSingleSheet(remaining, sw, sh, kerf, algo, true)
    const willBeLastSheet = testResult.notFitItems.length === 0

    const result = packOneSingleSheet(remaining, sw, sh, kerf, algo, willBeLastSheet)

    const cuts = estimateCuts(result.rects.filter(r => r.type === 'part'), sw, sh)
    if (result.placedCount === 0) break
    sheets.push({ rects: result.rects, cuts, placedCount: result.placedCount })

    if (result.notFitItems.length === 0) {
      remaining = []
    } else if (result.notFitItems.length >= remaining.length) {
      break
    } else {
      remaining = result.notFitItems
    }
  }

  // Aggregate remaining as notFit
  const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
  for (const item of remaining) {
    const key = `${item.name}||${item.width}||${item.height}`
    if (!notFitMap[key]) notFitMap[key] = { ...item, qty: 0 }
    notFitMap[key].qty++
  }

  return { sheets, notFit: Object.values(notFitMap) }
}

export function packFixedSheets(
  items: PackItem[],
  sheetConfigs: FixedSheetConfig[],
  algo: AlgorithmChoice,
): { sheets: FixedSheetPackResult[]; notFit: { name: string; width: number; height: number; qty: number }[] } {
  if (!items.length || !sheetConfigs.length) return { sheets: [], notFit: [] }

  let remaining: PackItem[] = items.flatMap(item =>
    Array.from({ length: item.qty }, () => ({ ...item, qty: 1 }))
  )

  const availableConfigs = [...sheetConfigs]
  const sheets: FixedSheetPackResult[] = []

  while (remaining.length > 0 && availableConfigs.length > 0) {
    let bestIdx = -1
    let bestResult: { rects: PackRect[]; notFitItems: PackItem[]; placedCount: number } | null = null
    let bestScore = -Infinity

    for (let i = 0; i < availableConfigs.length; i++) {
      const cfg = availableConfigs[i]
      const result = packOneSingleSheet(remaining, cfg.stockWidth, cfg.stockHeight, cfg.kerf, algo, false)
      if (result.placedCount === 0) continue

      const partArea = result.rects
        .filter(r => r.type === 'part')
        .reduce((sum, r) => sum + r.width * r.height, 0)
      const totalArea = Math.max(1, cfg.stockWidth * cfg.stockHeight)
      const score = result.placedCount * 1_000_000 + partArea / totalArea

      if (score > bestScore) {
        bestScore = score
        bestIdx = i
        bestResult = result
      }
    }

    if (bestIdx < 0 || !bestResult) break

    const cfg = availableConfigs.splice(bestIdx, 1)[0]
    const cuts = estimateCuts(bestResult.rects.filter(r => r.type === 'part'), cfg.stockWidth, cfg.stockHeight)
    sheets.push({
      sheetConfigId: cfg.id,
      rects: bestResult.rects,
      cuts,
      placedCount: bestResult.placedCount,
    })

    if (bestResult.notFitItems.length >= remaining.length) break
    remaining = bestResult.notFitItems
  }

  const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
  for (const item of remaining) {
    const key = `${item.name}||${item.width}||${item.height}`
    if (!notFitMap[key]) notFitMap[key] = { ...item, qty: 0 }
    notFitMap[key].qty++
  }

  return { sheets, notFit: Object.values(notFitMap) }
}
