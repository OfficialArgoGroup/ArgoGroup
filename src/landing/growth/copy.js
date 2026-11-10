// Copy for the /growth landing (Meta Ads, cold traffic from Reels).
// Every string is the client's text, verbatim; do not reword, trim or combine
// it. The page: hero + form, what we work on, method, who we are, close.
// Where the layout needed text the brief does not give (form labels, a few
// errors, the sheet's Close), it is grouped under `added` keys so it is easy
// to review before publishing.
//
// Spanish (/growth/es) lives in copy.es.js, key for key; components read the
// page's language through useCopy() at the end of this file.

import { useLang } from '../shared/lang.js'
import * as es from './copy.es.js'

export const WHATSAPP_URL =
  'https://wa.me/34685162838?text=Hi%2C%20I%20saw%20your%20ad%20about%20the%20free%20diagnosis%20call.'
export const PRIVACY_URL = 'https://www.groupargous.com/privacy-policy'
export const TERMS_URL = 'https://www.groupargous.com/terms-of-service'

// The one call to action: form button, phone bar and final CTA.
export const CTA = "Let's work together"
export const WHATSAPP_LINK = 'Prefer WhatsApp? Message us →'

// Variant keys: `${v}${h}`, or just `${v}` where the variant has one headline.
// The inline boot script (boot.js) resolves which one is live before paint.
export const VARIANT_KEYS = ['1a', '1b', '1c', '1d', '2', '3', '4a', '4b']

export const hero = {
  eyebrow: 'ARGO · YOUR GROWTH PARTNER FOR DIGITAL MARKETING',
  // The headline follows the ad; the default (no parameters) is 1b.
  // [variant keys it shows for, text]
  headlines: [
    ['1a', "Your digital marketing, run by one team. Decided before it's built."],
    ['1b', 'One partner for your digital marketing. Not three suppliers and a gap between them.'],
    ['1c', "Find out what's holding your growth back. You'll know in two days."],
    ['1d', 'How long does a straight answer take at your agency?'],
    ['2', 'Your agency runs the campaigns. Who decides where the budget goes?'],
    ['3', 'Before you spend more on marketing, find out what should come first.'],
    ['4a', 'Cheaper leads are easy. Cheaper customers are the job.'],
    ['4b', 'More leads, or leads that actually buy?'],
  ],
  // The same subtitle for every variant.
  subtitle: "Your brand, your ads, your website and your CRM, finally working as one. We're the team behind all of it: strategy, branding and creative, paid media, SEO, content and email. Measured in customers, not leads.",
  // Three differentiators, each with a gold mark: [title, line].
  points: [
    ['Built for you.', 'No packages. No templates.'],
    ['Direct access.', 'Talk to the team. Meet when it matters.'],
    ['Measured in revenue.', 'Customers, not clicks.'],
  ],
  // Not in the brief, pending review: the shorter first screen on phones and
  // tablets in portrait, below 1024px (proposal of 2026-10-19: keep the style,
  // cut the words). Wide screens keep the brief's hero above. On narrow
  // screens the 1b headline keeps its first sentence; its gold sentence and
  // the points move just above the form, and a gold button leads down to it.
  narrow: {
    eyebrow: 'ARGO · YOUR GROWTH PARTNER',
    subtitle: 'Brand, ads, website and CRM run by one team. Measured in customers, not leads.',
    // The one button of the phone hero (2026-10-26).
    button: 'Get my free growth review',
    // The small line under the button, before WhatsApp (2026-10-27).
    note: 'A short discovery call, then a plan built for your business on where to start. Free, no commitment.',
    whatsapp: 'or message us on WhatsApp',
  },
}

// Section 2 · What we work on.
export const work = {
  bridge: 'Growth usually gets lost in the gaps between suppliers. We take care of all of it.',
  title: 'Everything your digital marketing needs. One team.',
  // [area, what it covers]. Lines 1–4 are the client's service descriptions
  // from the first brief (TikTok Ads added at their request); line 5 is the
  // client's own wording, in English.
  items: [
    ['Strategy and direction.', 'Goals, positioning, offer, and which channels deserve the budget this quarter. And what to stop doing.'],
    ['Paid media.', 'Meta, Google, LinkedIn and TikTok Ads, measured on what each customer costs, not each lead.'],
    ['Website and SEO.', 'Websites and landing pages built to convert, and search visibility that brings people in without paying for every click.'],
    ['Brand, content and social.', 'The brand foundations, the creative for your ads, and the content and social media that keep you visible between campaigns.'],
    ['Systems, methodology, CRM and follow-up.', "We create or improve your internal ways of working. Any system or need that's unique to your business, we can build it."],
  ],
}

// Section 3 · Method and approach.
export const method = {
  title: 'Decide first. Then build what the decision needs.',
  intro: 'Most digital marketing is sold as execution: a number of posts, campaigns and reports every month. Results come from direction: someone deciding what matters, in what order.',
  steps: [
    ['Diagnose.', 'Your goals first. Then your offer, your funnel, your tracking, and where the money is actually leaking.'],
    ['Decide.', 'Which channels deserve the budget, whether the problem is the traffic or the page, and what to stop doing.'],
    ['Build.', 'Campaigns, website, content and the systems underneath, in the order the decision calls for.'],
    ['Measure in customers.', 'Every lead tracked to the sale, and the sales fed back into the campaigns.'],
  ],
  proof: {
    title: "Sometimes the answer isn't ads.",
    body: "Requests usually arrive with the solution already chosen: more ads, a new website, an AI assistant. So we ask a lot of questions first. If the problem isn't the ads, we say so.",
  },
  meaningTitle: 'What that means for you.',
  meaning: 'Your agency sees your ads. We see your business.',
}

