export type LangCode = 'ru' | 'en'

export interface Translations {
  // Language
  language: string
  // Mode
  modeManual: string
  modeAuto: string
  // Toolbar
  undo: string
  undoHint: string
  clearAll: string
  clearAllHint: string
  resetZoom: string
  resetZoomHint: string
  vertical: string
  horizontal: string
  vertHint: string
  horizHint: string
  selected: string
  deleteFragment: string
  deleteHint: string
  // Sidebar left
  specification: string
  noPartsAssigned: string
  efficiencyCurrentSheet: string
  saveProject: string
  loadProject: string
  printPdf: string
  partsCount: string
  sheetsCount: string
  noSheets: string
  // Canvas
  canvasEmpty: string
  // Hints
  hintClick: string
  hintDblClick: string
  hintCtrlWheel: string
  hintWheel: string
  hintTab: string
  hintDelete: string
  hintAltDrag: string
  hintCtrlZ: string
  hoverHint: string
  // Manual mode - new sheet
  newBlank: string
  sheetNameLabel: string
  sheetNamePlaceholder: string
  widthLabel: string
  heightLabel: string
  kerfLabel: string
  addSheet: string
  // Manual mode - snap
  cutSnapLabel: string
  cutSnapHint: string
  stepLabel: string
  // Manual mode - cut
  cut: string
  cutSizeLabel: string
  cutSizeLabelTop: string
  cutSizePlaceholder: string
  cutBtn: string
  quickCutHint: string
  cutManualInputLabel: string
  // Manual mode - part
  partLabel: string
  scrapLabel: string
  partNameLabel: string
  partNamePlaceholder: string
  assignPart: string
  unassignPart: string
  // Manual mode - dimensions
  dimensions: string
  widthDim: string
  heightDim: string
  areaDim: string
  // Auto mode - sheet configs
  autoAddSheetBtn: string
  autoColSheetName: string
  autoColStockLength: string
  autoColStockWidth: string
  autoColKerf: string
  // Auto mode - parts
  autoTitle: string
  autoClearParts: string
  autoPartName: string
  autoPartWidth: string
  autoPartHeight: string
  autoPartQty: string
  autoRotateHint: string
  autoAddPartBtn: string
  // Auto mode - algo
  autoAlgoPickerLabel: string
  autoAlgoAll: string
  autoAlgorithmMaxRect: string
  autoAlgorithmGuillotine: string
  autoAlgorithmStrip: string
  autoPackingHint: string
  // Auto mode - run
  autoRunBtn: string
  autoRunning: string
  // Auto mode - result
  autoResultTitle: string
  autoStrategyLabel: string
  autoSheetsUsed: string
  autoEffLabel: string
  autoWasteLabel: string
  autoCutsLabel: string
  autoCutsHint: string
  cutsPerSheetLabel: string
  autoNotFit: string
  autoNotFitHint: string
  wideRemnantLabel: string
  // Auto mode - mode switch
  autoAddSheetsMode: string
  autoAddSheetsModeHint: string
  autoMultiSheetMode: string
  autoMultiSheetModeHint: string
  // Not fit info panel
  notFitPanelTitle: string
  notFitPanelHint: string
  // Print
  printTitle: string
  printDate: string
  printSheets: string
  printEff: string
  printCuts: string
  printSheetLabel: string
  printGlobalSpec: string
  printTotalParts: string
  printTotalPartArea: string
  printTotalWasteArea: string
  printPart: string
  printW: string
  printH: string
  printArea1: string
  printQty: string
  printAreaSum: string
  printSaw: string
  printNoPartsRow: string
  // Alerts
  alertLoadError: string
  alertPopupBlocked: string
  // Tooltips for auto panel blocks
  tooltipSheetConfig: string
  tooltipAlgo: string
  tooltipParts: string
  tooltipResult: string
  tooltipSheetsCount: string
  donateTitle: string
  donateSubtitle: string
  donateScanHint: string
}

