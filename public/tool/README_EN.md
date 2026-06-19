# Water Footprint Decision Tool — Website Version

This package converts the original single-file HTML application into a deployable static website.

## Structure

- `index.html`: Main application page.
- `assets/css/styles.css`: Extracted CSS styles.
- `assets/js/app.js`: Extracted JavaScript logic, calculations, and embedded datasets.
- `assets/img/`: Extracted icons and embedded images.
- `vercel.json`: Vercel deployment configuration.
- `netlify.toml`: Netlify deployment configuration.
- `site.webmanifest`: Basic PWA manifest.
- `robots.txt` and `sitemap.xml`: Basic SEO files.

## Local preview

Open `index.html` directly, or run:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deployment

The website can be deployed on Vercel, Netlify, GitHub Pages, or any static hosting provider.

Before production, replace `https://example.com` in `sitemap.xml` and `robots.txt` with the real domain.
