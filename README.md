# Walid Adra — Portfolio

Personal portfolio website showcasing frontend development work and projects.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- GSAP animations
- Lenis smooth scrolling
- Google Fonts (Syne, Outfit, Space Mono)

## Getting Started

Open `index.html` in a browser or serve with any static file server.

## Security headers

`vercel.json` sets the CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy` and COOP for every path. The CSP allowlists exact CDN paths
(`three@0.160.0`, `lenis@1.3.26`, `gsap/3.12.7`) plus a `sha256-` hash for the inline
import map in `index.html`. When you bump a CDN version or edit the import map, update
`script-src`/`style-src` and regenerate the hash:

```sh
node -e "const h=require('fs').readFileSync('index.html','utf8').replace(/\r\n?/g,'\n');const m=h.match(/<script type=\"importmap\">([\s\S]*?)<\/script>/);console.log('sha256-'+require('crypto').createHash('sha256').update(m[1]).digest('base64'))"
```

Don't add inline `<script>` blocks or `on*=` attributes; put the code in `js/` instead.
Inline styles are allowed (`style-src 'unsafe-inline'`).
