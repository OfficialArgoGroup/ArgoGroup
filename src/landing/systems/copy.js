// Copy for the /systems landing (Meta Ads, cold traffic): custom systems, AI
// and applications. Every string is the client's text, verbatim; do not
// reword, trim or combine it. The page: hero + form, what we build, method,
// who we are, close.
//
// Where the layout needed text the brief does not give (form labels, errors,
// the sheet's Close, the thank-you page), it is grouped under `added` keys or
// marked "not in the brief" so it is easy to review before publishing.

export const WHATSAPP_URL =
  'https://wa.me/34685162838?text=Hi%2C%20I%20saw%20your%20ad%20about%20custom%20systems%20and%20I%27d%20like%20a%20discovery%20call.'
export const PRIVACY_URL = 'https://www.groupargous.com/privacy-policy'
export const TERMS_URL = 'https://www.groupargous.com/terms-of-service'

// The one call to action: form button, phone bar and final CTA.
export const CTA = "Let's work together"
// Not in the brief: the small WhatsApp link under the hero and on the thank-you page.
export const WHATSAPP_LINK = 'Prefer WhatsApp? Message us →'

// Section 1 · Hero.
export const hero = {
  eyebrow: 'ARGO · CUSTOM SYSTEMS, AI AND APPLICATIONS',
  headline: 'Your methodology, built into software. Stronger, faster, and yours.',
  subtitle: "Your company has its own way of working. We build the systems that run on it: internal platforms, custom applications and AI inside your processes, connected to the tools you already use, and built from scratch where the right one doesn't exist.",
  // Three differentiators, each with a gold mark: [title, line].
  points: [
    ['Built around you.', 'Your process is the blueprint.'],
    ['Ready for daily use.', 'Built to run your business every day.'],
    ['Always improving.', 'We track every system and optimize it as your business grows.'],
  ],
  // Not in the brief, pending review: the shorter first screen on phones and
  // tablets (proposal of 2026-10-19: keep the style, cut the words). Wide
  // screens keep the brief's text above. On narrow screens the headline loses
  // its gold sentence, which moves above the form with the points.
  narrow: {
    subtitle: 'Internal platforms, custom apps and AI, built around how your team already works.',
    // The one button of the phone hero (2026-10-27), the small line under it
    // and the WhatsApp link.
    button: 'Get my free systems review',
    note: "A short discovery call, then a plan built for your business on how it's going to work. Free, no commitment.",
    whatsapp: 'or message us on WhatsApp',
  },
}

// Section 2 · What we build.
export const work = {
  bridge: 'Most internal tools are places where information goes to sit. What we build moves.',
  title: 'What we build.',
  // The illustrative interface: "Your company" on top, departments down the
  // side, a CRM pipeline open in Sales. No figures anywhere in it, as the
  // brief asks.
  mock: {
    company: 'Your company',
    menu: ['Operations', 'Sales', 'Clients', 'Finance', 'Management'],
    // Not in the brief: sample CRM content, pending review. No client names:
    // each deal's name is a grey bar.
    active: 'Sales',
    search: 'Search',
    view: 'Pipeline',
    tabs: ['Board', 'List'],
    columns: ['New', 'Qualified', 'Proposal', 'Won'],
    // col: which column; order: when it arrives; live: the deal moving now;
    // bar: how long the grey name bar is.
    deals: [
      { tag: 'Meta Ads', bar: '82%', col: 0, order: 0 },
      { tag: 'Website', bar: '64%', col: 0, order: 4 },
      { tag: 'Referral', bar: '74%', col: 1, order: 1 },
      { tag: 'Call booked', bar: '58%', col: 1, order: 5, live: true },
      { tag: 'Sent', bar: '70%', col: 2, order: 2 },
      { tag: 'Signed', bar: '66%', col: 3, order: 3 },
    ],
    feed: ['Call booked', 'Proposal sent', 'Deal moved to Won'],
  },
  // [title, text]
  items: [
    ['Your own internal platform.', 'Departments, processes and data in one environment, organised the way your company already works.'],
    ['Custom applications.', 'For what no software on the market covers.'],
    ['AI inside your processes.', 'Systems that read, draft, sort and file as part of the work, not as a separate tool.'],
    // The brief's fourth block ends in a cut-off fragment ("nd cash in one
    // view, current without anyone exporting a spreadsheet."). Its start is
    // missing, so it is left out until the full sentence arrives.
    ['Data you can decide with.', 'Live dashboards built on your own systems.'],
  ],
  closing: 'Operations, sales, finance, client service and management. Whichever department needs it first. Connected to your accounting tool.',
}