const ru: Translations = {
  language: 'Язык',
  modeManual: 'Ручной',
  modeAuto: 'Авто',
  undo: '↩ Отмена',
  undoHint: 'Ctrl+Z',
  clearAll: '🗑 Очистить',
  clearAllHint: 'Удалить все листы',
  resetZoom: '⊙ Сброс zoom',
  resetZoomHint: 'Вернуть масштаб 100%',
  vertical: '|',
  horizontal: '-',
  vertHint: 'Вертикальный рез (прокрутка мыши)',
  horizHint: 'Горизонтальный рез (прокрутка мыши)',
  selected: 'Выбран:',
  deleteFragment: '🗑 Удалить',
  deleteHint: 'Удалить фрагмент (Delete)',
  specification: 'Спецификация',
  noPartsAssigned: 'Нет деталей',
  efficiencyCurrentSheet: 'КПД текущего листа',
  saveProject: '💾 Сохранить проект',
  loadProject: '📂 Загрузить проект',
  printPdf: '🖨 Печать / PDF',
  partsCount: 'шт.',
  sheetsCount: 'Листы',
  noSheets: 'Нет листов — создайте заготовку',
  canvasEmpty: 'Выберите лист или создайте новую заготовку',
  hintClick: 'Клик — выбор',
  hintDblClick: 'Двойной клик — рез',
  hintCtrlWheel: 'Ctrl+колесо — зум',
  hintWheel: 'Колесо — направление реза',
  hintTab: 'Tab — следующий',
  hintDelete: 'Del — удалить',
  hintAltDrag: 'Alt+drag — панорама',
  hintCtrlZ: 'Ctrl+Z — отмена',
  hoverHint: 'Наведите мышь на фрагмент',
  newBlank: 'Новая заготовка',
  sheetNameLabel: 'Название листа',
  sheetNamePlaceholder: 'Лист',
  widthLabel: 'Длина (мм)',
  heightLabel: 'Ширина (мм)',
  kerfLabel: 'Пропил (мм)',
  addSheet: '+ Добавить лист',
  cutSnapLabel: 'Шаг привязки',
  cutSnapHint: 'Шаг сетки для привязки реза',
  stepLabel: 'Шаг',
  cut: 'Рез',
  cutSizeLabel: 'Отступ слева',
  cutSizeLabelTop: 'Отступ сверху',
  cutSizePlaceholder: 'Размер реза',
  cutBtn: '✂ Выполнить рез',
  quickCutHint: 'Двойной клик на холсте или Enter',
  cutManualInputLabel: 'Введите размер реза',
  partLabel: 'Деталь',
  scrapLabel: 'Отход / заготовка',
  partNameLabel: 'Название детали',
  partNamePlaceholder: 'Напр. Дверца',
  assignPart: '✅ Назначить деталь',
  unassignPart: '↩ Снять назначение',
  dimensions: 'Размеры',
  widthDim: 'Длина',
  heightDim: 'Ширина',
  areaDim: 'Площадь',
  autoAddSheetBtn: '+ Лист',
  autoColSheetName: 'Название',
  autoColStockLength: 'Длина мм',
  autoColStockWidth: 'Ширина мм',
  autoColKerf: 'Пропил',
  autoTitle: 'Детали',
  autoClearParts: 'Очистить',
  autoPartName: 'Название',
  autoPartWidth: 'Длина',
  autoPartHeight: 'Ширина',
  autoPartQty: 'Кол.',
  autoRotateHint: 'Разрешить поворот на 90°',
  autoAddPartBtn: '+ Добавить деталь',
  autoAlgoPickerLabel: 'Алгоритм',
  autoAlgoAll: '🤖 Авто-лучший',
  autoAlgorithmMaxRect: 'MaxRects',
  autoAlgorithmGuillotine: 'Guillotine',
  autoAlgorithmStrip: 'Strip',
  autoPackingHint: 'Перебирает все алгоритмы и выбирает наилучший результат',
  autoRunBtn: '⚡ Рассчитать раскрой',
  autoRunning: 'Расчёт...',
  autoResultTitle: '📊 Результат раскроя',
  autoStrategyLabel: 'Алгоритм',
  autoSheetsUsed: 'Листов:',
  autoEffLabel: 'КПД:',
  autoWasteLabel: 'Отход',
  autoCutsLabel: 'резов',
  autoCutsHint: 'Примерное количество резов',
  cutsPerSheetLabel: 'Резов по листам',
  autoNotFit: '⚠ Не вошли на листы:',
  autoNotFitHint: 'Эти детали не помещаются на заданные листы',
  wideRemnantLabel: 'Широкий отход',
  autoAddSheetsMode: 'Авто добавление листов',
  autoAddSheetsModeHint: 'Один размер заготовки — листы добавляются автоматически при необходимости',
  autoMultiSheetMode: 'Несколько заготовок',
  autoMultiSheetModeHint: 'Задайте несколько листов разных размеров. Если деталей не хватает места — выводится предупреждение.',
  notFitPanelTitle: '⚠ Детали не вошли',
  notFitPanelHint: 'Не хватает места на листах. Добавьте листы или уменьшите количество деталей.',
  printTitle: 'Карта раскроя',
  printDate: 'Дата:',
  printSheets: 'Листов:',
  printEff: 'КПД:',
  printCuts: 'резов',
  printSheetLabel: 'дет.',
  printGlobalSpec: 'Сводная спецификация',
  printTotalParts: 'Итого деталей:',
  printTotalPartArea: 'Площадь деталей:',
  printTotalWasteArea: 'Площадь отхода:',
  printPart: 'Деталь',
  printW: 'Длина',
  printH: 'Ширина',
  printArea1: 'Пл. м²',
  printQty: 'Кол.',
  printAreaSum: 'Итого м²',
  printSaw: 'Пропил:',
  printNoPartsRow: 'Детали не назначены',
  alertLoadError: 'Ошибка загрузки файла',
  alertPopupBlocked: 'Разрешите всплывающие окна для печати',
  tooltipSheetConfig: 'Задайте размеры заготовки (листа). В режиме авто-добавления — один размер для всех листов. В режиме нескольких заготовок — можно задать разные размеры.',
  tooltipAlgo: 'Алгоритм раскроя. «Авто» перебирает все варианты и выбирает наилучший. Guillotine приоритизирует широкий отход на последнем листе.',
  tooltipParts: 'Список деталей для раскроя. Укажите название, длину, ширину и количество. Значок ↻ разрешает поворот детали на 90° для лучшей укладки.',
  tooltipResult: 'Итоговая статистика раскроя: количество листов, КПД использования материала, площадь деталей и отхода, количество резов.',
  tooltipSheetsCount: 'Количество листов рассчитывается автоматически на основе заданных деталей и размера заготовки.',
  donateTitle: 'Поддержать проект',
  donateSubtitle: 'Угостите кофе ☕',
  donateScanHint: 'Сканируйте QR-код',
}

