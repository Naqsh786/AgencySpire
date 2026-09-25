# AgencySpire

AgencySpire is a premium creative technology agency website — Design, Development, AI & Automation, Marketing, 3D. Built as a modern full-stack app with a React + Vite frontend and Express backend for contact handling.

Live stack highlights:
- **Client**: React 19, Vite 8, Tailwind CSS 4, Framer Motion + GSAP, Lenis smooth scroll, Three.js / OGL webGL, React Hook Form + Zod
- **Server**: Express, Nodemailer, Helmet, CORS, express-rate-limit, honeypot validation
- **Design**: Dark premium UI, glassmorphism navbar, cinematic hero with generative particle nebula, WebGL SushCarousel, marquee bands, micro-interactions

## Features
- Home with Hero, MarqueeBand, SelectedWork (WebGL carousel), Process, WhyUs, WhoWeAre, CTA, StatsRow
- Services: Development, Design, AI & Automation, Marketing, 3D
  - ServiceCategory pages with parallax hero, service grid, highlights
  - ServiceDetail pages with premium layout, features, FAQs
- Contact form with React Hook Form + Zod validation, honeypot, rate limiting, email notification
- Premium email notification (HTML, inline CSS, Gmail-friendly, dynamic data, Reply-To)
- Page transitions, custom cursor, scroll progress, magnetic buttons, preloader
- Responsive mobile-first, reduced-motion support, accessibility basics

## Project Structure
```
Agency Website/
├─ client/                 # React Vite frontend
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ hero/          # Hero with QuantumNebula
│  │  │  ├─ layout/        # Navbar, Footer
│  │  │  ├─ sections/      # SelectedWork, Process, WhyUs, WhoWeAre, CTA, TechMarquee, StatsRow
│  │  │  └─ ui/            # ParticleButton, SushCarousel, MarqueeBand, CustomCursor, Preloader, etc.
│  │  ├─ pages/            # HomePage, ServiceCategory, ServiceDetail, Contact
│  │  ├─ data/             # servicesData, categoryData
│  │  ├─ validation/       # contactSchema (Zod)
│  │  └─ index.css         # Tailwind + design tokens
│  └─ package.json
└─ server/                 # Express API
   ├─ controllers/         # contact.controller
   ├─ middleware/          # validateContact, rateLimiter, honeypot, errorHandler
   ├─ routes/              # contact.routes
   ├─ services/            # email.service with polished HTML template
   ├─ utils/               # sanitize
   ├─ app.js
   └─ server.js
```

## Getting Started

### Prerequisites
Node 20+, npm

### Install
```bash
# frontend
cd client
npm install

# backend
cd ../server
npm install
```

### Environment
Create `server/.env` from `server/.env.example`:
```
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
CONTACT_TO_EMAIL=hello@agencyspire.com
PORT=4000
```

### Run locally
```bash
# terminal 1
cd client
npm run dev        # http://localhost:5173

# terminal 2
cd server
npm run dev        # http://localhost:4000
```
The client proxies API to the server via Vite config.

### Scripts
Client: `dev`, `build`, `preview`, `lint`
Server: `dev`, `start`

## Contact Form & Email
- Frontend validation: `client/src/validation/contact.schema.js` (Zod)
- Server validation: `server/middleware/validateContact.js`
- Email service: `server/services/email.service.js`
- Subject is dynamic: `New AgencySpire Contact Inquiry — {Name}`
- From = AgencySpire <SMTP_USER>, Reply-To = visitor email
- HTML email is inline-CSS, responsive, escapes/sanitizes all user input

## Recent Improvements
- Performance: reduced QuantumNebula particles 55k→15k, DPR caps on Three.js canvases, AgencyCore DPR/particles tuned, SushCarousel DPR capped
- Breadcrumb alignment fix: `min-h-0` on service/category pill links to counter global `a{min-height:44px}`
- Premium HTML contact email redesign

## Tech Stack
Frontend: React 19, Vite 8, Tailwind CSS 4, Framer Motion, GSAP, Lenis, Three.js, OGL, React Hook Form, Zod, Lucide, React Icons
Backend: Express, Nodemailer, Helmet, CORS, express-rate-limit, Zod

## License
Private project. Do not distribute.
