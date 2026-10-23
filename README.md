# 记忆随笔 · Memory Journal

**English** · [简体中文](README.zh-CN.md)

A local-first memory journal built with React and Vite. Browse a photo library, open a photo, write a note beside it, pin details, and draw on the image. Demo notes are fictional and the demo photos are placeholders for layout; all copy and pins live in `src/sample-content.js`, so you can replace them as one block.

![Preview](assets/preview.png)

Demo: <https://ryankiinovo.github.io/photo-journal-starter/>

## What is included

- Photo grid with albums, favorites, search, and a date-based recall view
- Photo editor with three layouts, pins, freehand drawing, notes, and tags
- Notes view that collects every photo with writing
- Local-first persistence via `localStorage`
- Eight demo JPG photos, included only to show the layout
- Responsive layout; no backend and no API keys

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
npm run preview
```

Requires Node.js 20 or newer.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── public/photos/       # demo JPG images (replace with your own)
└── src/
    ├── main.jsx         # app and components
    ├── sample-content.js # demo copy (fictional, replace as a block)
    └── styles.css
```

## Make it yours

1. Replace the files in `public/photos/` with your own images. Keep the file names, or update `src` in `src/sample-content.js`.
2. Edit `src/sample-content.js` only: titles, dates, places, albums, notes, tags, and pins all live in that one file. Add or remove entries and the UI adapts.
3. Change the brand name in `Logo` and `index.html`.
4. Adjust colors in `src/styles.css` (`:root` variables).

Demo copy is currently fictional and only there to show the layout. Before publishing real notes, make sure you have the right to share the photos and text. The first load stores the data in `localStorage`; if old copy still shows after you replace it, clear the site storage (or change the `memory-journal-v1` key in `src/main.jsx`).

Uploaded files are previewed with `URL.createObjectURL`; they are not uploaded anywhere and blob URLs do not survive a page reload. For a durable library, connect the `seedPhotos` data source to your own storage layer.

## Deploy

`npm run build` produces a static `dist/`. Because `vite.config.js` sets `base: './'`, the build works from a subpath such as GitHub Pages. Upload `dist/` to any static host.

## Privacy and assets

This starter ships no analytics, cookies, or network calls to an application backend. The demo photos and notes are included only to demonstrate the interface; they are not a personal archive. If you reuse the template, replace `public/photos/` and `src/sample-content.js` with your own content, and check that you have the right to publish every image and every note.

## License

MIT. See `LICENSE`.