const en: Translations = {
  language: 'Language',
  modeManual: 'Manual',
  modeAuto: 'Auto',
  undo: '↩ Undo',
  undoHint: 'Ctrl+Z',
  clearAll: '🗑 Clear All',
  clearAllHint: 'Delete all sheets',
  resetZoom: '⊙ Reset Zoom',
  resetZoomHint: 'Reset zoom to 100%',
  vertical: '|',
  horizontal: '-',
  vertHint: 'Vertical cut (mouse scroll)',
  horizHint: 'Horizontal cut (mouse scroll)',
  selected: 'Selected:',
  deleteFragment: '🗑 Delete',
  deleteHint: 'Delete fragment (Delete key)',
  specification: 'Specification',
  noPartsAssigned: 'No parts assigned',
  efficiencyCurrentSheet: 'Current sheet efficiency',
  saveProject: '💾 Save Project',
  loadProject: '📂 Load Project',
  printPdf: '🖨 Print / PDF',
  partsCount: 'pcs.',
  sheetsCount: 'Sheets',
  noSheets: 'No sheets — create a blank',
  canvasEmpty: 'Select a sheet or create a new blank',
  hintClick: 'Click — select',
  hintDblClick: 'Dbl click — cut',
  hintCtrlWheel: 'Ctrl+scroll — zoom',
  hintWheel: 'Scroll — cut direction',
  hintTab: 'Tab — next',
  hintDelete: 'Del — delete',
  hintAltDrag: 'Alt+drag — pan',
  hintCtrlZ: 'Ctrl+Z — undo',
  hoverHint: 'Hover over a fragment',
  newBlank: 'New Blank',
  sheetNameLabel: 'Sheet name',
  sheetNamePlaceholder: 'Sheet',
  widthLabel: 'Length (mm)',
  heightLabel: 'Width (mm)',
  kerfLabel: 'Kerf (mm)',
  addSheet: '+ Add Sheet',
  cutSnapLabel: 'Snap step',
  cutSnapHint: 'Grid step for cut snapping',
  stepLabel: 'Step',
  cut: 'Cut',
  cutSizeLabel: 'Offset from left',
  cutSizeLabelTop: 'Offset from top',
  cutSizePlaceholder: 'Cut size',
  cutBtn: '✂ Perform cut',
  quickCutHint: 'Double click on canvas or Enter',
  cutManualInputLabel: 'Enter cut size',
  partLabel: 'Part',
  scrapLabel: 'Waste / blank',
  partNameLabel: 'Part name',
  partNamePlaceholder: 'e.g. Door panel',
  assignPart: '✅ Assign Part',
  unassignPart: '↩ Unassign',
  dimensions: 'Dimensions',
  widthDim: 'Length',
  heightDim: 'Width',
  areaDim: 'Area',
  autoAddSheetBtn: '+ Sheet',
  autoColSheetName: 'Name',
  autoColStockLength: 'Length mm',
  autoColStockWidth: 'Width mm',
  autoColKerf: 'Kerf',
  autoTitle: 'Parts',
  autoClearParts: 'Clear',
  autoPartName: 'Name',
  autoPartWidth: 'Length',
  autoPartHeight: 'Width',
  autoPartQty: 'Qty',
  autoRotateHint: 'Allow 90° rotation',
  autoAddPartBtn: '+ Add Part',
  autoAlgoPickerLabel: 'Algorithm',
  autoAlgoAll: '🤖 Auto-best',
  autoAlgorithmMaxRect: 'MaxRects',
  autoAlgorithmGuillotine: 'Guillotine',
  autoAlgorithmStrip: 'Strip',
  autoPackingHint: 'Tries all algorithms and picks the best result',
  autoRunBtn: '⚡ Calculate Layout',
  autoRunning: 'Calculating...',
  autoResultTitle: '📊 Layout Result',
  autoStrategyLabel: 'Algorithm',
  autoSheetsUsed: 'Sheets:',
  autoEffLabel: 'Efficiency:',
  autoWasteLabel: 'Waste',
  autoCutsLabel: 'cuts',
  autoCutsHint: 'Approximate number of cuts',
  cutsPerSheetLabel: 'Cuts per sheet',
  autoNotFit: '⚠ Did not fit:',
  autoNotFitHint: 'These parts are too large for any configured sheet',
  wideRemnantLabel: 'Wide remnant',
  autoAddSheetsMode: 'Auto-add sheets',
  autoAddSheetsModeHint: 'Single sheet size — sheets are added automatically as needed',
  autoMultiSheetMode: 'Multiple blanks',
  autoMultiSheetModeHint: 'Set multiple sheets of different sizes. If parts don\'t fit — a warning is shown.',
  notFitPanelTitle: '⚠ Parts did not fit',
  notFitPanelHint: 'Not enough space on sheets. Add more sheets or reduce part count.',
  printTitle: 'Cut Layout',
  printDate: 'Date:',
  printSheets: 'Sheets:',
  printEff: 'Efficiency:',
  printCuts: 'cuts',
  printSheetLabel: 'pcs.',
  printGlobalSpec: 'Global Specification',
  printTotalParts: 'Total parts:',
  printTotalPartArea: 'Parts area:',
  printTotalWasteArea: 'Waste area:',
  printPart: 'Part',
  printW: 'Length',
  printH: 'Width',
  printArea1: 'Area m²',
  printQty: 'Qty',
  printAreaSum: 'Total m²',
  printSaw: 'Kerf:',
  printNoPartsRow: 'No parts assigned',
  alertLoadError: 'Error loading file',
  alertPopupBlocked: 'Allow popups to print',
  tooltipSheetConfig: 'Set blank (sheet) dimensions. In auto-add mode — one size for all sheets. In multi-blank mode — you can specify different sizes.',
  tooltipAlgo: 'Packing algorithm. "Auto" tries all options and picks the best. Guillotine prioritizes wide remnant on the last sheet.',
  tooltipParts: 'List of parts to cut. Enter name, length, width and quantity. The ↻ icon allows 90° rotation for better fitting.',
  tooltipResult: 'Layout statistics: number of sheets, material efficiency, part/waste area, number of cuts.',
  tooltipSheetsCount: 'Sheet count is calculated automatically based on parts and blank size.',
  donateTitle: 'Support the project',
  donateSubtitle: 'Buy me a coffee ☕',
  donateScanHint: 'Scan the QR code',
}

export const translations: Record<LangCode, Translations> = { ru, en }

export interface LangDef {
  code: LangCode
  label: string
  flag: string
}

export const LANGUAGES: LangDef[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function detectBrowserLang(): LangCode {
  if (typeof navigator === 'undefined') return 'ru'
  const lang = navigator.language?.toLowerCase() ?? ''
  if (lang.startsWith('ru')) return 'ru'
  return 'en'
}