// Section 4 · Who we are.
export const about = {
  title: 'A growth partner, not an agency.',
  intro: 'ARGO works with companies that want their digital marketing run as one piece, not spread across suppliers. We operate between Barcelona and Miami, with clients across Europe and the US.',
  rows: [
    ['A plan built for you.', 'No packages. Every proposal starts from your goals, your numbers and your market.'],
    ['A direct line.', 'You talk to the people doing the work, on WhatsApp, email or Slack. No account managers, no ticket queues.'],
    ['Straight answers.', "Clear, honest and fast, including when the answer is that something isn't worth doing."],
    ['Nothing hidden.', 'You see every number we see: spend, cost per customer, revenue.'],
  ],
  closing: 'We grow with you. As your business changes, the plan changes with it.',
  cities: 'Barcelona · Miami',
}

// Close.
export const finalCta = {
  title: 'Find out what to fix first.',
  sub: "Tell us about your business. We'll get back to you within 24 hours.",
  button: CTA,
  contactLead: 'Prefer to talk first?',
  whatsapp: 'WhatsApp +34 685 162 838',
  email: 'info@groupargous.com',
  cities: 'Barcelona · Miami',
}

export const form = {
  title: 'Tell us where growth is stuck.',
  sub: "Within two working days you'll know what to fix first, and whether we're the right people for it.",
  // The form's own submit button (2026-10-27); the phone bar and the final
  // section keep CTA.
  button: 'Start my free discovery call',
  // The open question changes with the variant.
  openQuestion: {
    '1a': 'What does your business do, and where has growth stalled?',
    '1b': 'What does your business do, and where has growth stalled?',
    '1c': 'What are you running today?',
    '1d': "What's the question you sent your agency last week?",
    2: 'Where did the budget go last quarter, and who decided?',
    3: 'What are you planning to launch next?',
    '4a': 'What happens to a lead after they fill in a form?',
    '4b': 'What happens to a lead after they fill in a form?',
  },
  placeholder: 'e.g. B2B clinic, Meta Ads €3k/month, leads go to a shared inbox, no CRM.',
  help: {
    email: "Where we'll contact you.",
    website: "Your company's name or its website, whichever is easier.",
  },
  consent: ['I have read the ', 'Privacy Policy', ' and agree to be contacted about my request.'],
  errors: {
    email: "That email doesn't look right.",
  },
  sending: 'Sending…',
  failed: ['Something went wrong. Try again, or ', 'message us on WhatsApp', '.'],
  // Not in the brief: needed UI text, pending review before publishing.
  added: {
    name: 'Name',
    email: 'Email',
    website: 'Company or website',
    whatsapp: 'WhatsApp',
    optional: '(optional)',
    // The link under WhatsApp that shows company and the open question.
    more: '+ Add company and details (optional)',
    phName: 'Your name',
    phEmail: 'you@company.com',
    phWebsite: 'Acme Clinic or acme.com',
    phWhatsapp: '+31 6 1234 5678',
    errName: 'Please add your name.',
    errWhatsapp: 'Please add your WhatsApp number.',
    errConsent: 'Please accept the Privacy Policy to continue.',
    // Optional box under the consent, only shown while cookies are not accepted.
    metaConsent: 'Optional: accept Meta cookies so we can see which ad brought you here. You can change this any time under Cookies.',
  },
}

export const chrome = {
  logo: 'ARGO',
  cities: 'BARCELONA · MIAMI',
  cookie: 'We use the Meta Pixel to measure which ads bring people here. Nothing is set unless you accept.',
  cookiePrivacy: 'Privacy policy',
  accept: 'Accept',
  reject: 'Reject',
  // Outside the EU/EEA, the UK and Switzerland (shared/region.js): the Pixel
  // already runs, so the banner informs and offers to reject.
  cookieInformative: 'We use cookies to measure and improve our ads.',
  ok: 'OK',
  footer: { copyright: '© 2026 Group ARGO', privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookies' },
  whatsappLabel: 'WhatsApp',
  // Not in the brief, pending review: Close for the sheet; the phone-only
  // "See more" under each folded section (GrowthPage.jsx).
  added: { close: 'Close', seeMore: 'See more', seeLess: 'See less' },
}

export const thankYou = {
  // Not in the brief, pending review: the line above the title.
  eyebrow: 'Request received',
  title: "We've got your details.",
  sub: "The person who replies is the person who'll look at your business.",
  stepsTitle: 'What happens now:',
  steps: [
    // Was "your answers and your website": both are optional on the form now.
    'We review what you sent us.',
    'We reply within 24 hours and set up your free discovery call within two working days.',
    'If it makes sense to work together, we design your proposal, with phases and budget.',
  ],
}

// Tab titles are not in the brief (pending review); the descriptions are.
export const meta = {
  landing: {
    title: 'ARGO · Your growth partner for digital marketing',
    description: hero.subtitle,
  },
  thankYou: {
    title: "ARGO · We've got your details",
    description: thankYou.sub,
  },
}

// How many of each title's last words are gold (GrowthPage.jsx).
export const gold = { work: 2, method: 6, about: 3, final: 2 }

// ── Languages ───────────────────────────────────────────────────────────────
const en = { WHATSAPP_URL, PRIVACY_URL, TERMS_URL, CTA, WHATSAPP_LINK, hero, work, method, about, finalCta, form, chrome, thankYou, meta, gold }

export const COPY = { en, es }

/** All of this landing's copy, in the page's language (shared/lang.js). */
export const useCopy = () => COPY[useLang()]
