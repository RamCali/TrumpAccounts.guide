import { useState, useMemo, useCallback } from 'react';

interface EmailTemplate {
  id: string;
  label: string;
  description: string;
  subject: string;
  body: (companyName: string, employeeName: string) => string;
}

const templates: EmailTemplate[] = [
  {
    id: 'request',
    label: 'Request to HR',
    description: 'Ask your employer to start offering Trump Account contributions',
    subject: 'New Employee Benefit Opportunity — Trump Account Contributions (IRC §128)',
    body: (company, name) =>
      `Hi HR Team,

I'm writing to bring a new employee benefit opportunity to ${company || '[Company Name]'}'s attention.

Under the One Big Beautiful Bill Act, employers can now contribute up to $2,500 per year per employee to Trump Accounts — completely tax-free under IRC §128. These are tax-advantaged investment accounts for employees' children, similar to how companies offer 401(k) matching or HSA contributions.

Why this matters for ${company || '[Company Name]'}:

- Tax-deductible for the company
- Tax-free for employees (excluded from gross income)
- Powerful recruitment and retention tool
- Shows commitment to employees' families
- Simple payroll integration (similar to HSA contributions)

Several major employers are already rolling this out. I think it would be a meaningful addition to our benefits package and help ${company || '[Company Name]'} stand out in recruiting.

I'd be happy to share more details or connect you with resources. The IRS guidance is in Notice 2025-68, and there's a plain-English employer guide at https://trumpaccounts.guide/for-employers

Best regards,
${name || '[Your Name]'}`,
  },
  {
    id: 'followup',
    label: 'Follow-Up Email',
    description: 'Follow up after your initial request with specific data',
    subject: 'Re: Trump Account Contributions — Quick Data Points',
    body: (company, name) =>
      `Hi HR Team,

Following up on my earlier email about Trump Account employer contributions. Here are a few quick data points that may help the conversation:

The numbers:
- $2,500/yr per employee — fully tax-deductible for ${company || '[Company Name]'}
- Tax-free for employees under IRC §128
- Counts toward the $5,000/yr per-account cap
- Per employee, NOT per dependent child

What employees get:
- Children born 2025–2028 receive a $1,000 federal pilot deposit
- Money is invested in S&P 500 index funds until age 18
- At 18, the account converts to a traditional IRA
- With a $2,500/yr employer contribution at 8% returns, that's ~$87,000+ by age 18

Implementation:
- Similar setup to HSA or 401(k) contributions
- IRS Form 4547 coordinates with employee elections
- Payroll providers are adding support now

Would it be possible to get this on the agenda for the next benefits review? I know several other employees with young children who would value this benefit.

Thanks,
${name || '[Your Name]'}`,
  },
  {
    id: 'group',
    label: 'Rally Coworkers',
    description: 'Message to share with coworkers in Slack or email',
    subject: 'Did you know? Our employer could contribute $2,500/yr to our kids\' Trump Accounts',
    body: (company, name) =>
      `Hey team,

Did you know that under the new law (IRC §128), ${company || 'our employer'} can contribute up to $2,500/year toward each employee's children's Trump Account — completely tax-free to us?

Quick breakdown:
- $2,500/yr from the company = ~$87,000+ by the time your kid turns 18
- It's tax-free to us and tax-deductible for the company
- It's per employee, not per child
- Any child under 18 with an SSN qualifies (no income limits)
- Babies born 2025-2028 also get a free $1,000 federal deposit

Some companies are already doing this. I sent a request to HR — if enough of us express interest, they're more likely to add it.

If you're interested, reply to this thread or send a quick note to HR saying you'd value this benefit.

Calculator showing the impact: https://trumpaccounts.guide/calculators/employer-match
Full employer guide: https://trumpaccounts.guide/for-employers

— ${name || '[Your Name]'}`,
  },
];

export default function HREmailGenerator() {
  const [companyName, setCompanyName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('request');
  const [copied, setCopied] = useState(false);

  const template = useMemo(
    () => templates.find((t) => t.id === activeTemplate)!,
    [activeTemplate]
  );

  const emailBody = useMemo(
    () => template.body(companyName, employeeName),
    [template, companyName, employeeName]
  );

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emailBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [emailBody]);

  const openMailClient = useCallback(() => {
    const subject = encodeURIComponent(template.subject);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }, [template, emailBody]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Customize Your Email</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Your Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Corp"
              maxLength={50}
              className="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Your Name</label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g., Jane Smith"
              maxLength={50}
              className="w-full rounded-lg border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-gold-400/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Template selector */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-white">Choose a Template</h2>
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                activeTemplate === t.id
                  ? 'border-gold-400/50 bg-gold-400/10'
                  : 'border-surface-600 hover:border-gold-400/20 hover:bg-surface-700'
              }`}
            >
              <p className={`font-semibold ${activeTemplate === t.id ? 'text-gold-400' : 'text-white'}`}>
                {t.label}
              </p>
              <p className="mt-0.5 text-sm text-gray-400">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Email preview */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Email Preview</h2>
          <span className="rounded-full border border-surface-600 px-3 py-1 text-xs text-gray-500">
            {template.label}
          </span>
        </div>

        <div className="mb-3 rounded-lg bg-surface-900 px-4 py-2">
          <p className="text-xs text-gray-500">Subject:</p>
          <p className="text-sm font-medium text-white">{template.subject}</p>
        </div>

        <div className="rounded-lg bg-surface-900 px-4 py-3">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
            {emailBody}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={copyEmail}
          className="flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-3 font-semibold text-surface-900 transition-colors hover:bg-gold-400"
        >
          {copied ? (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Email
            </>
          )}
        </button>
        <button
          onClick={openMailClient}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-600 px-5 py-3 font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Open in Mail App
        </button>
        <button
          onClick={() => {
            const text = `Ask your employer about Trump Account matching! They can contribute $2,500/yr tax-free. Generate your HR request: https://trumpaccounts.guide/tools/hr-email`;
            if (navigator.share) {
              navigator.share({ text }).catch(() => {});
            } else {
              navigator.clipboard.writeText(text).then(() => alert('Link copied!'));
            }
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-600 px-5 py-3 font-semibold text-white transition-colors hover:border-gold-400/40 hover:bg-surface-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share with Coworkers
        </button>
      </div>
    </div>
  );
}
