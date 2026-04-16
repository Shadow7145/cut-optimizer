import { useRef, useEffect, useState, useCallback, type CSSProperties, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'
import { type LangCode, type Translations, LANGUAGES, translations, detectBrowserLang } from './i18n'
import { autoPackMultiSheet, packFixedSheets, type FixedSheetConfig, type PackItem, type AlgorithmChoice, ALGORITHM_LABELS } from './utils/autoPack'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: 'waste' | 'part'
  name: string
}

type CutDirection = 'vertical' | 'horizontal'
type AppMode = 'manual' | 'auto'

const SITE_URL = 'https://cutoptimizer.ru'

const SEO_CONTENT = {
  ru: {
    titleManual: 'Раскрой онлайн: ЛДСП, МДФ, фанера, металл | Калькулятор и карта раскроя бесплатно',
    titleAuto: 'Автоматический расчет карт раскроя онлайн: ЛДСП, МДФ, металл | Cut Optimizer',
    descriptionManual: 'Бесплатный онлайн калькулятор раскроя листовых материалов: ЛДСП, МДФ, фанера, листы металла. Создавайте карты раскроя вручную, считайте отходы, КПД и количество резов.',
    descriptionAuto: 'Оптимизатор раскроя онлайн: автоматический расчет карт раскроя ЛДСП, МДФ, фанеры и металла. Минимизация отходов, расчет количества резов и печать PDF бесплатно.',
    keywords: 'раскрой онлайн лдсп, раскрой онлайн мдф, раскрой онлайн фанера, раскрой онлайн листа, калькулятор раскроя лдсп, раскрой листа металла онлайн, калькулятор раскроя листового металла, автоматический расчет карт раскроя, раскрой онлайн бесплатно, линейный раскрой онлайн',
    heading: 'Cut Optimizer — Раскрой онлайн',
    subheading: 'Бесплатный калькулятор и оптимизатор раскроя ЛДСП, МДФ, фанеры и листов металла',
    intro: 'Профессиональный сервис для расчета раскроя листовых материалов. Автоматический расчет карт раскроя ЛДСП, МДФ, фанеры, пластика и металла. Оптимизация отходов, расчет КПД и количества резов в один клик.',
    benefitsTitle: 'Преимущества онлайн раскроя',
    benefits: [
      'Бесплатный расчет раскроя онлайн без регистрации.',
      'Автоматическая оптимизация карт раскроя ЛДСП, МДФ и металла.',
      'Расчет КПД, площади отходов и общего количества резов.',
      'Поддержка линейного и прямоугольного раскроя листовых материалов.',
      'Сохранение проектов и экспорт карт раскроя в PDF для печати.',
    ],
    useCasesTitle: 'Популярные запросы',
    useCases: [
      'раскрой онлайн лдсп и мдф',
      'калькулятор раскроя листа металла',
      'автоматический расчет карт раскроя',
      'раскрой листового материала онлайн',
      'карта раскроя онлайн бесплатно',
    ],
    faqTitle: 'Частые вопросы по раскрою',
    faq: [
      {
        question: 'Для каких материалов подходит Cut Optimizer?',
        answer: 'Сервис подходит для ЛДСП, МДФ, фанеры, пластика, композита, стекломагниевых и других листовых материалов, где важны размеры заготовки, детали и ширина пропила.',
      },
      {
        question: 'Можно ли автоматически оптимизировать раскрой по нескольким листам?',
        answer: 'Да. Автоматический режим распределяет детали по одному или нескольким форматам листов, считает количество листов, КПД, отходы и примерное число резов.',
      },
      {
        question: 'Подходит ли сервис для мебельного производства?',
        answer: 'Да. Инструмент ориентирован на мебельщиков, цеха и частных мастеров, которым нужен быстрый расчет раскроя ЛДСП, фасадов, корпусов и других прямоугольных деталей.',
      },
    ],
  },
  en: {
    titleManual: 'Online sheet cutting optimizer for plywood, MDF, chipboard and panel materials',
    titleAuto: 'Automatic online cutting optimizer with layout, waste and efficiency calculation',
    descriptionManual: 'Cut Optimizer helps you build manual cutting layouts for plywood, MDF, chipboard, plastic and other sheet materials. Save projects, print PDFs and reduce waste.',
    descriptionAuto: 'Online cutting calculator with automatic part nesting across sheets, efficiency metrics, waste estimation and cut count. Useful for woodworking shops and panel processing.',
    keywords: 'cut optimizer, sheet cutting optimizer, cutting layout online, chipboard cutting calculator, plywood cutting optimizer, nesting optimizer',
    heading: 'Cut Optimizer',
    subheading: 'Online sheet cutting optimizer for workshops, furniture makers and panel processing',
    intro: 'The app calculates cutting layouts for chipboard, MDF, plywood, plastic and other sheet materials. You can build a layout manually or generate one automatically with kerf, sheet size and part rotation taken into account.',
    benefitsTitle: 'Why this page matters for search',
    benefits: [
      'Online cutting optimization without installing desktop software.',
      'Several packing algorithms with efficiency, waste and cut statistics.',
      'Manual mode for precise control and auto mode for fast production planning.',
      'Project export, PDF printing and a clear per-sheet part specification.',
    ],
    useCasesTitle: 'Relevant search intents',
    useCases: [
      'sheet cutting optimizer online',
      'chipboard cutting calculator',
      'plywood cutting layout generator',
      'panel cutting planner',
      'online nesting optimizer',
    ],
    faqTitle: 'Cutting FAQ',
    faq: [
      {
        question: 'What materials can I optimize with Cut Optimizer?',
        answer: 'It works for chipboard, MDF, plywood, plastics and other rectangular sheet materials where stock size, part size and kerf affect yield.',
      },
      {
        question: 'Can it optimize parts across multiple sheets automatically?',
        answer: 'Yes. Auto mode distributes parts across one or multiple sheet formats and reports sheet count, efficiency, waste and approximate cuts.',
      },
      {
        question: 'Is it useful for furniture production?',
        answer: 'Yes. The tool is designed for furniture shops, workshops and independent makers who need fast panel cutting layouts for cabinets, fronts and other rectangular parts.',
      },
    ],
  },
} as const

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
}

function upsertJsonLd(id: string, payload: Record<string, unknown>) {
  let el = document.head.querySelector(`#${id}`) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(payload)
}

