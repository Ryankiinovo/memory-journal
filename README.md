# 记忆随笔 · Memory Journal

A local-first photo journal: photos are organized by city, each story is read as a sequence of pages, and everything runs as plain static files — no build step, no backend, no uploads.

[中文说明](./README.zh-CN.md)

## What it is

- **City first.** A library of cities; each city holds one or more stories.
- **Story pages.** A story is a sequence of pages you can read, edit and play as a slideshow.
- **Eight layouts.** Full-bleed cover, image + text, text-only, two images, and more.
- **Static only.** Three files and a folder of photos. Open it with any static server.

## Quick start

```bash
cd memory-journal
python3 -m http.server 8080
# open http://127.0.0.1:8080
```

No `npm install`, no build. Editing works in memory for the preview; refresh resets it.

## Make it yours

1. Replace the photos in `assets/photos/` (JPG, recommended max edge 1600 px).
2. Edit `content.js` — the whole site reads from this one file:

```js
window.MEMORY_JOURNAL = {
  site: { brand, city, season, storyTitle, storySummary, chapters, ... },
  photos: [ ['assets/photos/memory-01.jpg', 1600, 893, 'alt text'], ... ],
  pages:  [ { title, essay, date, time, place, layout, photos: [0, 1], note }, ... ]
};
```

`layout` is 1–8 (see `layoutNames` in `app.js`); `photos` holds indexes into the `photos` array.

## Structure

```text
index.html      markup for all screens
app.js          state, reading/editing/slideshow, search
styles.css      design tokens and responsive rules
content.js      the only file you need to edit for content
assets/photos/  sample photos
```

## Deploy to GitHub Pages

Push to `main`; `.github/workflows/deploy.yml` publishes the repository root as-is (no build). Enable **Settings → Pages → Source: GitHub Actions** once.

## Privacy and sample content

The sample photos are the author's own photographs, included with permission to demonstrate layout and image sizing. The written copy is illustrative placeholder text. Nothing is uploaded anywhere; editing happens in memory. Replace both with your own content before publishing a real journal.

## License

MIT — see [LICENSE](./LICENSE).