// Section 3 · Method and approach.
export const method = {
  title: 'We start with how you work. Not with the software.',
  intro: 'Automating a broken process only makes it break faster. So before we build anything, we look at how your company works, and improve it where it needs it.',
  steps: [
    ['Understand.', 'Who does what, where decisions are made, where information gets stuck.'],
    ['Rethink.', 'What should change in the process first. Sometimes the answer is a better method, not more software.'],
    ['Build.', 'One department at a time, connected to your stack. In use early, not at the end of a long project.'],
    ['Evolve.', 'When your company changes, the system changes with it.'],
  ],
  meaningTitle: 'What that means for you.',
  meaning: [
    ['Your methodology is the brief.', "We don't fit your company into a template. The way you work is what we build around, and improve."],
    ['Built on what you have.', "We keep the tools that work and connect them. We only replace what doesn't fit."],
    ['Delivered in stages.', 'You start using it early, one department at a time, and every stage is reviewed with you before the next.'],
    ['AI is how we build, not what we sell.', "It's what makes custom software cost less than the problem it solves."],
  ],
}

// Section 4 · Who we are.
export const about = {
  title: 'A partner that builds with you. Not a vendor that sells you software.',
  intro: 'ARGO designs and builds the systems companies run on, and the digital marketing on top of them. We operate between Barcelona and Miami, with clients across Europe and the US.',
  rows: [
    ['Scoped to your company.', "No packages and no fixed feature lists. Every proposal is written after we've understood how you operate, and priced for what you actually need."],
    ['Close, direct work.', 'You work with the people building your system, on WhatsApp, email or Slack, and meet when a decision needs it, not on a fixed calendar. Building around how a company works only happens when both sides talk directly.'],
    ['Clear communication.', "Plain language, no technical jargon, honest answers, including when something isn't worth building."],
  ],
  closing: 'We grow with you. As your company changes, the system changes with it.',
  cities: 'Barcelona · Miami',
}

// Close.
export const finalCta = {
  title: 'Find out what your company should be running on.',
  sub: 'One call. A straight answer. No obligation.',
  button: CTA,
  contactLead: 'Prefer to talk first?',
  whatsapp: 'WhatsApp +34 685 162 838',
  email: 'info@groupargous.com',
  cities: 'Barcelona · Miami',
}

// The form. The brief gives no form text, so the card carries the closing
// CTA's own lines; the field labels are UI text pending review (`added`).
export const form = {
  title: finalCta.title,
  sub: finalCta.sub,
  // The form's own submit button (2026-10-27); the phone bar and the final
  // section keep CTA.
  button: 'Start my free discovery call',
  consent: ['I have read the ', 'Privacy Policy', ' and agree to be contacted about my request.'],
  sending: 'Sending…',
  failed: ['Something went wrong. Try again, or ', 'message us on WhatsApp', '.'],
  // Not in the brief: needed UI text, pending review before publishing.
  added: {
    name: 'Name',
    email: 'Email',
    website: 'Company or website',
    whatsapp: 'WhatsApp',
    question: 'How does your company work today, and where does it slow down?',
    optional: '(optional)',
    // The link under WhatsApp that shows company and the open question.
    more: '+ Add company and details (optional)',
    phName: 'Your name',
    phEmail: 'you@company.com',
    phWebsite: 'Acme Group or acme.com',
    phWhatsapp: '+34 600 000 000',
    placeholder: 'e.g. 40 people, orders by email, stock in a spreadsheet, invoices in the accounting tool, nobody sees the whole picture.',
    help: {
      email: "Where we'll contact you.",
      website: "Your company's name or its website, whichever is easier.",
    },
    errName: 'Please add your name.',
    errEmail: "That email doesn't look right.",
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
  footer: { copyright: '© 2026 ARGO Group', privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookies' },
  whatsappLabel: 'WhatsApp',
  // Not in the brief, pending review: Close for the sheet; the phone-only
  // "See more" under each folded section (SystemsPage.jsx).
  added: { close: 'Close', seeMore: 'See more', seeLess: 'See less' },
}

// Not in the brief: the page after the form is sent. Reuses the /growth
// thank-you text, minus its marketing-specific block, pending review.
export const thankYou = {
  // Not in the brief, pending review: the line above the title.
  eyebrow: 'Request received',
  title: "We've got your details.",
  sub: "The person who replies is the person who'll look at your business.",
  stepsTitle: 'What happens now:',
  steps: [
    // Was "your answers and your website": both are optional on the form now.
    'We review what you sent us.',
    'We get in touch to set up your free discovery call, within two working days.',
    'If it makes sense to work together, we design your proposal, with phases and budget.',
  ],
}

// Tab titles are not in the brief (pending review); the descriptions are.
export const meta = {
  landing: {
    title: 'ARGO · Custom systems, AI and applications',
    description: hero.subtitle,
  },
  thankYou: {
    title: "ARGO · We've got your details",
    description: thankYou.sub,
  },
}