function useSeo(lang: LangCode, mode: AppMode) {
  useEffect(() => {
    const copy = SEO_CONTENT[lang]
    const title = mode === 'auto' ? copy.titleAuto : copy.titleManual
    const description = mode === 'auto' ? copy.descriptionAuto : copy.descriptionManual
    const canonicalUrl = lang === 'ru' ? SITE_URL : `${SITE_URL}/?lang=en`
    const faqEntities = copy.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))

    document.title = title
    document.documentElement.lang = lang

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: copy.keywords })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Cut Optimizer' })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: lang === 'ru' ? 'ru_RU' : 'en_US' })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: `${SITE_URL}/og-image.png` })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: `${SITE_URL}/og-image.png` })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })
    upsertLink('link[rel="alternate"][hreflang="ru"]', { rel: 'alternate', hreflang: 'ru', href: SITE_URL })
    upsertLink('link[rel="alternate"][hreflang="en"]', { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/?lang=en` })
    upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: SITE_URL })

    upsertJsonLd('ld-webapp', {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Cut Optimizer',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Cutting Optimization Software',
      operatingSystem: 'Any',
      url: SITE_URL,
      inLanguage: lang,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'RUB',
      },
      description,
      featureList: copy.benefits,
    })

    upsertJsonLd('ld-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities,
    })
  }, [lang, mode])
}

function SeoContent({ lang }: { lang: LangCode }) {
  const copy = SEO_CONTENT[lang]

  return (
    <section className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">cutoptimizer.ru</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{copy.heading}</h1>
          <p className="mt-3 text-lg text-slate-700">{copy.subheading}</p>
          <p className="mt-4 text-base leading-7 text-slate-600">{copy.intro}</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">{copy.benefitsTitle}</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {copy.benefits.map(item => (
                <li key={item} className="rounded-2xl bg-white px-4 py-3 shadow-sm">{item}</li>
              ))}
            </ul>
          </article>

          <aside className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">{copy.useCasesTitle}</h2>
            <ul className="mt-4 space-y-2 text-sm font-medium text-slate-700">
              {copy.useCases.map(item => (
                <li key={item} className="rounded-xl border border-white/80 bg-white/80 px-3 py-2">{item}</li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">{copy.faqTitle}</h2>
          <div className="mt-4 space-y-3">
            {copy.faq.map(item => (
              <details key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">{item.question}</summary>
                <p className="mt-2 text-slate-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface Sheet {
  id: number
  name: string
  stockWidth: number
  stockHeight: number
  kerf?: number
  rects: Rect[]
  cuts?: number
}

interface AutoSheetConfig {
  id: number
  stockWidth: string
  stockHeight: string
  kerf: string
  name: string
}

interface AutoPartRow {
  id: number
  name: string
  width: string
  height: string
  qty: string
  allowRotate: boolean
}

interface ProjectData {
  version: number
  sheets: Sheet[]
  kerf: number
  lang?: LangCode
  autoParts?: AutoPartRow[]
  autoSheets?: AutoSheetConfig[]
  autoMode?: boolean
  autoAddSheetsMode?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let nextId = 1
const uid = () => nextId++

const formatSize = (w: number, h: number) =>
  `${Math.round(Math.max(w, h))}×${Math.round(Math.min(w, h))}`

const PADDING = 24

function effColor(eff: number) {
  if (eff >= 85) return '#16a34a'
  if (eff >= 70) return '#ca8a04'
  return '#dc2626'
}

function cutsColor(cuts: number) {
  if (cuts <= 10) return '#16a34a'
  if (cuts <= 25) return '#ca8a04'
  return '#dc2626'
}

const rectArea = (rect: { width: number; height: number }) => rect.width * rect.height
const sheetStockArea = (sheet: Pick<Sheet, 'stockWidth' | 'stockHeight'>) => Math.max(0, sheet.stockWidth * sheet.stockHeight)
const sheetPartArea = (sheet: Pick<Sheet, 'rects'>) =>
  sheet.rects.filter(r => r.type === 'part').reduce((sum, rect) => sum + rectArea(rect), 0)
const sheetWasteArea = (sheet: Pick<Sheet, 'stockWidth' | 'stockHeight' | 'rects'>) =>
  Math.max(0, sheetStockArea(sheet) - sheetPartArea(sheet))
const sheetEfficiency = (sheet: Pick<Sheet, 'stockWidth' | 'stockHeight' | 'rects'>) => {
  const stockArea = sheetStockArea(sheet)
  return stockArea > 0 ? Math.round((sheetPartArea(sheet) / stockArea) * 100) : 0
}
const sheetsPartArea = (items: Sheet[]) => items.reduce((sum, sheet) => sum + sheetPartArea(sheet), 0)
const sheetsStockArea = (items: Sheet[]) => items.reduce((sum, sheet) => sum + sheetStockArea(sheet), 0)
const sheetsWasteArea = (items: Sheet[]) => items.reduce((sum, sheet) => sum + sheetWasteArea(sheet), 0)
const sheetsEfficiency = (items: Sheet[]) => {
  const stockArea = sheetsStockArea(items)
  return stockArea > 0 ? Math.round((sheetsPartArea(items) / stockArea) * 100) : 0
}
const sheetWidestRemnant = (sheet: Pick<Sheet, 'rects'>) =>
  Math.max(0, ...sheet.rects.filter(r => r.type === 'waste').map(r => Math.max(r.width, r.height)))

function snapToGrid(value: number, step: number, max: number): number {
  if (step <= 0) return Math.max(1, Math.min(max, Math.round(value)))
  const snapped = Math.round(value / step) * step
  return Math.max(step, Math.min(max, snapped))
}

function pluralSheets(n: number, lang: LangCode): string {
  if (lang === 'ru') {
    if (n % 10 === 1 && n % 100 !== 11) return 'лист'
    if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'листа'
    return 'листов'
  }
  return n === 1 ? 'sheet' : 'sheets'
}

// ─── Print styles ─────────────────────────────────────────────────────────────

const PRINT_STYLE = `
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:16px}
  h1{font-size:18px;margin-bottom:4px}h2{font-size:14px;margin:14px 0 6px;color:#475569}
  .sheet-block{page-break-inside:avoid;margin-bottom:32px}
  table{width:100%;border-collapse:collapse;margin-bottom:8px}
  th{background:#f1f5f9;text-align:left;padding:5px 8px;font-size:11px;color:#64748b;border-bottom:2px solid #cbd5e1}
  td{padding:5px 8px;border-bottom:1px solid #e2e8f0}
  .eff-bar{width:100%;background:#e2e8f0;border-radius:4px;height:8px;margin-top:2px}
  .eff-fill{background:#6366f1;height:8px;border-radius:4px}
  .layout-img{max-width:100%;border:1px solid #cbd5e1;border-radius:6px;display:block;margin-top:8px}
  .sheet-info{display:flex;gap:16px;padding:6px 8px;background:#f8fafc;border-radius:4px;font-size:11px;margin-bottom:6px;flex-wrap:wrap}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`

// ─── Tooltip component ────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 260) })
    }
    setShow(true)
  }

  return (
    <span ref={ref} className="relative inline-flex items-center" onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      <span className="w-4 h-4 rounded-full bg-slate-200 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 text-[10px] font-bold flex items-center justify-center cursor-help transition select-none">?</span>
      {show && pos && createPortal(
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999, maxWidth: 240 }}
          className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl leading-relaxed pointer-events-none">
          {text}
        </div>,
        document.body
      )}
    </span>
  )
}

// ─── Language Selector ────────────────────────────────────────────────────────

function LangSelector({ lang, t, onChange }: { lang: LangCode; t: Translations; onChange: (l: LangCode) => void }) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const cur = LANGUAGES.find(l => l.code === lang)!

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node
      if (btnRef.current?.contains(target) || dropRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setStyle({ position: 'fixed', top: r.bottom + 4, right: window.innerWidth - r.right, zIndex: 9999 })
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative select-none shrink-0">
      <button ref={btnRef} onClick={toggle} title={t.language}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition whitespace-nowrap">
        <span className="text-base leading-none">{cur.flag}</span>
        <span className="hidden sm:inline text-slate-700">{cur.label}</span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && createPortal(
        <div ref={dropRef} style={style}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { onChange(l.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition
                ${l.code === lang ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
              <span className="text-xl leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && (
                <svg className="ml-auto w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>, document.body
      )}
    </div>
  )
}

// ─── Donate Widget ────────────────────────────────────────────────────────────

const SBER_DONATE_URL = 'https://www.sberbank.ru/ru/choise_bank?requisiteNumber=79509193193&bankCode=100000000111'
const FEEDBACK_EMAIL = 'jurandos@yandex.ru'

function DonateWidget({ t, blockRef }: { t: Translations; blockRef?: RefObject<HTMLDivElement | null> }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrSize, setQrSize] = useState(120)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    QRCode.toDataURL(SBER_DONATE_URL, {
      width: 300, margin: 1,
      color: { dark: '#14532d', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((url: string) => setQrDataUrl(url)).catch(() => {})
  }, [])

  useEffect(() => {
    const el = blockRef?.current ?? containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth
      if (w > 40) setQrSize(Math.min(w - 32, 180))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [blockRef])

  return (
    <div
      ref={containerRef}
      className="relative mx-3 mb-3 overflow-hidden rounded-2xl border shadow-lg"
      style={{
        background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 45%, #ecfdf5 100%)',
        borderColor: '#cbd5e1',
        boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-6 h-20 w-20 rounded-full bg-emerald-100/70 blur-2xl" />

      <div
        className="relative flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #16a34a 100%)' }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-base shadow-sm">
          ☕
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-black text-sm leading-tight">{t.donateTitle ?? 'Поддержать проект'}</div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/12 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Сбер
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-2 px-3 py-3 text-center">
        {qrDataUrl ? (
          <div
            className="rounded-2xl overflow-hidden border-2 bg-white shadow-lg"
            style={{ padding: 6, width: qrSize + 12, height: qrSize + 12, borderColor: '#bfdbfe' }}
          >
            <img src={qrDataUrl} alt="QR СберБанк"
              style={{ width: qrSize, height: qrSize, imageRendering: 'pixelated', display: 'block', borderRadius: 12 }} />
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 border-dashed flex items-center justify-center bg-white/60"
            style={{ width: qrSize + 12, height: qrSize + 12, borderColor: '#bfdbfe' }}
          >
            <span className="text-3xl">📱</span>
          </div>
        )}

        <div className="text-[10px] font-semibold text-slate-700">
          📱 {t.donateScanHint ?? 'Сканируйте QR'}
        </div>

        <a href={`mailto:${FEEDBACK_EMAIL}`}
          className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-900 transition font-semibold">
          <span>✉</span>
          <span className="underline underline-offset-2">{FEEDBACK_EMAIL}</span>
        </a>
      </div>
    </div>
  )
}

// ─── Auto Mode Panel ──────────────────────────────────────────────────────────

let autoRowId = 1
const autoUid = () => autoRowId++
let autoSheetRowId = 100
const autoSheetUid = () => autoSheetRowId++

const createDefaultAutoPart = (): AutoPartRow => ({
  id: autoUid(),
  name: '',
  width: '',
  height: '',
  qty: '1',
  allowRotate: true,
})

const createDefaultAutoSheet = (): AutoSheetConfig => ({
  id: autoSheetUid(),
  stockWidth: '2800',
  stockHeight: '2070',
  kerf: '4',
  name: '',
})

interface AutoResult {
  sheetsCount: number
  eff: number
  wasteArea: number
  partArea: number
  totalCuts: number
  cutsPerSheet: number[]
  strategy: string
  notFit: { name: string; width: number; height: number; qty: number }[]
  widestRemnant: number
  sheetsPerConfig: { configName: string; count: number }[]
}

const ALGO_OPTIONS: AlgorithmChoice[] = ['all', 'maxrects', 'guillotine', 'strip', 'skyline']

interface AutoPanelProps {
  t: Translations
  lang: LangCode
  onResult: (sheets: Sheet[], hasOverflow: boolean, notFit: AutoResult['notFit']) => void
  parts: AutoPartRow[]
  setParts: Dispatch<SetStateAction<AutoPartRow[]>>
  sheetConfigs: AutoSheetConfig[]
  setSheetConfigs: Dispatch<SetStateAction<AutoSheetConfig[]>>
  autoAddMode: boolean
  setAutoAddMode: (v: boolean) => void
}

function AutoPanel({ t, lang, onResult, parts, setParts, sheetConfigs, setSheetConfigs, autoAddMode, setAutoAddMode }: AutoPanelProps) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AutoResult | null>(null)
  const [algorithm, setAlgorithm] = useState<AlgorithmChoice>('all')

  // Parts CRUD
  const addPart = () => {
    setParts(p => [...p, createDefaultAutoPart()])
    setResult(null)
  }
  const removePart = (id: number) => { setParts(p => p.filter(r => r.id !== id)); setResult(null) }
  const updatePart = (id: number, field: keyof AutoPartRow, value: string | boolean) => {
    setParts(p => p.map(r => r.id === id ? { ...r, [field]: value } : r)); setResult(null)
  }
  const clearParts = () => {
    setParts([createDefaultAutoPart()])
    setResult(null)
  }

  // Sheet config — only first is used in autoAddMode
  const primaryConfig = sheetConfigs[0]
  const updatePrimaryConfig = (field: keyof AutoSheetConfig, value: string) => {
    setSheetConfigs(s => s.map((c, i) => i === 0 ? { ...c, [field]: value } : c))
    setResult(null)
  }

  // Multi-sheet CRUD
  const addSheetConfig = () => {
    const last = sheetConfigs[sheetConfigs.length - 1]
    setSheetConfigs(s => [...s, {
      ...createDefaultAutoSheet(),
      stockWidth: last?.stockWidth ?? '2800',
      stockHeight: last?.stockHeight ?? '2070',
      kerf: last?.kerf ?? '4',
    }])
    setResult(null)
  }
  const removeSheetConfig = (id: number) => {
    if (sheetConfigs.length <= 1) return
    setSheetConfigs(s => s.filter(c => c.id !== id))
    setResult(null)
  }
  const updateSheetConfig = (id: number, field: keyof AutoSheetConfig, value: string) => {
    setSheetConfigs(s => s.map(c => c.id === id ? { ...c, [field]: value } : c))
    setResult(null)
  }

  const validParts = (): PackItem[] =>
    parts
      .map(p => ({
        name: p.name.trim() || `${t.autoPartName} ${p.id}`,
        width: Number(p.width),
        height: Number(p.height),
        qty: Math.max(1, Math.round(Number(p.qty) || 1)),
        allowRotate: p.allowRotate,
      }))
      .filter(p => p.width > 0 && p.height > 0)

  const run = () => {
    const vp = validParts()
    if (!vp.length) return

    if (autoAddMode) {
      // Auto-add mode: single sheet size, unlimited sheets
      const sw = Number(primaryConfig.stockWidth)
      const sh = Number(primaryConfig.stockHeight)
      const kerf = Number(primaryConfig.kerf) || 0
      if (!sw || !sh) return

      setRunning(true)
      setTimeout(() => {
        const packResult = autoPackMultiSheet(vp, sw, sh, kerf, algorithm, null)
        const newSheets: Sheet[] = packResult.sheets.map((ps, i) => ({
          id: uid(),
          name: `${(primaryConfig.name.trim() || t.sheetNamePlaceholder)} ${i + 1}`,
          stockWidth: sw,
          stockHeight: sh,
          kerf,
          cuts: ps.cuts,
          rects: ps.rects.map(r => ({ id: uid(), x: r.x, y: r.y, width: r.width, height: r.height, type: r.type, name: r.name })),
        }))

        const partArea = sheetsPartArea(newSheets)
        const wasteArea = sheetsWasteArea(newSheets)
        const eff = sheetsEfficiency(newSheets)
        const totalCuts = newSheets.reduce((s, sh) => s + (sh.cuts ?? 0), 0)
        const lastSheet = newSheets[newSheets.length - 1]
        const widestRemnant = lastSheet ? sheetWidestRemnant(lastSheet) : 0

        const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
        for (const nf of packResult.notFit) {
          const key = `${nf.name}||${nf.width}||${nf.height}`
          if (!notFitMap[key]) notFitMap[key] = { ...nf, qty: 0 }
          notFitMap[key].qty += nf.qty
        }

        setResult({
          sheetsCount: newSheets.length,
          eff,
          partArea,
          wasteArea,
          totalCuts,
          cutsPerSheet: newSheets.map(s => s.cuts ?? 0),
          strategy: algorithm === 'all' ? 'Auto-best' : ALGORITHM_LABELS[algorithm],
          notFit: Object.values(notFitMap),
          widestRemnant,
          sheetsPerConfig: [{ configName: primaryConfig.name.trim() || t.sheetNamePlaceholder, count: newSheets.length }],
        })
        onResult(newSheets, packResult.notFit.length > 0, Object.values(notFitMap))
        setRunning(false)
      }, 50)
    } else {
      // Multi-sheet mode: fixed set of sheets, no auto-add
      const validCfgs: FixedSheetConfig[] = sheetConfigs
        .map(c => ({
          id: c.id,
          stockWidth: Number(c.stockWidth),
          stockHeight: Number(c.stockHeight),
          kerf: Number(c.kerf) || 0,
          name: c.name.trim(),
        }))
        .filter(c => c.stockWidth > 0 && c.stockHeight > 0)
      if (!validCfgs.length) return

      setRunning(true)
      setTimeout(() => {
        const pr = packFixedSheets(vp, validCfgs, algorithm)
        const perConfigSheetNo = new Map<number, number>()
        const newSheets: Sheet[] = pr.sheets.map((ps) => {
          const cfg = validCfgs.find(c => c.id === ps.sheetConfigId)!
          const baseName = cfg.name || t.sheetNamePlaceholder
          const nextSheetNo = (perConfigSheetNo.get(cfg.id) ?? 0) + 1
          perConfigSheetNo.set(cfg.id, nextSheetNo)
          return {
            id: uid(),
            name: `${baseName} ${nextSheetNo}`,
            stockWidth: cfg.stockWidth,
            stockHeight: cfg.stockHeight,
            kerf: cfg.kerf,
            cuts: ps.cuts,
            rects: ps.rects.map(r => ({ id: uid(), x: r.x, y: r.y, width: r.width, height: r.height, type: r.type, name: r.name })),
          }
        })

        const partArea = sheetsPartArea(newSheets)
        const wasteArea = sheetsWasteArea(newSheets)
        const eff = sheetsEfficiency(newSheets)
        const totalCuts = newSheets.reduce((s, sh) => s + (sh.cuts ?? 0), 0)
        const lastSheet = newSheets[newSheets.length - 1]
        const widestRemnant = lastSheet ? sheetWidestRemnant(lastSheet) : 0

        const notFitMap: Record<string, { name: string; width: number; height: number; qty: number }> = {}
        for (const nf of pr.notFit) {
          const key = `${nf.name}||${nf.width}||${nf.height}`
          if (!notFitMap[key]) notFitMap[key] = { ...nf, qty: 0 }
          notFitMap[key].qty += nf.qty
        }

        const sheetsPerConfigMap = new Map<number, number>()
        for (const sheet of pr.sheets) {
          sheetsPerConfigMap.set(sheet.sheetConfigId, (sheetsPerConfigMap.get(sheet.sheetConfigId) ?? 0) + 1)
        }
        const sheetsPerConfig = validCfgs
          .map(cfg => ({
            configName: cfg.name || t.sheetNamePlaceholder,
            count: sheetsPerConfigMap.get(cfg.id) ?? 0,
          }))
          .filter(cfg => cfg.count > 0)

        const hasOverflow = Object.values(notFitMap).length > 0

        setResult({
          sheetsCount: newSheets.length,
          eff,
          partArea,
          wasteArea,
          totalCuts,
          cutsPerSheet: newSheets.map(s => s.cuts ?? 0),
          strategy: algorithm === 'all' ? 'Auto-best' : ALGORITHM_LABELS[algorithm],
          notFit: Object.values(notFitMap),
          widestRemnant,
          sheetsPerConfig,
        })
        onResult(newSheets, hasOverflow, Object.values(notFitMap))
        setRunning(false)
      }, 50)
    }
  }

  const canRun = validParts().length > 0 && (
    autoAddMode
      ? (Number(primaryConfig?.stockWidth) > 0 && Number(primaryConfig?.stockHeight) > 0)
      : sheetConfigs.some(c => Number(c.stockWidth) > 0 && Number(c.stockHeight) > 0)
  )

  const strategyShort = (s: string) => {
    if (s === 'Auto-best') return lang === 'ru' ? 'Лучший авто' : 'Best auto'
    if (s.startsWith('Strip')) return 'Strip'
    if (s.startsWith('Guillotine')) return 'Guillotine'
    if (s.startsWith('Skyline')) return 'Skyline'
    if (s.startsWith('MaxRects')) {
      const m = s.match(/MaxRects(?:-FR|-Swap)?-([^-]+)/)
      const tag = s.includes('-FR-') ? ' FR' : s.includes('-Swap-') ? ' Swap' : ''
      return `MaxRects${tag} ${m ? m[1] : ''}`
    }
    return s.slice(0, 20)
  }

  const algoHint = (algo: AlgorithmChoice): string => {
    if (algo === 'all') return ''
    if (lang === 'ru') {
      if (algo === 'maxrects') return '5 эвристик × 10 порядков сортировки'
      if (algo === 'guillotine') return 'Гильотинный раскрой — широкий остаток'
      if (algo === 'strip') return 'Полосовой раскрой, минимум резов'
      if (algo === 'skyline') return 'Горизонт BL, регулярные резы'
    }
    if (algo === 'maxrects') return '5 heuristics × 10 sort orders'
    if (algo === 'guillotine') return 'Guillotine cut — wide remnant priority'
    if (algo === 'strip') return 'Strip packing, minimum cuts'
    if (algo === 'skyline') return 'Skyline BL, regular cuts'
    return ''
  }

  const totalPartsQty = validParts().reduce((s, p) => s + p.qty, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* ── Mode selector ── */}
        <section className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {lang === 'ru' ? 'Режим листов' : 'Sheet mode'}
            </span>
            <Tooltip text={t.tooltipSheetConfig} />
          </div>
          <div className="space-y-2">
            {/* Radio: Auto-add */}
            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition
              ${autoAddMode ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
              <input type="radio" name="sheetMode" checked={autoAddMode} onChange={() => { setAutoAddMode(true); setResult(null) }}
                className="mt-0.5 accent-indigo-600" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-700">{t.autoAddSheetsMode}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.autoAddSheetsModeHint}</div>
              </div>
            </label>
            {/* Radio: Multi-sheet */}
            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition
              ${!autoAddMode ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
              <input type="radio" name="sheetMode" checked={!autoAddMode} onChange={() => { setAutoAddMode(false); setResult(null) }}
                className="mt-0.5 accent-amber-600" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-700">{t.autoMultiSheetMode}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.autoMultiSheetModeHint}</div>
              </div>
            </label>
          </div>
        </section>

        {/* ── Sheet config ── */}
        <section className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-xs text-slate-500 uppercase tracking-wide flex-1">{t.newBlank}</h2>
            <Tooltip text={t.tooltipSheetConfig} />
            {!autoAddMode && (
              <button onClick={addSheetConfig}
                className="text-xs px-2 py-1 rounded-lg border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition font-semibold shrink-0 ml-1">
                {t.autoAddSheetBtn}
              </button>
            )}
          </div>

          {autoAddMode ? (
            /* Single sheet config */
            <div className="space-y-2">
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">{t.autoColStockLength}</span>
                  <input type="number" value={primaryConfig.stockHeight} onChange={e => updatePrimaryConfig('stockHeight', e.target.value)}
                    placeholder="2800"
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">{t.autoColStockWidth}</span>
                  <input type="number" value={primaryConfig.stockWidth} onChange={e => updatePrimaryConfig('stockWidth', e.target.value)}
                    placeholder="2070"
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full" />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">{t.autoColKerf} (мм)</span>
                <input type="number" value={primaryConfig.kerf} onChange={e => updatePrimaryConfig('kerf', e.target.value)}
                  placeholder="4"
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full" />
              </label>
              {/* Sheet count indicator */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                <span className="text-lg">📄</span>
                <div>
                  <div className="text-xs font-semibold text-indigo-800">
                    {lang === 'ru' ? 'Листы добавляются автоматически' : 'Sheets added automatically'}
                  </div>
                  <div className="text-[10px] text-indigo-500">
                    {lang === 'ru' ? 'Количество зависит от деталей' : 'Count depends on parts'}
                  </div>
                </div>
                <Tooltip text={t.tooltipSheetsCount} />
              </div>
            </div>
          ) : (
            /* Multi-sheet config */
            <>
              {/* Header row */}
              <div className="grid gap-1.5 mb-1" style={{ gridTemplateColumns: 'minmax(76px,1fr) 72px 72px 48px 24px' }}>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{t.autoColSheetName}</span>
                <span className="text-[10px] text-slate-400 font-medium text-center">{t.autoColStockLength}</span>
                <span className="text-[10px] text-slate-400 font-medium text-center">{t.autoColStockWidth}</span>
                <span className="text-[10px] text-slate-400 font-medium text-center">{t.autoColKerf}</span>
                <span />
              </div>
              <div className="space-y-1">
                {sheetConfigs.map((cfg, idx) => (
                  <div key={cfg.id} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: 'minmax(76px,1fr) 72px 72px 48px 24px' }}>
                    <input type="text" value={cfg.name} onChange={e => updateSheetConfig(cfg.id, 'name', e.target.value)}
                      placeholder={`${t.sheetNamePlaceholder} ${idx + 1}`}
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full min-w-0" />
                    <input type="number" value={cfg.stockHeight} onChange={e => updateSheetConfig(cfg.id, 'stockHeight', e.target.value)}
                      placeholder="2800"
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                    <input type="number" value={cfg.stockWidth} onChange={e => updateSheetConfig(cfg.id, 'stockWidth', e.target.value)}
                      placeholder="2070"
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                    <input type="number" value={cfg.kerf} onChange={e => updateSheetConfig(cfg.id, 'kerf', e.target.value)}
                      placeholder="4"
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                    <button onClick={() => removeSheetConfig(cfg.id)} disabled={sheetConfigs.length <= 1}
                      className="w-5 h-6 rounded text-xs flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition disabled:opacity-30 disabled:cursor-not-allowed">✕</button>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 leading-relaxed">
                {lang === 'ru'
                  ? '⚡ Детали размещаются на заданных листах. Новые листы не добавляются. При нехватке места — выводится предупреждение.'
                  : '⚡ Parts placed on given sheets only. No new sheets added. If parts don\'t fit — a warning is shown.'}
              </div>
            </>
          )}
        </section>

        {/* ── Algorithm picker ── */}
        <section className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-1">{t.autoAlgoPickerLabel}</span>
            <Tooltip text={t.tooltipAlgo} />
          </div>
          <div className="flex flex-wrap gap-1">
            {ALGO_OPTIONS.map(algo => (
              <button key={algo} onClick={() => setAlgorithm(algo)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition
                  ${algorithm === algo
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300'}`}>
                {algo === 'all' ? t.autoAlgoAll : ALGORITHM_LABELS[algo]}
              </button>
            ))}
          </div>
          {algorithm !== 'all' && (
            <p className="text-[11px] text-indigo-500 mt-1.5">{algoHint(algorithm)}</p>
          )}
        </section>

        {/* ── Parts table ── */}
        <section className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold text-xs text-slate-500 uppercase tracking-wide flex-1">{t.autoTitle}</h2>
            <Tooltip text={t.tooltipParts} />
            {totalPartsQty > 0 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-semibold">
                {totalPartsQty} {t.partsCount}
              </span>
            )}
            <button onClick={clearParts} className="text-xs text-slate-400 hover:text-red-500 transition ml-1">{t.autoClearParts}</button>
          </div>
          {/* Column headers */}
          <div className="grid gap-1.5 mb-1" style={{ gridTemplateColumns: 'minmax(76px,1fr) 52px 52px 42px 24px 24px' }}>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">{t.autoPartName}</span>
            <span className="text-[10px] text-slate-400 text-center">{t.autoPartWidth}</span>
            <span className="text-[10px] text-slate-400 text-center">{t.autoPartHeight}</span>
            <span className="text-[10px] text-slate-400 text-center">{t.autoPartQty}</span>
            <span className="text-[10px] text-slate-400 text-center" title={t.autoRotateHint}>↻</span>
            <span />
          </div>
          <div className="space-y-1">
            {parts.map(p => (
              <div key={p.id} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: 'minmax(76px,1fr) 52px 52px 42px 24px 24px' }}>
                <input type="text" value={p.name} onChange={e => updatePart(p.id, 'name', e.target.value)}
                  placeholder={`Д${p.id}`}
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full min-w-0" />
                <input type="number" value={p.width} onChange={e => updatePart(p.id, 'width', e.target.value)}
                  placeholder="600"
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                <input type="number" value={p.height} onChange={e => updatePart(p.id, 'height', e.target.value)}
                  placeholder="400"
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                <input type="number" min="1" value={p.qty} onChange={e => updatePart(p.id, 'qty', e.target.value)}
                  className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full" />
                <button onClick={() => updatePart(p.id, 'allowRotate', !p.allowRotate)} title={t.autoRotateHint}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center transition ${p.allowRotate ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>↻</button>
                <button onClick={() => removePart(p.id)}
                  className="w-6 h-6 rounded text-xs flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addPart}
            className="mt-2 w-full text-xs px-2 py-1.5 rounded-lg border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition">
            {t.autoAddPartBtn}
          </button>
        </section>

        {/* ── Run button ── */}
        <div className="px-4 py-3 border-b border-slate-200">
          <button onClick={run} disabled={!canRun || running}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-bold transition shadow flex items-center justify-center gap-2">
            {running ? <><span className="animate-spin inline-block">⚙</span> {t.autoRunning}</> : t.autoRunBtn}
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="px-4 py-4">
            <div className="bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm text-indigo-800 flex-1">{t.autoResultTitle}</div>
                <Tooltip text={t.tooltipResult} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500">{t.autoStrategyLabel}:</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-mono font-semibold">
                  {strategyShort(result.strategy)}
                </span>
              </div>

              {/* Sheets count + per-config */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-indigo-800">📄 {t.autoSheetsUsed} <b>{result.sheetsCount}</b> {pluralSheets(result.sheetsCount, lang)}</span>
                  <Tooltip text={t.tooltipSheetsCount} />
                </div>
                {result.sheetsPerConfig.length > 1 && (
                  <div className="space-y-0.5 mt-1">
                    {result.sheetsPerConfig.map((sc, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] text-indigo-600">
                        <span className="truncate mr-2">└ {sc.configName}</span>
                        <span className="font-bold shrink-0">{sc.count} {pluralSheets(sc.count, lang)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 text-xs text-slate-600 flex-wrap items-center">
                <span>{t.autoEffLabel} <b style={{ color: effColor(result.eff) }}>{result.eff}%</b></span>
              </div>

              <div className="w-full bg-indigo-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${result.eff}%`, background: effColor(result.eff) }} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
                  <div className="text-green-600 font-medium">✅ {t.printTotalPartArea}</div>
                  <div className="font-bold text-green-800">{(result.partArea / 1e6).toFixed(3)} м²</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                  <div className="text-red-500 font-medium">🗑 {t.autoWasteLabel}</div>
                  <div className="font-bold text-red-700">{(result.wasteArea / 1e6).toFixed(3)} м²</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  <div className="text-amber-600 font-medium flex items-center gap-1">
                    <span>✂ {t.autoCutsLabel}</span>
                    <Tooltip text={t.autoCutsHint} />
                  </div>
                  <div className="font-bold" style={{ color: cutsColor(result.totalCuts) }}>{result.totalCuts}</div>
                </div>
                {result.widestRemnant > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5">
                    <div className="text-blue-600 font-medium">📐 {t.wideRemnantLabel}</div>
                    <div className="font-bold text-blue-800">{Math.round(result.widestRemnant)} мм</div>
                  </div>
                )}
              </div>
              {result.cutsPerSheet.length > 1 && (
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-medium">✂ {t.cutsPerSheetLabel}:</div>
                  {result.cutsPerSheet.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-14 shrink-0">{t.printSheetLabel.replace('дет.', '').replace('pcs.', '')} {i + 1}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full" style={{
                          width: `${Math.min(100, (c / Math.max(...result.cutsPerSheet, 1)) * 100)}%`,
                          background: cutsColor(c),
                        }} />
                      </div>
                      <span className="font-semibold w-5 text-right" style={{ color: cutsColor(c) }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return 'ru'
    const saved = localStorage.getItem('cutLang') as LangCode | null
    if (saved && translations[saved]) return saved
    return detectBrowserLang()
  })
  const t = translations[lang]

  const handleLangChange = useCallback((l: LangCode) => {
    setLang(l); localStorage.setItem('cutLang', l)
  }, [])

  const [mode, setMode] = useState<AppMode>('auto')
  useSeo(lang, mode)

  // ── Auto mode state ──
  const [autoAddMode, setAutoAddMode] = useState(true)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [overflowParts, setOverflowParts] = useState<{ name: string; width: number; height: number; qty: number }[]>([])

  // ── Canvas ──
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 })
  const scaleRef = useRef(1)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const isPanRef = useRef(false)
  const panStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setCanvasSize({
          w: Math.max(280, Math.floor(width) - 8),
          h: Math.max(220, Math.floor(height) - 8),
        })
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Sheets ──
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null)
  const [history, setHistory] = useState<Sheet[][]>([])

  const activeSheet = sheets.find(s => s.id === activeSheetId) ?? null
  const rects = activeSheet?.rects ?? []

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedRect = rects.find(r => r.id === selectedId) ?? null

  // ── Manual mode inputs ──
  const [inputWidth, setInputWidth] = useState('2800')
  const [inputHeight, setInputHeight] = useState('2070')
  const [sheetName, setSheetName] = useState('')
  const [kerf, setKerf] = useState('4')
  const [cutDirection, setCutDirection] = useState<CutDirection>('vertical')
  const [partName, setPartName] = useState('')
  const [snapStep, setSnapStep] = useState('5')
  const [manualCutInput, setManualCutInput] = useState('')
  const [useManualInput, setUseManualInput] = useState(false)
  const rawMouseRef = useRef({ x: 0, y: 0 })
  const [snappedCutSize, setSnappedCutSize] = useState<number | null>(null)

  // ── Auto mode lifted state ──
  const [autoParts, setAutoParts] = useState<AutoPartRow[]>([
    createDefaultAutoPart(),
  ])
  const [autoSheets, setAutoSheets] = useState<AutoSheetConfig[]>([
    createDefaultAutoSheet(),
  ])

  const leftSidebarRef = useRef<HTMLDivElement>(null)
  const [mobileSpecOpen, setMobileSpecOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(true)

  const activeCutSize = useCallback((): number | null => {
    if (useManualInput) {
      const v = Number(manualCutInput)
      if (v > 0) return v
      return null
    }
    return snappedCutSize
  }, [useManualInput, manualCutInput, snappedCutSize])

  const saveHistoryAndSheets = useCallback((ns: Sheet[]) => {
    setHistory(prev => [...prev, sheets]); setSheets(ns)
  }, [sheets])

  const updateActiveRects = useCallback((nr: Rect[]) => {
    if (!activeSheetId) return
    saveHistoryAndSheets(sheets.map(s => s.id === activeSheetId ? { ...s, rects: nr } : s))
  }, [activeSheetId, sheets, saveHistoryAndSheets])

  const updateActiveSheetMeta = useCallback((patch: Partial<Sheet>) => {
    if (!activeSheetId) return
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, ...patch } : s))
  }, [activeSheetId])

  const undo = useCallback(() => {
    setHistory(prev => {
      if (!prev.length) return prev
      setSheets(prev[prev.length - 1]); setSelectedId(null)
      return prev.slice(0, -1)
    })
  }, [])

  const clearAll = useCallback(() => {
    setSheets([]); setHistory([]); setActiveSheetId(null); setSelectedId(null)
    setSnappedCutSize(null); setPartName('')
    setHasOverflow(false); setOverflowParts([])
    zoomRef.current = 1; panRef.current = { x: 0, y: 0 }
  }, [])

  const createSheet = () => {
    const w = Number(inputWidth), h = Number(inputHeight)
    if (!w || !h || w <= 0 || h <= 0) return
    const id = uid()
    const name = sheetName.trim() || `${t.sheetNamePlaceholder} ${sheets.length + 1}`
    saveHistoryAndSheets([...sheets, {
      id, name, stockWidth: w, stockHeight: h, cuts: 0,
      kerf: Number(kerf) || 0,
      rects: [{ id: uid(), x: 0, y: 0, width: w, height: h, type: 'waste', name: '' }],
    }])
    setActiveSheetId(id); setSelectedId(null); setSnappedCutSize(null)
    zoomRef.current = 1; panRef.current = { x: 0, y: 0 }
  }

  const deleteSheet = (sheetId: number) => {
    const ns = sheets.filter(s => s.id !== sheetId)
    saveHistoryAndSheets(ns)
    if (activeSheetId === sheetId) { setActiveSheetId(ns[ns.length - 1]?.id ?? null); setSelectedId(null) }
    if (!ns.length) { setHasOverflow(false); setOverflowParts([]) }
  }

  const switchSheet = (sheetId: number) => {
    setActiveSheetId(sheetId); setSelectedId(null); setSnappedCutSize(null)
    zoomRef.current = 1; panRef.current = { x: 0, y: 0 }
  }

  const handleAutoResult = useCallback((ns: Sheet[], overflow: boolean, notFit: { name: string; width: number; height: number; qty: number }[]) => {
    setHistory(prev => [...prev, sheets]); setSheets(ns)
    setActiveSheetId(ns[0]?.id ?? null); setSelectedId(null); setSnappedCutSize(null)
    setHasOverflow(overflow); setOverflowParts(notFit)
    zoomRef.current = 1; panRef.current = { x: 0, y: 0 }
  }, [sheets])

  useEffect(() => {
    if (mode !== 'manual' || !activeSheet) return
    setKerf(String(activeSheet.kerf ?? 4))
  }, [mode, activeSheetId, activeSheet])

  useEffect(() => {
    if (mode !== 'manual' || !activeSheet) return
    const nextKerf = Number(kerf) || 0
    if ((activeSheet.kerf ?? 0) === nextKerf) return
    updateActiveSheetMeta({ kerf: nextKerf })
  }, [kerf, mode, activeSheet, updateActiveSheetMeta])

  const performCut = useCallback((sizeOverride?: number) => {
    if (!selectedRect) return
    const size = sizeOverride ?? activeCutSize()
    if (size === null || size === undefined || size <= 0) return
    const k = Number(kerf)
    let a: Rect, b: Rect
    if (cutDirection === 'vertical') {
      if (size + k >= selectedRect.width) return
      a = { ...selectedRect, id: uid(), width: size }
      b = { ...selectedRect, id: uid(), x: selectedRect.x + size + k, width: selectedRect.width - size - k }
    } else {
      if (size + k >= selectedRect.height) return
      a = { ...selectedRect, id: uid(), height: size }
      b = { ...selectedRect, id: uid(), y: selectedRect.y + size + k, height: selectedRect.height - size - k }
    }
    a.type = 'waste'; a.name = ''; b.type = 'waste'; b.name = ''
    updateActiveRects(rects.filter(r => r.id !== selectedRect.id).concat([a, b]))
    setSelectedId(null); setSnappedCutSize(null); setManualCutInput('')
  }, [selectedRect, activeCutSize, kerf, cutDirection, rects, updateActiveRects])

  const assignPart = useCallback(() => {
    if (!selectedRect || !partName.trim()) return
    updateActiveRects(rects.map(r => r.id === selectedRect.id ? { ...r, type: 'part', name: partName.trim() } : r))
    setSelectedId(null); setPartName('')
  }, [selectedRect, partName, rects, updateActiveRects])

  const unassignPart = useCallback(() => {
    if (!selectedRect) return
    updateActiveRects(rects.map(r => r.id === selectedRect.id ? { ...r, type: 'waste', name: '' } : r))
    setSelectedId(null)
  }, [selectedRect, rects, updateActiveRects])

  const deleteSelected = useCallback(() => {
    if (!selectedRect) return
    updateActiveRects(rects.filter(r => r.id !== selectedRect.id)); setSelectedId(null); setSnappedCutSize(null)
  }, [selectedRect, rects, updateActiveRects])

  const selectNext = useCallback(() => {
    if (!rects.length) return
    if (!selectedId) { setSelectedId(rects[0].id); return }
    const idx = rects.findIndex(r => r.id === selectedId)
    setSelectedId(rects[(idx + 1) % rects.length].id); setSnappedCutSize(null)
  }, [rects, selectedId])

  const computeSnapped = useCallback((mx: number, my: number, rect: Rect | null) => {
    if (!rect) return null
    const step = Math.max(1, Number(snapStep) || 5)
    if (cutDirection === 'vertical') {
      const raw = mx - rect.x
      if (raw <= 0 || raw >= rect.width) return null
      const k = Number(kerf)
      const max = rect.width - k - 1
      return snapToGrid(raw, step, max)
    } else {
      const raw = my - rect.y
      if (raw <= 0 || raw >= rect.height) return null
      const k = Number(kerf)
      const max = rect.height - k - 1
      return snapToGrid(raw, step, max)
    }
  }, [cutDirection, snapStep, kerf])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const zoom = zoomRef.current
    const pan = panRef.current
    const CW = canvas.width
    const CH = canvas.height

    ctx.clearRect(0, 0, CW, CH)

    // Background — red tint if overflow
    if (mode === 'auto' && hasOverflow) {
      ctx.fillStyle = 'rgba(254,226,226,0.6)'
      ctx.fillRect(0, 0, CW, CH)
    }

    const ts = 20
    for (let ty = 0; ty < CH; ty += ts)
      for (let tx = 0; tx < CW; tx += ts) {
        const baseColor = (mode === 'auto' && hasOverflow)
          ? ((Math.floor(tx / ts) + Math.floor(ty / ts)) % 2 === 0) ? 'rgba(254,202,202,0.5)' : 'rgba(252,165,165,0.3)'
          : ((Math.floor(tx / ts) + Math.floor(ty / ts)) % 2 === 0) ? '#f1f5f9' : '#e2e8f0'
        ctx.fillStyle = baseColor
        ctx.fillRect(tx, ty, ts, ts)
      }

    if (!rects.length) {
      ctx.fillStyle = '#94a3b8'; ctx.font = '14px Inter,Arial'; ctx.textAlign = 'center'
      ctx.fillText(t.canvasEmpty, CW / 2, CH / 2); ctx.textAlign = 'left'
      return
    }

    const maxW = Math.max(...rects.map(r => r.x + r.width))
    const maxH = Math.max(...rects.map(r => r.y + r.height))
    const baseScale = Math.min((CW - PADDING * 2) / maxW, (CH - PADDING * 2) / maxH, 1)
    const s = baseScale * zoom
    scaleRef.current = s
    const ox = PADDING + pan.x, oy = PADDING + pan.y

    ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 12
    ctx.fillStyle = '#fff'; ctx.fillRect(ox, oy, maxW * s, maxH * s)
    ctx.shadowBlur = 0

    for (const r of rects) {
      const x = ox + r.x * s, y = oy + r.y * s, w = r.width * s, h = r.height * s
      if (w < 0.5 || h < 0.5) continue

      if (r.type === 'part') {
        const grad = ctx.createLinearGradient(x, y, x + w, y + h)
        grad.addColorStop(0, r.id === selectedId ? '#4ade80' : '#86efac')
        grad.addColorStop(1, r.id === selectedId ? '#22c55e' : '#bbf7d0')
        ctx.fillStyle = grad
        ctx.fillRect(x, y, w, h)
      } else {
        const isWideRemnant = Math.max(r.width, r.height) > Math.min(maxW, maxH) * 0.3
        ctx.fillStyle = r.id === selectedId ? '#e0e7ff' : (isWideRemnant ? '#fefce8' : '#f8fafc')
        ctx.fillRect(x, y, w, h)
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
        ctx.globalAlpha = isWideRemnant ? 0.05 : 0.09
        ctx.strokeStyle = isWideRemnant ? '#ca8a04' : '#475569'; ctx.lineWidth = 4
        for (let i = -h; i < w + h; i += 13) {
          ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i - h, y + h); ctx.stroke()
        }
        ctx.restore()
      }

      ctx.strokeStyle = r.id === selectedId ? '#4f46e5' : (r.type === 'part' ? '#16a34a' : '#94a3b8')
      ctx.lineWidth = r.id === selectedId ? 2.5 : 1
      ctx.strokeRect(x, y, w, h)

      if (w > 30 && h > 18) {
        ctx.fillStyle = r.type === 'part' ? '#14532d' : '#334155'
        const fs = Math.max(9, Math.min(13, w / 9))
        ctx.font = `bold ${fs}px Inter,Arial`
        ctx.fillText(formatSize(r.width, r.height), x + 4, y + fs + 3)
        if (r.name && h > 34) {
          ctx.font = `${Math.max(8, fs - 1)}px Inter,Arial`
          ctx.fillStyle = '#4f46e5'
          const maxC = Math.floor(w / (fs * 0.55))
          ctx.fillText(r.name.length > maxC ? r.name.slice(0, maxC - 1) + '…' : r.name, x + 4, y + fs + 3 + fs)
        }
      }
    }

    // Cut lines overlay for auto mode
    if (mode === 'auto' && activeSheet && (activeSheet.cuts ?? 0) > 0) {
      ctx.save()
      ctx.strokeStyle = 'rgba(239,68,68,0.25)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      const placed = rects.filter(r => r.type === 'part')
      const xs = new Set<number>()
      const ys = new Set<number>()
      for (const p of placed) {
        if (p.x > 1) xs.add(p.x)
        if (p.x + p.width < (activeSheet.stockWidth - 1)) xs.add(p.x + p.width)
        if (p.y > 1) ys.add(p.y)
        if (p.y + p.height < (activeSheet.stockHeight - 1)) ys.add(p.y + p.height)
      }
      for (const x of xs) {
        ctx.beginPath(); ctx.moveTo(ox + x * s, oy); ctx.lineTo(ox + x * s, oy + activeSheet.stockHeight * s); ctx.stroke()
      }
      for (const y of ys) {
        ctx.beginPath(); ctx.moveTo(ox, oy + y * s); ctx.lineTo(ox + activeSheet.stockWidth * s, oy + y * s); ctx.stroke()
      }
      ctx.restore()
    }

    // Manual mode cut preview
    if (mode === 'manual' && selectedRect) {
      const rawMouse = rawMouseRef.current
      const step = Math.max(1, Number(snapStep) || 5)
      const sx = ox + selectedRect.x * s
      const sy = oy + selectedRect.y * s
      const sw2 = selectedRect.width * s
      const sh2 = selectedRect.height * s
      const k = Number(kerf)

      let previewSize: number | null = null
      if (useManualInput) {
        const v = Number(manualCutInput)
        if (v > 0) previewSize = v
      } else {
        const raw = cutDirection === 'vertical'
          ? rawMouse.x - selectedRect.x
          : rawMouse.y - selectedRect.y
        if (raw > 0 && raw < (cutDirection === 'vertical' ? selectedRect.width : selectedRect.height)) {
          const max = (cutDirection === 'vertical' ? selectedRect.width : selectedRect.height) - k - 1
          previewSize = snapToGrid(raw, step, max)
        }
      }

      ctx.save()

      if (cutDirection === 'vertical') {
        const max = selectedRect.width - k - 1
        if (!useManualInput) {
          ctx.globalAlpha = 0.08; ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 1; ctx.setLineDash([])
          for (let sv = step; sv <= max; sv += step) {
            const cx = ox + (selectedRect.x + sv) * s
            ctx.beginPath(); ctx.moveTo(cx, sy); ctx.lineTo(cx, sy + sh2); ctx.stroke()
          }
          ctx.globalAlpha = 1
        }
        if (previewSize !== null && previewSize > 0 && previewSize < selectedRect.width) {
          const cx = ox + (selectedRect.x + previewSize) * s
          if (!useManualInput) {
            const snapZonePx = Math.max(6, step * s * 0.3)
            const snapGrad = ctx.createLinearGradient(cx - snapZonePx, 0, cx + snapZonePx, 0)
            snapGrad.addColorStop(0, 'rgba(239,68,68,0)')
            snapGrad.addColorStop(0.5, 'rgba(239,68,68,0.15)')
            snapGrad.addColorStop(1, 'rgba(239,68,68,0)')
            ctx.fillStyle = snapGrad; ctx.fillRect(cx - snapZonePx, sy, snapZonePx * 2, sh2)
          }
          ctx.strokeStyle = useManualInput ? '#7c3aed' : '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([6, 3])
          ctx.beginPath(); ctx.moveTo(cx, sy); ctx.lineTo(cx, sy + sh2); ctx.stroke(); ctx.setLineDash([])
          ctx.fillStyle = useManualInput ? '#7c3aed' : '#ef4444'
          ctx.beginPath(); ctx.arc(cx, sy + sh2 / 2, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, sy + sh2 / 2, 2.5, 0, Math.PI * 2); ctx.fill()
          ctx.font = 'bold 11px Inter,Arial'
          const label = `${previewSize} мм`
          const lw = ctx.measureText(label).width
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(cx + 4, sy + 3, lw + 8, 15)
          ctx.fillStyle = useManualInput ? '#7c3aed' : '#ef4444'; ctx.fillText(label, cx + 8, sy + 14)
          if (!useManualInput) {
            ctx.font = '10px Inter,Arial'; ctx.fillStyle = 'rgba(79,70,229,0.85)'
            ctx.fillText(`⊕ ${step}мм`, sx + 4, sy + sh2 - 6)
          }
        }
      } else {
        const max = selectedRect.height - k - 1
        if (!useManualInput) {
          ctx.globalAlpha = 0.08; ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 1; ctx.setLineDash([])
          for (let sv = step; sv <= max; sv += step) {
            const cy = oy + (selectedRect.y + sv) * s
            ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(sx + sw2, cy); ctx.stroke()
          }
          ctx.globalAlpha = 1
        }
        if (previewSize !== null && previewSize > 0 && previewSize < selectedRect.height) {
          const cy = oy + (selectedRect.y + previewSize) * s
          if (!useManualInput) {
            const snapZonePx = Math.max(6, step * s * 0.3)
            const snapGrad = ctx.createLinearGradient(0, cy - snapZonePx, 0, cy + snapZonePx)
            snapGrad.addColorStop(0, 'rgba(239,68,68,0)')
            snapGrad.addColorStop(0.5, 'rgba(239,68,68,0.15)')
            snapGrad.addColorStop(1, 'rgba(239,68,68,0)')
            ctx.fillStyle = snapGrad; ctx.fillRect(sx, cy - snapZonePx, sw2, snapZonePx * 2)
          }
          ctx.strokeStyle = useManualInput ? '#7c3aed' : '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([6, 3])
          ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(sx + sw2, cy); ctx.stroke(); ctx.setLineDash([])
          ctx.fillStyle = useManualInput ? '#7c3aed' : '#ef4444'
          ctx.beginPath(); ctx.arc(sx + sw2 / 2, cy, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + sw2 / 2, cy, 2.5, 0, Math.PI * 2); ctx.fill()
          ctx.font = 'bold 11px Inter,Arial'
          const label = `${previewSize} мм`
          const lw = ctx.measureText(label).width
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(sx + 4, cy - 14, lw + 8, 15)
          ctx.fillStyle = useManualInput ? '#7c3aed' : '#ef4444'; ctx.fillText(label, sx + 8, cy - 3)
          if (!useManualInput) {
            ctx.font = '10px Inter,Arial'; ctx.fillStyle = 'rgba(79,70,229,0.85)'
            ctx.fillText(`⊕ ${step}мм`, sx + sw2 - 40, sy + 14)
          }
        }
      }
      ctx.restore()
    }

    if (zoom !== 1) {
      ctx.fillStyle = 'rgba(71,85,105,0.75)'; ctx.font = 'bold 12px Inter,Arial'; ctx.textAlign = 'right'
      ctx.fillText(`${Math.round(zoom * 100)}%`, CW - 8, CH - 8); ctx.textAlign = 'left'
    }

    if (mode === 'auto' && activeSheet && (activeSheet.cuts ?? 0) > 0) {
      const c = activeSheet.cuts ?? 0
      ctx.fillStyle = cutsColor(c) + 'cc'; ctx.font = 'bold 11px Inter,Arial'; ctx.textAlign = 'right'
      ctx.fillText(`✂ ~${c} ${t.autoCutsLabel}`, CW - 8, 20); ctx.textAlign = 'left'
    }
  }, [rects, selectedId, selectedRect, cutDirection, t.canvasEmpty, t.autoCutsLabel, mode, activeSheet, snapStep, kerf, useManualInput, manualCutInput, hasOverflow])

  useEffect(() => { drawCanvas() }, [drawCanvas, canvasSize])

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const bb = canvasRef.current!.getBoundingClientRect()
    const px = e.clientX - bb.left, py = e.clientY - bb.top
    return {
      px, py,
      mx: (px - PADDING - panRef.current.x) / scaleRef.current,
      my: (py - PADDING - panRef.current.y) / scaleRef.current,
    }
  }

  const getRectAt = (mx: number, my: number) =>
    [...rects].reverse().find(r => mx >= r.x && mx <= r.x + r.width && my >= r.y && my <= r.y + r.height)

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanRef.current) return
    const { mx, my } = getCoords(e)
    setSelectedId(getRectAt(mx, my)?.id ?? null); setSnappedCutSize(null)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'manual') return
    const { mx, my } = getCoords(e)
    const target = getRectAt(mx, my)
    if (!target) return
    const k = Number(kerf)
    const step = Math.max(1, Number(snapStep) || 5)
    let a: Rect, b: Rect
    if (cutDirection === 'vertical') {
      const max = target.width - k - 1
      const size = snapToGrid(mx - target.x, step, max)
      if (size <= 0 || size + k >= target.width) return
      a = { ...target, id: uid(), width: size }
      b = { ...target, id: uid(), x: target.x + size + k, width: target.width - size - k }
    } else {
      const max = target.height - k - 1
      const size = snapToGrid(my - target.y, step, max)
      if (size <= 0 || size + k >= target.height) return
      a = { ...target, id: uid(), height: size }
      b = { ...target, id: uid(), y: target.y + size + k, height: target.height - size - k }
    }
    a.type = 'waste'; a.name = ''; b.type = 'waste'; b.name = ''
    updateActiveRects(rects.filter(r => r.id !== target.id).concat([a, b]))
    setSelectedId(null); setSnappedCutSize(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanRef.current) {
      const bb = canvasRef.current!.getBoundingClientRect()
      const px = e.clientX - bb.left, py = e.clientY - bb.top
      panRef.current = {
        x: panStartRef.current.px + (px - panStartRef.current.mx),
        y: panStartRef.current.py + (py - panStartRef.current.my),
      }
      drawCanvas(); return
    }
    const { mx, my } = getCoords(e)
    rawMouseRef.current = { x: mx, y: my }
    if (mode === 'manual' && selectedRect && !useManualInput) {
      const snapped = computeSnapped(mx, my, selectedRect)
      setSnappedCutSize(snapped)
    }
    drawCanvas()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault(); isPanRef.current = true
      const bb = canvasRef.current!.getBoundingClientRect()
      panStartRef.current = { mx: e.clientX - bb.left, my: e.clientY - bb.top, px: panRef.current.x, py: panRef.current.y }
    }
  }
  const handleMouseUp = () => { isPanRef.current = false }

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey) {
      zoomRef.current = Math.max(0.2, Math.min(10, zoomRef.current * (e.deltaY > 0 ? 0.9 : 1.1)))
      drawCanvas()
    } else if (mode === 'manual') {
      setCutDirection(p => p === 'vertical' ? 'horizontal' : 'vertical')
    }
  }, [drawCanvas, mode])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.addEventListener('wheel', handleWheel, { passive: false })
    return () => c.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return }
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Tab') { e.preventDefault(); selectNext() }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected() }
      else if (e.key === 'Enter' && mode === 'manual') performCut()
      else if (e.key === 'Escape') { setSelectedId(null); setSnappedCutSize(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [undo, selectNext, deleteSelected, performCut, mode])

  const resetZoom = () => { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; drawCanvas() }

  // ── Save / Load / Print ────────────────────────────────────────────────────

  const saveProject = () => {
    const data: ProjectData = {
      version: 2,
      sheets,
      kerf: Number(kerf),
      lang,
      autoParts,
      autoSheets,
      autoMode: mode === 'auto',
      autoAddSheetsMode: autoAddMode,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url; a.download = `cut_${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const loadProject = () => {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = '.json,application/json'
    inp.onchange = () => {
      const file = inp.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data: ProjectData = JSON.parse(reader.result as string)
          if (!data.sheets) throw new Error()
          data.sheets.forEach(s => {
            s.rects.forEach(r => { if (r.id >= nextId) nextId = r.id + 1 })
            if (s.id >= nextId) nextId = s.id + 1
          })
          setSheets(data.sheets); setHistory([])
          setActiveSheetId(data.sheets[0]?.id ?? null); setSelectedId(null); setSnappedCutSize(null)
          setKerf(String(data.kerf ?? 4))
          setHasOverflow(false); setOverflowParts([])
          if (data.lang && translations[data.lang]) { setLang(data.lang); localStorage.setItem('cutLang', data.lang) }
          if (data.autoParts && data.autoParts.length > 0) {
            setAutoParts(data.autoParts)
            const maxId = Math.max(...data.autoParts.map(p => p.id))
            if (maxId >= autoRowId) autoRowId = maxId + 1
          } else setAutoParts([createDefaultAutoPart()])
          if (data.autoSheets && data.autoSheets.length > 0) {
            setAutoSheets(data.autoSheets)
            const maxId = Math.max(...data.autoSheets.map(s => s.id))
            if (maxId >= autoSheetRowId) autoSheetRowId = maxId + 1
          } else setAutoSheets([createDefaultAutoSheet()])
          setMode(data.autoMode ? 'auto' : 'manual')
          if (data.autoAddSheetsMode !== undefined) setAutoAddMode(data.autoAddSheetsMode)
          zoomRef.current = 1; panRef.current = { x: 0, y: 0 }
        } catch { alert(t.alertLoadError) }
      }
      reader.readAsText(file)
    }
    inp.click()
  }

  const printProject = () => {
    if (!sheets.length) return
    const sheetBlocks = sheets.map(sheet => {
      const sr = sheet.rects
      const parts = sr.filter(r => r.type === 'part')
      const eff = sheetEfficiency(sheet)
      const spec: Record<string, { name: string; width: number; height: number; count: number }> = {}
      parts.forEach(r => {
        const key = `${r.name}||${formatSize(r.width, r.height)}`
        if (!spec[key]) spec[key] = { name: r.name, width: r.width, height: r.height, count: 0 }
        spec[key].count++
      })
      const PRINT_W = 900, PRINT_H = 520
      const tmp = document.createElement('canvas')
      tmp.width = PRINT_W; tmp.height = PRINT_H
      const ctx = tmp.getContext('2d')!
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, PRINT_W, PRINT_H)
      if (sr.length) {
        const mW = Math.max(...sr.map(r => r.x + r.width))
        const mH = Math.max(...sr.map(r => r.y + r.height))
        const sc = Math.min((PRINT_W - 20) / mW, (PRINT_H - 20) / mH, 1)
        const ox = 10, oy = 10
        ctx.fillStyle = '#ffffff'; ctx.fillRect(ox, oy, mW * sc, mH * sc)
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, mW * sc, mH * sc)
        for (const r of sr) {
          const x = ox + r.x * sc, y = oy + r.y * sc, w = r.width * sc, h = r.height * sc
          if (w < 1 || h < 1) continue
          if (r.type === 'part') {
            ctx.fillStyle = '#bbf7d0'; ctx.fillRect(x, y, w, h)
            ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h)
            if (w > 40 && h > 24) {
              const fs = Math.max(8, Math.min(11, Math.min(w / 8, h / 4)))
              ctx.fillStyle = '#14532d'; ctx.font = `bold ${fs}px Arial`; ctx.textAlign = 'center'
              ctx.fillText(`${Math.round(r.width)}×${Math.round(r.height)}`, x + w / 2, y + h / 2 - (r.name && h > 40 ? fs / 2 + 1 : 0))
              if (r.name && h > 36) {
                ctx.fillStyle = '#4f46e5'; ctx.font = `${Math.max(7, fs - 1)}px Arial`
                const maxChars = Math.floor(w / (fs * 0.58))
                ctx.fillText(r.name.length > maxChars ? r.name.slice(0, maxChars - 1) + '…' : r.name, x + w / 2, y + h / 2 + fs + 1)
              }
              ctx.textAlign = 'left'
            }
          } else {
            ctx.fillStyle = '#f1f5f9'; ctx.fillRect(x, y, w, h)
            ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
            ctx.globalAlpha = 0.12; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3
            for (let i = -h; i < w + h; i += 12) {
              ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i - h, y + h); ctx.stroke()
            }
            ctx.restore(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h)
            if (w > 28 && h > 14) {
              const fs = Math.max(7, Math.min(9, Math.min(w / 10, h / 4)))
              ctx.fillStyle = '#94a3b8'; ctx.font = `${fs}px Arial`; ctx.textAlign = 'center'
              ctx.fillText(`${Math.round(r.width)}×${Math.round(r.height)}`, x + w / 2, y + h / 2 + fs / 2)
              ctx.textAlign = 'left'
            }
          }
        }
      }
      const img = tmp.toDataURL('image/png')
      const rows = Object.values(spec).map(p =>
        `<tr><td><b>${p.name}</b></td><td>${Math.round(p.width)}</td><td>${Math.round(p.height)}</td><td>${(p.width * p.height / 1e6).toFixed(4)}</td><td>${p.count}</td><td>${(p.width * p.height * p.count / 1e6).toFixed(4)}</td></tr>`
      ).join('')
      const sheetKerf = sheet.kerf ?? (Number(kerf) || 0)
      const cutsInfo = (sheet.cuts ?? 0) > 0 ? `<span>✂ ${t.printCuts} <b style="color:#d97706">${sheet.cuts}</b></span>` : ''
      return `<div class="sheet-block">
        <h2>${sheet.name}</h2>
        <div class="sheet-info">
          <span>📐 ${sheet.stockWidth}×${sheet.stockHeight} мм</span>
          <span>🪚 ${t.printSaw} <b>${sheetKerf} мм</b></span>
          <span>${t.printEff} <b style="color:#4f46e5">${eff}%</b></span>
          <span>🟩 ${parts.length} ${t.printSheetLabel}</span>
          ${cutsInfo}
        </div>
        <table>
          <thead><tr><th>${t.printPart}</th><th>${t.printW}</th><th>${t.printH}</th><th>${t.printArea1}</th><th>${t.printQty}</th><th>${t.printAreaSum}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="6" style="color:#94a3b8">${t.printNoPartsRow}</td></tr>`}</tbody>
        </table>
        <div style="margin-bottom:6px"><div class="eff-bar"><div class="eff-fill" style="width:${eff}%"></div></div></div>
        <img src="${img}" class="layout-img" style="width:${PRINT_W}px;max-width:100%">
      </div>`
    }).join('\n')

    const allParts = sheets.flatMap(s => s.rects.filter(r => r.type === 'part'))
    const tPA = sheetsPartArea(sheets)
    const tWA = sheetsWasteArea(sheets)
    const tEff = sheetsEfficiency(sheets)
    const tCuts = sheets.reduce((s, sh) => s + (sh.cuts ?? 0), 0)
    const gSpec: Record<string, { name: string; width: number; height: number; count: number }> = {}
    allParts.forEach(r => {
      const key = `${r.name}||${formatSize(r.width, r.height)}`
      if (!gSpec[key]) gSpec[key] = { name: r.name, width: r.width, height: r.height, count: 0 }
      gSpec[key].count++
    })
    const gRows = Object.values(gSpec).map(p =>
      `<tr><td><b>${p.name}</b></td><td>${Math.round(p.width)}</td><td>${Math.round(p.height)}</td><td>${(p.width * p.height / 1e6).toFixed(4)}</td><td>${p.count}</td><td>${(p.width * p.height * p.count / 1e6).toFixed(4)}</td></tr>`
    ).join('')
    const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${t.printTitle}</title><style>${PRINT_STYLE}</style></head><body>
<h1>📐 ${t.printTitle}</h1>
<p style="color:#64748b;margin-bottom:16px">${t.printDate} ${new Date().toLocaleDateString()} · ${t.printSheets} <b>${sheets.length}</b> · ${t.printEff} <b style="color:#4f46e5">${tEff}%</b>${tCuts > 0 ? ` · ✂ ${t.printCuts} <b style="color:#d97706">${tCuts}</b>` : ''}</p>
${sheets.length > 1 ? `<div class="sheet-block"><h2>${t.printGlobalSpec}</h2><table><thead><tr><th>${t.printPart}</th><th>${t.printW}</th><th>${t.printH}</th><th>${t.printArea1}</th><th>${t.printQty}</th><th>${t.printAreaSum}</th></tr></thead><tbody>${gRows || `<tr><td colspan="6">${t.printNoPartsRow}</td></tr>`}</tbody></table><div style="display:flex;gap:16px;padding:6px 8px;background:#f1f5f9;border-radius:4px;font-size:12px;flex-wrap:wrap"><span>${t.printTotalParts} <b>${allParts.length} ${t.printSheetLabel}</b></span><span>${t.printTotalPartArea} <b>${(tPA / 1e6).toFixed(4)} м²</b></span><span>${t.printTotalWasteArea} <b>${(tWA / 1e6).toFixed(4)} м²</b></span><span>${t.printEff} <b style="color:#4f46e5">${tEff}%</b></span>${tCuts > 0 ? `<span>✂ ${t.printCuts} <b style="color:#d97706">${tCuts}</b></span>` : ''}</div></div>` : ''}
${sheetBlocks}
<script>window.onload=()=>window.print()<\/script></body></html>`
    const win = window.open('', '_blank')
    if (!win) { alert(t.alertPopupBlocked); return }
    win.document.write(html); win.document.close()
  }

  // ── Spec data ─────────────────────────────────────────────────────────────

  const specParts = rects.filter(r => r.type === 'part')
  const spec: Record<string, { name: string; width: number; height: number; count: number }> = {}
  specParts.forEach(r => {
    const key = `${r.name}||${formatSize(r.width, r.height)}`
    if (!spec[key]) spec[key] = { name: r.name, width: r.width, height: r.height, count: 0 }
    spec[key].count++
  })
  const specList = Object.values(spec)
  const totalPartArea = activeSheet ? sheetPartArea(activeSheet) : 0
  const totalArea = activeSheet ? sheetStockArea(activeSheet) : 0
  const efficiency = activeSheet ? sheetEfficiency(activeSheet) : 0
  const sheetCuts = activeSheet?.cuts ?? 0

  const displayCutSize = useManualInput
    ? (Number(manualCutInput) > 0 ? Number(manualCutInput) : null)
    : snappedCutSize

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="flex h-dvh min-h-0 flex-col bg-slate-100 font-sans text-slate-800 select-none overflow-hidden lg:h-screen lg:flex-row">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside ref={leftSidebarRef}
        className="hidden bg-white shadow-sm shrink-0 lg:flex lg:h-auto lg:w-56 lg:min-w-[224px] lg:max-w-[224px] lg:flex-col lg:border-r lg:border-slate-200">

        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div>
              <h2 className="font-semibold text-sm text-slate-700">{t.specification}</h2>
              {activeSheet && <p className="text-xs text-slate-400">{activeSheet.name}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
          <div className="space-y-1">
            {specList.length === 0 && (
              <p className="text-xs text-slate-400 mt-4 text-center">{t.noPartsAssigned}</p>
            )}
            {specList.map((p, i) => (
              <div key={i} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="font-semibold text-sm text-green-800 truncate">{p.name}</div>
                <div className="text-xs text-slate-500">{formatSize(p.width, p.height)} мм</div>
                <div className="text-xs font-bold text-green-700 mt-0.5">× {p.count} {t.partsCount}</div>
              </div>
            ))}
          </div>

          {mode === 'auto' && hasOverflow && overflowParts.length > 0 && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 overflow-hidden">
              <div className="px-3 py-2 bg-red-500 flex items-center gap-2">
                <span className="text-white text-sm">⚠</span>
                <span className="text-white text-xs font-bold">{t.notFitPanelTitle}</span>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] text-red-600 mb-1.5 leading-snug">{t.notFitPanelHint}</p>
                <div className="space-y-1">
                  {overflowParts.map((p, i) => (
                    <div key={i} className="bg-white border border-red-200 rounded-lg px-2 py-1.5">
                      <div className="font-semibold text-xs text-red-800">{p.name || `${t.autoPartName} ${i + 1}`}</div>
                      <div className="text-[10px] text-red-600">{p.width}×{p.height} мм × {p.qty} {t.partsCount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {totalArea > 0 && (
            <div className="py-3 border-t border-slate-200 space-y-1.5">
              <div className="text-xs text-slate-500">{t.efficiencyCurrentSheet}</div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${efficiency}%`, background: effColor(efficiency) }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold" style={{ color: effColor(efficiency) }}>{efficiency}%</span>
                <span className="text-xs text-slate-400">{(totalPartArea / 1e6).toFixed(3)} / {(totalArea / 1e6).toFixed(3)} м²</span>
              </div>
              {sheetCuts > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-400">✂ {t.autoCutsLabel}</span>
                  <span className="text-xs font-bold" style={{ color: cutsColor(sheetCuts) }}>~{sheetCuts}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm pt-3">
          <div className="px-3 pb-3 space-y-1.5">
          <button onClick={saveProject} disabled={!sheets.length}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t.saveProject}
          </button>
          <button onClick={loadProject}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition">
            {t.loadProject}
          </button>
          <button onClick={printProject} disabled={!sheets.length}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {t.printPdf}
          </button>
          </div>

          <details className="group hidden lg:block">
            <summary className="mx-3 mb-3 flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100">
              <span>{t.donateTitle ?? 'Поддержать проект'}</span>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-indigo-700 group-open:hidden">
                QR
              </span>
              <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500 group-open:inline">
                {lang === 'ru' ? 'Свернуть' : 'Close'}
              </span>
            </summary>
            <DonateWidget t={t} blockRef={leftSidebarRef} />
          </details>
          <details className="group lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-bold text-slate-700">
              <span>{t.donateTitle ?? 'Поддержать проект'}</span>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700 group-open:hidden">
                QR
              </span>
              <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 group-open:inline">
                {lang === 'ru' ? 'Свернуть' : 'Close'}
              </span>
            </summary>
            <div className="pb-3">
              <DonateWidget t={t} />
            </div>
          </details>
        </div>
      </aside>

      {/* ── CENTER ──────────────────────────────────────────────────────────── */}
      <main className="order-1 flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden lg:order-none">

        {/* Tabs + mode switcher + language */}
        <div className="flex flex-wrap items-center gap-y-1 bg-white border-b border-slate-200 shadow-sm shrink-0 lg:flex-nowrap">
          <div className="order-2 flex w-full min-w-0 flex-1 items-end gap-1 overflow-x-auto px-3 pt-1 pb-0 lg:order-none lg:w-auto lg:pt-2">
            {sheets.map(s => {
              const eff = sheetEfficiency(s)
              const sc = s.cuts ?? 0
              return (
                <div key={s.id} onClick={() => switchSheet(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-sm cursor-pointer border-b-2 transition whitespace-nowrap shrink-0
                    ${s.id === activeSheetId ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  <span>{s.name}</span>
                  <span className="text-xs px-1 py-0.5 rounded font-bold"
                    style={{ background: eff > 0 ? effColor(eff) + '22' : '#f1f5f9', color: eff > 0 ? effColor(eff) : '#94a3b8' }}>
                    {eff > 0 ? `${eff}%` : `${s.stockWidth}×${s.stockHeight}`}
                  </span>
                  {sc > 0 && (
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded"
                      style={{ background: cutsColor(sc) + '22', color: cutsColor(sc) }}>
                      ✂{sc}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); deleteSheet(s.id) }}
                    className="ml-1 text-slate-400 hover:text-red-500 text-xs leading-none" title={t.deleteHint}>✕</button>
                </div>
              )
            })}
            {!sheets.length && <span className="text-xs text-slate-400 py-2 px-1 whitespace-nowrap">{t.noSheets}</span>}
          </div>

          <div className="order-1 flex shrink-0 px-2 py-1.5 lg:hidden">
            <div className="flex overflow-hidden rounded-lg border border-slate-300 shadow-sm">
              <button onClick={() => { setMobileToolsOpen(true); setMobileSpecOpen(false) }}
                className={`px-2.5 py-1 text-xs font-semibold transition ${mobileToolsOpen ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>
                {lang === 'ru' ? 'Панель' : 'Panel'}
              </button>
              <button onClick={() => { setMobileSpecOpen(true); setMobileToolsOpen(false) }}
                className={`px-2.5 py-1 text-xs font-semibold transition ${mobileSpecOpen ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>
                {lang === 'ru' ? 'Специф.' : 'Spec'}
              </button>
            </div>
          </div>

          <div className="order-1 ml-auto px-2 py-1.5 shrink-0 border-l border-slate-100 lg:order-none lg:ml-0 lg:px-3">
            <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-sm">
              {(['manual', 'auto'] as AppMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-2.5 py-1 text-xs font-medium transition sm:px-3
                    ${mode === m ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {m === 'manual' ? `✏ ${t.modeManual}` : `⚡ ${t.modeAuto}`}
                </button>
              ))}
            </div>
          </div>

          <div className="order-1 px-2 py-1.5 shrink-0 border-l border-slate-100 lg:order-none lg:px-3">
            <LangSelector lang={lang} t={t} onChange={handleLangChange} />
          </div>
        </div>

        {/* Toolbar */}
        <div className={`${mobileSpecOpen ? 'hidden lg:flex' : 'flex'} items-center gap-2 px-2 py-2 bg-slate-50 border-b border-slate-200 shrink-0 min-w-0 sm:px-3`}>
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto whitespace-nowrap pr-1">
            <button onClick={undo} disabled={!history.length} title={t.undoHint}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition shrink-0 sm:py-1.5">
              {t.undo}
            </button>
            <button onClick={clearAll} disabled={!sheets.length} title={t.clearAllHint}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition shrink-0 sm:py-1.5">
              {t.clearAll}
            </button>
            <button onClick={resetZoom} title={t.resetZoomHint}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition shrink-0 sm:py-1.5">
              {t.resetZoom}
            </button>
            {mode === 'manual' && (
              <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0">
                {(['vertical', 'horizontal'] as CutDirection[]).map(dir => (
                  <button key={dir} onClick={() => { setCutDirection(dir); setSnappedCutSize(null) }} title={dir === 'vertical' ? t.vertHint : t.horizHint}
                    className={`px-2.5 py-2 text-sm font-medium transition sm:py-1.5 ${cutDirection === dir ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {dir === 'vertical' ? t.vertical : t.horizontal}
                  </button>
                ))}
              </div>
            )}
            {selectedRect && mode === 'manual' && (
              <span className="px-2.5 py-1.5 rounded-lg text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 min-w-0 max-w-[260px] truncate shrink">
                {t.selected} {formatSize(selectedRect.width, selectedRect.height)} мм{selectedRect.name ? ` — ${selectedRect.name}` : ''}
              </span>
            )}
            {selectedRect && mode === 'manual' && displayCutSize !== null && (
              <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm border font-mono font-bold shrink-0
                ${useManualInput ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                ✂ {displayCutSize} мм {useManualInput ? (lang === 'ru' ? '(ручной)' : '(manual)') : ''}
              </span>
            )}
            {/* Overflow badge in toolbar for auto mode */}
            {mode === 'auto' && hasOverflow && (
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm bg-red-100 border border-red-300 text-red-700 font-semibold animate-pulse shrink-0">
                ⚠ {t.autoNotFit}
              </span>
            )}
          </div>
          {selectedRect && mode === 'manual' && (
            <button onClick={deleteSelected} title={t.deleteHint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white border border-red-300 text-red-500 hover:bg-red-50 shadow-sm transition shrink-0 whitespace-nowrap">
              {t.deleteFragment}
            </button>
          )}
        </div>

        {/* Mobile specification replaces canvas only on small screens */}
        {mobileSpecOpen && (
          <div className="flex-1 overflow-y-auto bg-slate-100 p-3 lg:hidden">
            <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.specification}</div>
                  <h2 className="mt-1 truncate text-lg font-black text-slate-800">{activeSheet?.name ?? t.noSheets}</h2>
                </div>
                {totalArea > 0 && (
                  <div className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold text-indigo-500">{t.efficiencyCurrentSheet}</div>
                    <div className="text-xl font-black" style={{ color: effColor(efficiency) }}>{efficiency}%</div>
                  </div>
                )}
              </div>
              {totalArea > 0 && (
                <div className="mt-3">
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${efficiency}%`, background: effColor(efficiency) }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>{(totalPartArea / 1e6).toFixed(3)} м²</span>
                    <span>{(totalArea / 1e6).toFixed(3)} м²</span>
                  </div>
                </div>
              )}
            </div>

            {mode === 'auto' && hasOverflow && overflowParts.length > 0 && (
              <div className="mb-3 rounded-2xl border-2 border-red-300 bg-red-50 p-3">
                <div className="mb-2 text-sm font-black text-red-700">⚠ {t.notFitPanelTitle}</div>
                <p className="mb-2 text-xs leading-relaxed text-red-600">{t.notFitPanelHint}</p>
                <div className="space-y-2">
                  {overflowParts.map((p, i) => (
                    <div key={i} className="rounded-xl border border-red-200 bg-white px-3 py-2">
                      <div className="font-semibold text-red-800">{p.name || `${t.autoPartName} ${i + 1}`}</div>
                      <div className="text-xs text-red-600">{p.width}×{p.height} мм × {p.qty} {t.partsCount}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {specList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-400">
                  {t.noPartsAssigned}
                </div>
              ) : (
                specList.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-green-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-base font-black text-green-800">{p.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatSize(p.width, p.height)} мм</div>
                      </div>
                      <div className="shrink-0 rounded-xl bg-green-50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-green-500">{t.partsCount}</div>
                        <div className="text-lg font-black text-green-700">× {p.count}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={saveProject} disabled={!sheets.length}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-2 text-xs font-bold text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  {t.saveProject}
                </button>
                <button onClick={loadProject}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700">
                  {t.loadProject}
                </button>
                <button onClick={printProject} disabled={!sheets.length}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  {t.printPdf}
                </button>
              </div>
              <details className="group mt-2 border-t border-slate-100 pt-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-bold text-slate-700">
                  <span>{t.donateTitle ?? 'Поддержать проект'}</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700 group-open:hidden">
                    QR
                  </span>
                  <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 group-open:inline">
                    {lang === 'ru' ? 'Свернуть' : 'Close'}
                  </span>
                </summary>
                <div className="pt-2">
                  <DonateWidget t={t} />
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div ref={canvasContainerRef} className={`${mobileSpecOpen ? 'hidden lg:block' : 'block'} flex-1 relative overflow-hidden`}>
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              rawMouseRef.current = { x: -9999, y: -9999 }
              setSnappedCutSize(null)
              isPanRef.current = false
              drawCanvas()
            }}
            className="absolute inset-0 cursor-crosshair"
            style={{ width: canvasSize.w, height: canvasSize.h }}
          />
          {/* Overflow overlay message */}
          {mode === 'auto' && hasOverflow && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none">
              <span className="text-lg">⚠</span>
              <span>{t.notFitPanelHint}</span>
            </div>
          )}
          <div className="hidden absolute bottom-0 left-0 right-0 gap-2 text-xs text-slate-400 flex-wrap justify-center py-1 px-2 pointer-events-none sm:flex"
            style={{ background: 'linear-gradient(to top, rgba(241,245,249,0.95), transparent)' }}>
            {mode === 'manual' ? <>
              <span>{t.hintClick}</span><span>·</span>
              <span>{t.hintDblClick}</span><span>·</span>
              <span>{t.hintCtrlWheel}</span><span>·</span>
              <span>{t.hintWheel}</span><span>·</span>
              <span>{t.hintTab}</span><span>·</span>
              <span>{t.hintDelete}</span><span>·</span>
              <span>{t.hintAltDrag}</span><span>·</span>
              <span>{t.hintCtrlZ}</span>
            </> : <>
              <span>{t.hintClick}</span><span>·</span>
              <span>{t.hintCtrlWheel}</span><span>·</span>
              <span>{t.hintAltDrag}</span><span>·</span>
              <span>{t.hintCtrlZ}</span>
            </>}
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────────── */}
      <aside className={`${mobileToolsOpen ? 'flex' : 'hidden'} order-2 h-[42dvh] min-h-[260px] w-full min-w-0 max-w-none flex-col overflow-hidden border-t border-slate-200 bg-white shadow-sm shrink-0 lg:order-none lg:flex lg:h-auto lg:w-80 lg:min-w-[320px] lg:max-w-[320px] lg:border-l lg:border-t-0`}>
        {mode === 'auto' && (
          <div className="min-h-0 flex-1">
            <AutoPanel
              t={t}
              lang={lang}
              onResult={handleAutoResult}
              parts={autoParts}
              setParts={setAutoParts}
              sheetConfigs={autoSheets}
              setSheetConfigs={setAutoSheets}
              autoAddMode={autoAddMode}
              setAutoAddMode={setAutoAddMode}
            />
          </div>
        )}

        {mode === 'manual' && (
          <div className="flex-1 overflow-y-auto">

            {/* New sheet */}
            <section className="px-4 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-3">{t.newBlank}</h2>
              <div className="space-y-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{t.sheetNameLabel}</span>
                  <input type="text" value={sheetName} onChange={e => setSheetName(e.target.value)}
                    placeholder={`${t.sheetNamePlaceholder} ${sheets.length + 1}`}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{t.widthLabel}</span>
                  <input type="number" value={inputWidth} onChange={e => setInputWidth(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{t.heightLabel}</span>
                  <input type="number" value={inputHeight} onChange={e => setInputHeight(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{t.kerfLabel}</span>
                  <input type="number" value={kerf} onChange={e => setKerf(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
                <button onClick={createSheet}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition shadow">
                  {t.addSheet}
                </button>
              </div>
            </section>

            {/* Snap step */}
            <section className="px-4 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-xs font-semibold text-slate-600">🧲 {t.cutSnapLabel}</span>
                </div>
                <span className="text-sm font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1">
                  {snapStep || '5'} мм
                </span>
              </div>
              <div className="flex gap-1 flex-wrap mb-2">
                {[1, 2, 5, 10, 25, 50, 100].map(v => (
                  <button key={v} onClick={() => setSnapStep(String(v))}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border transition
                      ${snapStep === String(v)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300'}`}>
                    {v}
                  </button>
                ))}
              </div>
              <input type="number" value={snapStep} onChange={e => setSnapStep(e.target.value)} min="1" placeholder="5"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono" />
            </section>

            {/* Sheets list */}
            {sheets.length > 0 && (
              <section className="px-4 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-2">{t.sheetsCount} ({sheets.length})</h2>
                <div className="space-y-1">
                  {sheets.map(s => {
                    const sp = s.rects.filter(r => r.type === 'part')
                    const eff = sheetEfficiency(s)
                    return (
                      <div key={s.id} onClick={() => switchSheet(s.id)}
                        className={`cursor-pointer rounded-lg px-3 py-2 border transition text-xs
                          ${s.id === activeSheetId ? 'bg-indigo-50 border-indigo-300 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm truncate">{s.name}</span>
                          <span className="font-bold ml-2" style={{ color: effColor(eff) }}>{eff}%</span>
                        </div>
                        <div className="text-slate-400">{s.stockWidth}×{s.stockHeight} мм · {sp.length} {t.partsCount}</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${eff}%`, background: effColor(eff) }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Cut section */}
            {selectedRect && (
              <section className="px-4 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-3">{t.cut}</h2>
                <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-sm mb-3">
                  <button onClick={() => { setUseManualInput(false); setManualCutInput('') }}
                    className={`flex-1 py-1.5 text-xs font-semibold transition
                      ${!useManualInput ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    🖱 {lang === 'ru' ? 'Мышь' : 'Mouse'}
                  </button>
                  <button onClick={() => setUseManualInput(true)}
                    className={`flex-1 py-1.5 text-xs font-semibold transition
                      ${useManualInput ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    ⌨ {lang === 'ru' ? 'Вручную' : 'Manual'}
                  </button>
                </div>
                {!useManualInput && (
                  <div className={`mb-3 rounded-xl border-2 px-3 py-2.5 transition-all ${displayCutSize !== null ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{displayCutSize !== null ? '✂' : '🖱'}</span>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">
                            {displayCutSize !== null ? (cutDirection === 'vertical' ? t.cutSizeLabel : t.cutSizeLabelTop) : t.hoverHint}
                          </div>
                          {displayCutSize !== null && (
                            <div className="text-xs text-slate-400">{t.stepLabel}: {snapStep} мм · 2×{lang === 'ru' ? 'клик' : 'click'} / Enter</div>
                          )}
                        </div>
                      </div>
                      <span className={`text-2xl font-bold font-mono transition-all ${displayCutSize !== null ? 'text-red-600' : 'text-slate-300'}`}>
                        {displayCutSize !== null ? `${displayCutSize}` : '—'}
                        {displayCutSize !== null && <span className="text-base font-normal text-red-400"> мм</span>}
                      </span>
                    </div>
                    {displayCutSize !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-red-500 transition-all"
                            style={{ width: `${Math.min(100, (displayCutSize / (cutDirection === 'vertical' ? selectedRect.width : selectedRect.height)) * 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>0</span>
                          <span>{cutDirection === 'vertical' ? Math.round(selectedRect.width) : Math.round(selectedRect.height)} мм</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {useManualInput && (
                  <div className="mb-3 rounded-xl border-2 border-violet-300 bg-violet-50 px-3 py-2.5">
                    <div className="text-xs text-violet-700 font-semibold mb-2">
                      ⌨ {t.cutManualInputLabel}
                      <span className="ml-1 text-violet-400 font-normal">({cutDirection === 'vertical' ? t.cutSizeLabel : t.cutSizeLabelTop})</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={manualCutInput}
                        onChange={e => setManualCutInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); performCut() } }}
                        placeholder={t.cutSizePlaceholder}
                        min="1"
                        max={cutDirection === 'vertical' ? selectedRect.width - 1 : selectedRect.height - 1}
                        className="flex-1 border-2 border-violet-300 rounded-lg px-3 py-2 text-lg font-bold font-mono text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                        autoFocus
                      />
                      <span className="text-sm text-violet-500 font-semibold shrink-0">мм</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-violet-400 mt-1.5">
                      <span>min: 1</span>
                      <span>max: {cutDirection === 'vertical' ? Math.round(selectedRect.width - Number(kerf) - 1) : Math.round(selectedRect.height - Number(kerf) - 1)} мм</span>
                    </div>
                    {Number(manualCutInput) > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-violet-200 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-violet-500 transition-all"
                            style={{ width: `${Math.min(100, (Number(manualCutInput) / (cutDirection === 'vertical' ? selectedRect.width : selectedRect.height)) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => performCut()}
                  disabled={displayCutSize === null}
                  className={`w-full disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition shadow flex items-center justify-center gap-2
                    ${useManualInput ? 'bg-violet-600 hover:bg-violet-700' : 'bg-red-500 hover:bg-red-600'}`}>
                  {displayCutSize !== null
                    ? `✂ ${t.cutBtn.replace('✂ ', '')} ${displayCutSize} мм`
                    : t.cutBtn}
                </button>
                <div className="text-[10px] text-slate-400 text-center mt-1.5">{t.quickCutHint}</div>
              </section>
            )}

            {/* Part assignment */}
            {selectedRect && (
              <section className="px-4 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-3">
                  {selectedRect.type === 'part' ? t.partLabel : t.scrapLabel}
                </h2>
                {selectedRect.type === 'waste' ? (
                  <>
                    <label className="flex flex-col gap-1 mb-2">
                      <span className="text-xs text-slate-500">{t.partNameLabel}</span>
                      <input type="text" value={partName} onChange={e => setPartName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') assignPart() }}
                        placeholder={t.partNamePlaceholder}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </label>
                    <button onClick={assignPart} disabled={!partName.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition shadow">
                      {t.assignPart}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-semibold text-green-800">{selectedRect.name}</span>
                      <div className="text-xs text-slate-500">{formatSize(selectedRect.width, selectedRect.height)} мм</div>
                    </div>
                    <button onClick={unassignPart}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 text-sm font-medium transition">
                      {t.unassignPart}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Dimensions */}
            {selectedRect && (
              <section className="px-4 py-3">
                <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wide mb-2">{t.dimensions}</h2>
                <div className="flex flex-col gap-2 text-xs">
                  {[
                    { label: t.widthDim, val: Math.round(selectedRect.width) },
                    { label: t.heightDim, val: Math.round(selectedRect.height) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-2">
                      <div className="text-slate-400">{label}</div>
                      <div className="font-semibold">{val} мм</div>
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="text-slate-400">{t.areaDim}</div>
                    <div className="font-semibold">{(selectedRect.width * selectedRect.height / 1e6).toFixed(4)} м²</div>
                  </div>
                </div>
              </section>
            )}

          </div>
        )}

        <details className="group shrink-0 border-t border-slate-200 bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-sm font-bold text-slate-700">
            <span>{t.donateTitle ?? 'Поддержать проект'}</span>
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700 group-open:hidden">
              QR
            </span>
            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 group-open:inline">
              {lang === 'ru' ? 'Свернуть' : 'Close'}
            </span>
          </summary>
          <div className="pb-3">
            <DonateWidget t={t} />
          </div>
        </details>
      </aside>
    </div>
    <SeoContent lang={lang} />
    </>
  )
}
