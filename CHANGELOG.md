# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-28

### Added
- Single-file production build via `vite-plugin-singlefile` — the entire app ships as one self-contained `index.html` (~313 KB / ~92 KB gzip).
- Bilingual interface: Russian and English translations of the entire UI.
- Six interface languages total: Russian, English, Spanish, German, French, Chinese.
- Mobile-friendly layout with switchable panels.
- Print and export the cutting map as PDF via the system print dialog.
- Project save/load as JSON.
- Five packing algorithms for automatic layout: MaxRects, Guillotine, Strip, Skyline, and Auto-best.
- Hotkey support for selection, cutting and deletion.

### Changed
- Switched the build pipeline to Vite 7 with the React plugin and Tailwind CSS 4.
- Cleaned up the SEO metadata, donation widget, Yandex.Metrika counter, and site verification files in preparation for the public release.
- Updated vulnerable build dependencies to current versions.

### Notes
- The project history was squashed before the public release; the original development history is preserved in a local backup.
- This is the first public release.
