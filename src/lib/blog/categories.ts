/**
 * Blog category definitions for the hub-and-spoke content strategy.
 */

export interface BlogCategory {
  name: string;
  slug: string;
  description: string;
}

export const blogCategories: BlogCategory[] = [
  { name: 'Basics', slug: 'basics', description: 'The essentials every parent needs to know about Trump Accounts.' },
  { name: 'Money & Growth', slug: 'money-and-growth', description: 'Contributions, compounding, and growth projections.' },
  { name: 'Investment Structure', slug: 'investment-structure', description: 'Index funds, fees, and how the market affects your account.' },
  { name: 'Use of Funds', slug: 'use-of-funds', description: 'College, homes, business, trade school, and retirement.' },
  { name: 'Eligibility', slug: 'eligibility', description: 'Edge cases and special situations for qualifying.' },
  { name: 'Control & Access', slug: 'control-and-access', description: 'Who manages the account and when you can access it.' },
  { name: 'Tax Questions', slug: 'tax-questions', description: 'Gains, FAFSA, Medicaid, and withdrawal taxes.' },
  { name: 'Policy & Economics', slug: 'policy-and-economics', description: 'The bigger picture: costs, benefits, and economic impact.' },
  { name: 'Parent Guides', slug: 'parent-guides', description: 'Step-by-step strategies and decision guides for families.' },
  { name: 'Analysis', slug: 'analysis', description: 'Deep dives on wealth, growth projections, and long-term impact.' },
];
