# mehiccdev.com

The website of **mehiccdev**, a web and digital studio from Mostar, Bosnia and Herzegovina. It presents our services, pricing and portfolio, and doubles as a live showcase for the car rental booking system we build for clients.

**Live:** [mehiccdev.com](https://mehiccdev.com)

![mehiccdev.com preview](https://mehiccdev.com/opengraph-image)

## Highlights

- **Bilingual (BS / EN)** with instant client side switching and a remembered preference
- **Interactive product demo** embedded on the homepage, synced with the page through `postMessage` (language, visibility, play state)
- **Portfolio page** with category filters, animated layout transitions and an image lightbox
- **Working contact and inquiry forms** with server side validation (Zod), rate limiting, a honeypot field and email delivery through Resend
- **SEO ready:** per page metadata, Open Graph images generated at build time, JSON LD structured data, sitemap and robots
- **Performance focused:** optimized images with `next/image`, lazy loaded embeds, compositor friendly animations and no layout shift on modal open
- **Responsive and accessible:** mobile first layouts, keyboard friendly menus and reduced motion support

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Validation | Zod |
| Email | Resend |
| Icons | Lucide |
| Hosting | Vercel |

## Project structure

```
app/                  Routes, layouts, API handlers and Open Graph images
  api/                Contact and rent a car inquiry endpoints
  portfolio/          Portfolio page
  maximum/            Maximum Rent a Car case study
  rjesenja/rent-a-car Car rental system landing page
components/
  sections/           Homepage sections (hero, pricing, portfolio, contact...)
  portfolio/          Portfolio and case study pages
  rjesenja/           Car rental landing page sections and copy
  ui/                 Shared UI kit (cards, phone mockup, lightbox, providers)
lib/                  Utilities, i18n, validation schemas, rate limiting
public/               Images, brand assets and the embedded product demo
```

## Getting started

Requirements: Node.js 18.17 or newer.

```bash
npm install
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` file to enable the forms:

```bash
RESEND_API_KEY=your_resend_api_key
UPIT_EMAIL_TO=inbox@example.com
UPIT_EMAIL_FROM="mehiccdev <noreply@example.com>"
```

Without these, the site works normally and the forms show a friendly error instead of sending.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting |

## Deployment

Every push to `main` is deployed automatically to Vercel.

## Author

**Bakir Mehić**, founder of mehiccdev
[mehiccdev.com](https://mehiccdev.com) · [bakir.mehic@mehiccdev.com](mailto:bakir.mehic@mehiccdev.com) · [LinkedIn](https://www.linkedin.com/in/bakir-mehic-qa-engineer/)

## License

© mehiccdev. All rights reserved. The code is public for review and reference.
