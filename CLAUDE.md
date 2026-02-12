# TrumpAccounts.guide — Project Instructions

## Mission
Be the #1 plain-English resource for Trump Accounts (IRC §530A). Translate IRS Notice 2025-68 into simple language for exhausted parents, employers, and tax preparers. Provide interactive calculators, comparison tools, and authoritative guides that earn backlinks and rank for every question people ask about Trump Accounts.

## Tech Stack
- **Framework**: Astro 5 (content-first, zero JS by default)
- **Interactive Islands**: React 19 (calculators, comparison tools, forms)
- **Styling**: Tailwind CSS 4
- **Content**: Astro Content Collections (MDX for rich content)
- **Deployment**: Vercel (edge, automatic sitemap, image optimization)
- **Analytics**: Plausible (privacy-first, no cookie banner needed)
- **Ads**: Mediavine (once traffic qualifies) or Raptive

## Project Structure
```
src/
├── components/
│   ├── calculators/          # React island components
│   │   ├── GrowthCalculator.tsx        # "How much at age 18?"
│   │   ├── ComparisonTool.tsx          # Trump Account vs 529 vs Roth IRA
│   │   ├── EligibilityChecker.tsx      # "Does my child qualify?"
│   │   ├── EmployerContributionCalc.tsx # Employer contribution calculator
│   │   └── shared/                     # Shared calculator UI (sliders, charts)
│   ├── ui/                   # Design system components
│   │   ├── Accordion.astro             # FAQ accordions (schema.org)
│   │   ├── CalloutBox.astro            # Tips, warnings, IRS quotes
│   │   ├── ComparisonTable.astro       # Side-by-side comparison tables
│   │   ├── TableOfContents.astro       # Auto-generated TOC
│   │   ├── Breadcrumbs.astro           # Breadcrumb navigation
│   │   ├── AuthorBio.astro             # E-E-A-T author attribution
│   │   └── LastUpdated.astro           # "Last verified: [date]" badge
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Sidebar.astro               # Related articles, CTA
│   │   └── MobileNav.astro
│   └── seo/
│       ├── SchemaOrg.astro             # JSON-LD structured data
│       ├── OpenGraph.astro             # OG + Twitter cards
│       └── Canonical.astro
├── content/
│   ├── guides/               # Long-form pillar content (MDX)
│   ├── faqs/                 # FAQ entries (structured for schema.org)
│   ├── comparisons/          # Comparison articles
│   ├── news/                 # Policy updates, IRS announcements
│   ├── glossary/             # Term definitions (e.g., "Section 530A")
│   ├── employer/             # Employer-focused content hub
│   └── irs-translations/     # "The Translation Layer" — plain-English IRS docs
├── layouts/
│   ├── BaseLayout.astro      # HTML head, global styles, schema
│   ├── GuideLayout.astro     # Article layout with TOC, breadcrumbs
│   ├── CalculatorLayout.astro
│   └── FAQLayout.astro
├── pages/
│   ├── index.astro                     # Homepage
│   ├── what-are-trump-accounts.astro   # Main pillar page
│   ├── how-to-open/                    # Step-by-step guide hub
│   ├── calculators/                    # Calculator hub
│   ├── compare/                        # Comparison hub
│   ├── faq/                            # FAQ hub
│   ├── for-employers/                  # Employer content hub
│   ├── irs-notice-2025-68/             # Translation Layer hub
│   ├── glossary/                       # Glossary hub
│   ├── news/                           # News/updates hub
│   └── about.astro                     # About + E-E-A-T signals
├── lib/
│   ├── calculators/          # Calculator logic (pure functions, no UI)
│   │   ├── growth.ts                   # Compound growth calculations
│   │   ├── comparison.ts               # Account type comparisons
│   │   └── tax.ts                      # Tax impact calculations
│   └── seo/
│       ├── schema.ts                   # JSON-LD generators
│       └── sitemap.ts                  # Dynamic sitemap config
├── styles/
│   └── global.css            # Tailwind base + custom typography
└── data/
    ├── contribution-limits.json        # $5,000 annual, $2,500 employer
    ├── tax-brackets.json               # For tax calculators
    └── sp500-returns.json              # Historical S&P 500 data for projections
```

## Core Facts (Source of Truth)
These are verified facts from IRS Notice 2025-68 and the OBBBA. All content MUST reference these accurately:

