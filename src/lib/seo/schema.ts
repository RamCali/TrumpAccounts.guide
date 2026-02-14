/**
 * JSON-LD structured data generators for SEO.
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TrumpAccounts.guide',
    url: 'https://trumpaccounts.guide',
    description: 'The #1 plain-English resource for Trump Accounts (IRC §530A). Interactive calculators, comparison tools, and authoritative guides.',
    sameAs: [],
  };
}

export function webPageSchema(params: {
  title: string;
  description: string;
  url: string;
  dateModified?: string;
  inLanguage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.title,
    description: params.description,
    url: params.url,
    dateModified: params.dateModified,
    ...(params.inLanguage && { inLanguage: params.inLanguage }),
    publisher: {
      '@type': 'Organization',
      name: 'TrumpAccounts.guide',
      url: 'https://trumpaccounts.guide',
    },
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** Alias for faqPageSchema */
export const faqSchema = faqPageSchema;

export function howToSchema(params: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string }[];
  totalTime?: string;
  supply?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    ...(params.totalTime && { totalTime: params.totalTime }),
    ...(params.supply && { supply: params.supply }),
    step: params.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  };
}

export function webApplicationSchema(params: {
  name: string;
  description: string;
  url: string;
  abstract?: string;
  inLanguage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.abstract && { abstract: params.abstract }),
    ...(params.inLanguage && { inLanguage: params.inLanguage }),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function financialProductSchema(params: {
  name?: string;
  description?: string;
  url?: string;
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    '@id': 'https://trumpaccounts.guide/#product',
    name: params.name ?? 'Trump Account (IRC Section 530A)',
    alternateName: ['Trump Account', 'Section 530A Account', 'OBBBA Child Investment Account'],
    description:
      params.description ??
      'A federally funded, tax-deferred investment account for U.S. citizen children. Created by the One Big Beautiful Bill Act (IRC §530A). Children born 2025–2028 receive a $1,000 federal pilot deposit. Families contribute up to $5,000/year into S&P 500 index funds. Converts to a traditional IRA at age 18.',
    url: params.url ?? 'https://trumpaccounts.guide/what-are-trump-accounts',
    category: 'Tax-Advantaged Investment Account',
    feesAndCommissionsSpecification:
      'After-tax contributions up to $5,000/year. Employer contributions up to $2,500/year (tax-free under IRC §128). Expense ratios capped at 0.1% (10 basis points).',
    annualPercentageRate: {
      '@type': 'QuantitativeValue',
      description: 'Variable — tied to S&P 500 or broad U.S. equity index fund performance.',
    },
    provider: {
      '@type': 'GovernmentOrganization',
      name: 'Internal Revenue Service (IRS)',
      url: 'https://www.irs.gov',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: 'U.S. citizen children under 18 and their parents or guardians',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Legal Basis',
        value: 'IRC Section 530A, One Big Beautiful Bill Act (OBBBA)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Election Form',
        value: 'IRS Form 4547 (Trump Account Election(s))',
      },
      {
        '@type': 'PropertyValue',
        name: 'Federal Pilot Deposit',
        value: '$1,000 for children born January 1, 2025 through December 31, 2028',
      },
      {
        '@type': 'PropertyValue',
        name: 'Annual Contribution Limit',
        value: '$5,000 (indexed for inflation after 2027)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Employer Contribution Limit',
        value: '$2,500/year per employee (tax-free under IRC §128, counts toward $5,000 cap)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Investment Requirement',
        value: 'Mutual funds or ETFs tracking S&P 500 or broad U.S. equity index',
      },
      {
        '@type': 'PropertyValue',
        name: 'Tax Treatment',
        value: 'Tax-deferred growth; withdrawals taxed as ordinary income (traditional IRA rules at age 18)',
      },
      {
        '@type': 'PropertyValue',
        name: 'IRS Guidance',
        value: 'Notice 2025-68 (published December 3, 2025)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Official Portal',
        value: 'trumpaccounts.gov',
      },
    ],
  };
}

export function governmentServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: 'Trump Account Program',
    alternateName: 'Section 530A Pilot Program',
    description:
      'Federal program providing $1,000 pilot deposits and tax-deferred investment accounts for U.S. citizen children under IRC Section 530A. Signed into law July 4, 2025 as part of the One Big Beautiful Bill Act.',
    serviceType: 'Child Investment Account',
    url: 'https://trumpaccounts.gov',
    provider: {
      '@type': 'GovernmentOrganization',
      name: 'Internal Revenue Service (IRS)',
      url: 'https://www.irs.gov',
    },
    serviceArea: {
      '@type': 'Country',
      name: 'United States',
    },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: 'Parents and guardians of U.S. citizen children under 18',
    },
    isRelatedTo: {
      '@type': 'Legislation',
      name: 'One Big Beautiful Bill Act (OBBBA)',
      description: 'Federal legislation signed July 4, 2025, creating IRC Section 530A (Trump Accounts).',
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TrumpAccounts.guide',
    url: 'https://trumpaccounts.guide',
    description:
      'The #1 plain-English resource for Trump Accounts (IRC §530A). Free calculators, IRS Form 4547 walkthrough, and authoritative guides.',
    publisher: {
      '@type': 'Organization',
      name: 'TrumpAccounts.guide',
      url: 'https://trumpaccounts.guide',
    },
  };
}

export function definedTermSetSchema(
  terms: { term: string; definition: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Trump Account Glossary',
    description:
      'Plain-English definitions for every Trump Account term: IRC §530A, Form 4547, pilot program, and more.',
    url: 'https://trumpaccounts.guide/glossary',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition,
      url: t.url,
    })),
  };
}

export function articleSchema(params: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: string;
  articleSection?: string;
  wordCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    ...(params.articleSection && { articleSection: params.articleSection }),
    ...(params.wordCount && { wordCount: params.wordCount }),
    author: {
      '@type': 'Person',
      name: params.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrumpAccounts.guide',
      url: 'https://trumpaccounts.guide',
    },
  };
}
