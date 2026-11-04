# Walid Adra — Portfolio

Personal portfolio website showcasing frontend development work and projects.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- GSAP animations, Lenis smooth scrolling, three.js (the hero graph)
- Syne, Outfit and Space Mono, self-hosted

Every file the site runs is served from this repository; nothing loads from a CDN.

- `js/vendor/<name>@<version>/` holds the libraries, byte-for-byte as published
  (three.js from the npm tarball, GSAP from cdnjs, Lenis from unpkg). Each one is pinned
  by an `integrity` hash in the pages (the import map in `index.html` for three.js).
  `.gitattributes` keeps git from changing their line endings, which would break those
  hashes. To upgrade one, add a new versioned folder, update the paths and hashes, and
  delete the old folder.
- `assets/fonts/` holds the woff2 files, and `css/fonts-<page>.css` is each page's copy
  of the Google Fonts stylesheet it used to load: same weights, subsets and
  unicode-ranges, so text renders exactly as it did.
- `js/hero-graph.js` (three.js) is imported by `js/main.js` once the hero text is showing,
  so the 3D library never holds back the first paint.

## Getting Started

Open `index.html` in a browser or serve with any static file server.

## Security headers

`vercel.json` sets the CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy` and COOP for every path. Scripts, styles and fonts may only come
from this site (`'self'`), plus a `sha256-` hash for the inline import map in
`index.html`. When you edit the import map (for example to upgrade three.js), regenerate
the hash from the LF version of the file, which is what Vercel serves:

```sh
node -e "const h=require('fs').readFileSync('index.html','utf8').replace(/\r\n?/g,'\n');const m=h.match(/<script type=\"importmap\">([\s\S]*?)<\/script>/);console.log('sha256-'+require('crypto').createHash('sha256').update(m[1]).digest('base64'))"
```

Don't add inline `<script>` blocks or `on*=` attributes; put the code in `js/` instead.
Inline styles are allowed (`style-src 'unsafe-inline'`).

## Caching

`vercel.json` also sets `Cache-Control`: one year and `immutable` for `js/vendor/` and
`assets/fonts/` (their paths carry a version, so a change is always a new file), one hour
for the site's own `css/` and `js/`, one day for images. HTML keeps Vercel's default
(always revalidated), so a deploy shows at once. A CSS or JS edit can take up to an hour to
reach someone who visited just before it.