- **Legal basis**: IRC Section 530A, created by the One Big Beautiful Bill Act (OBBBA), signed July 4, 2025
- **IRS guidance**: Notice 2025-68 (published December 3, 2025)
- **Election form**: IRS Form 4547 (Trump Account Election(s))
- **Official portal**: trumpaccounts.gov
- **Pilot contribution**: $1,000 one-time federal deposit for U.S. citizen children born Jan 1, 2025 – Dec 31, 2028
- **Annual contribution limit**: $5,000 (after-tax, indexed for inflation after 2027)
- **Employer contribution**: Up to $2,500/year per employee (tax-free under §128, counts toward $5,000 cap). Limit is per employee, NOT per dependent
- **Investment requirement**: Must invest in mutual funds or ETFs tracking S&P 500 or broad U.S. equity index
- **Growth phase**: Birth through age 18 (no withdrawals except rollovers, excess contributions, or death)
- **At age 18**: Converts to a traditional IRA with standard IRA rules
- **Eligibility**: U.S. citizen, valid SSN, under 18 at end of election year. NO income restrictions
- **How to file**: Include Form 4547 with 2025 tax return (due April 15, 2026), or via trumpaccounts.gov portal (mid-2026), or by mail
- **Dell pledge**: Michael & Susan Dell pledged $6.25 billion — $250 per child under 10 in ZIP codes with median income < $150,000
- **Tax treatment**: Earnings taxed as ordinary income on qualified withdrawals (traditional IRA treatment at 18)

## Design Principles

### Performance (Core Web Vitals)
- Target: LCP < 1.5s, FID < 50ms, CLS < 0.05
- Zero JS on content pages (Astro default)
- React islands ONLY for calculators and interactive tools
- Images: WebP/AVIF with explicit width/height, lazy loading below fold
- Fonts: System font stack (no web fonts) or single variable font with `font-display: swap`
- Critical CSS inlined, everything else deferred
- Preconnect to ad network origins

### Content Guidelines
- **Reading level**: 8th grade or below (Flesch-Kincaid). Parents are tired. Use short sentences.
- **Tone**: Authoritative but warm. Like a smart friend who happens to be a CPA.
- **Format**: Every article gets: H1, intro paragraph, table of contents, key takeaways box, FAQ section with schema.org markup
- **IRS Translation Layer**: When quoting IRS language, show the original in a gray callout box, then immediately translate it below in plain English
- **Citations**: Always link to primary sources (IRS.gov, congress.gov, treasury.gov). Never make claims without a source.
- **Freshness**: Every page shows "Last verified: [date]" and "Sources checked: [date]"
- **E-E-A-T**: Author bios on every article. About page with credentials. Link to IRS sources.

### SEO Technical Requirements
- Every page MUST have: unique title tag (< 60 chars), meta description (< 155 chars), canonical URL, Open Graph tags, JSON-LD structured data
- FAQ pages: FAQPage schema
- How-to guides: HowTo schema
- Calculators: WebApplication schema
- Breadcrumbs: BreadcrumbList schema
- Organization schema on homepage
- XML sitemap auto-generated
- robots.txt allowing all crawlers
- Internal linking: every page links to 3-5 related pages minimum

### URL Structure
- Clean, keyword-rich, lowercase, hyphenated
- No date prefixes on evergreen content
- Examples:
  - `/what-are-trump-accounts`
  - `/how-to-open-trump-account`
  - `/calculators/growth-calculator`
  - `/compare/trump-account-vs-529`
  - `/for-employers/contribution-guide`
  - `/irs-notice-2025-68/plain-english-summary`
  - `/faq/eligibility`
  - `/glossary/section-530a`

## Development Rules

### General
- Use Astro components (.astro) for all static content
- Use React (.tsx) ONLY for interactive islands (calculators, tools)
- Use `client:visible` directive for calculator islands (lazy hydration)
- All calculator logic goes in `src/lib/calculators/` as pure TypeScript functions with no UI dependencies
- Content lives in `src/content/` as MDX files with frontmatter
- Never hardcode facts — reference `src/data/` JSON files so updates propagate everywhere
- Every MDX file MUST have frontmatter: title, description, lastVerified, author, sources[]

### Accessibility
- All interactive elements keyboard-navigable
- Calculator inputs have proper labels and ARIA attributes
- Color contrast ratio >= 4.5:1
- Skip-to-content link
- Alt text on all images

### No-Go List
- Do NOT give tax advice or financial advice. Always include disclaimers: "This is educational content, not tax or financial advice. Consult a qualified professional."
- Do NOT store any user data from calculators (all client-side, no tracking)
- Do NOT use affiliate links initially — pure ad revenue model
- Do NOT create content about political opinions on Trump Accounts — stay factual and helpful
- Do NOT speculate on future policy changes — only report confirmed facts
- Do NOT use AI-generated content without human review and fact-checking against IRS sources

## Content Collections Schema (Astro)
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    author: z.string(),
    lastVerified: z.date(),
    sources: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
    })),
    relatedPages: z.array(z.string()).optional(),
    featuredCalculator: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Same pattern for faqs, comparisons, news, glossary, employer, irs-translations
```

## Key Commands
```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Astro type checking
```

## Deployment
- Push to `main` branch triggers Vercel deployment
- Preview deployments on PR branches
- Custom domain: trumpaccounts.guide
- SSL: automatic via Vercel
- Headers: Cache-Control for static assets (1 year), HTML (no-cache for freshness)
