# mossball.dev

Company site for Mossball Labs LLC. A single static page built with [Astro](https://astro.build), deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + build to dist/
```

## Add a product

Drop a Markdown file in `src/content/products/`. The frontmatter is validated at build time.

```yaml
---
name: Niwa
tagline: One or two sentences on what it does.
url: https://niwaapp.com        # optional; no url = dashed "coming soon" card
status: waitlist                 # live | waitlist | sprouting
tags: [Offline-first]
icon: 庭                         # optional glyph; defaults to a sprout
tone: peach                      # moss | peach | sky
order: 1                         # lower = earlier
---
```

## Layout

| Path | What |
| --- | --- |
| `src/pages/index.astro` | The home page; composes the sections |
| `src/pages/privacy.astro` | Privacy policy |
| `src/components/` | Nav, Hero, Products, Work, About, Contact, Footer, Logo, Mark |
| `src/scripts/orb.ts` | Hero moss-ball point cloud |
| `src/data/company.ts` | Name, email, location, founder |
| `src/styles/global.css` | Design tokens and shared styles |

Type: Young Serif (logo), Fraunces (headings), Instrument Sans (body).

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. In the repo, **Settings → Pages → Source** must be set to **GitHub Actions**. The custom domain comes from `public/CNAME`.
