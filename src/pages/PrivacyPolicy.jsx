import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { ChevronLeft } from '../components/icons'

const EMAIL = 'info@groupargous.com'
const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

export default function PrivacyPolicy() {
  const { t } = useLang()

  return (
    <main id="main">
      <div className="container legal-page">
        <Link className="legal-back" to="/">
          <ChevronLeft size={16} /> {t.thankYou.cta}
        </Link>

        {/* Header */}
        <div>
          <h1>Privacy Policy</h1>
          <div className="legal-rule" />
          <p className="legal-updated">Last updated: November 2026</p>
        </div>

        <div>

          {/* 1 */}
          <div>
            <h2>1. Who We Are</h2>
            <p>
              Group ARGO is a growth partner for digital marketing and AI systems, working from Barcelona, Spain, and Miami, Florida, USA. We provide performance marketing, websites, CRM and workflow automation, custom systems and AI-powered services to clients worldwide.
            </p>
            <p>
              Group ARGO is responsible for the personal data described in this policy. For any privacy-related questions or requests, please contact us at: <Mail />
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2>2. Scope of This Policy</h2>
            <p>
              This Privacy Policy applies to visitors of groupargous.com, including our landing pages, and to clients who engage with our services. It explains what personal data we collect, why, on what legal basis, who processes it for us, how long we keep it and what your rights are. We comply with the EU General Data Protection Regulation (GDPR), the Spanish data protection law (LOPDGDD) and, where applicable, US state privacy laws such as the California Consumer Privacy Act (CCPA).
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2>3. Data We Collect</h2>
            <ul>
              <li>
                <span className="legal-term">Contact form:</span> When you fill out the form on our contact page, we collect your name, email address, phone number and company name (if provided), subject and message. We also record the exact consent text you saw beside the checkbox and when you accepted it.
              </li>
              <li>
                <span className="legal-term">Landing page forms:</span> When you fill out the form on one of our landing pages, we collect your name, email address, WhatsApp number, company website and your answer about your business. We also record the exact consent text you saw beside the checkbox and when you accepted it.
              </li>
              <li>
                <span className="legal-term">How you reached us:</span> With any of our forms we also record the page you sent it from, the website that referred you (its domain only), the campaign details in the link (UTM parameters), the click identifiers that Meta and Google add to their ad links (fbclid, gclid), on our landing pages which version of the page you saw and, if the Meta Pixel was active for you, the Meta identifiers described in section 11 (fbc, fbp).
              </li>
              <li>
                <span className="legal-term">Abuse prevention:</span> To limit repeated submissions, we keep a one-way, salted hash of your IP address for up to 2 days. We never store the IP address itself.
              </li>
              <li>
                <span className="legal-term">Cookies:</span> The Meta Pixel and related cookies described in section 11: in the EU/EEA, the UK and Switzerland only if you accept them; elsewhere, on our landing pages, until you reject them.
              </li>
              <li>
                <span className="legal-term">Client service data:</span> As part of delivering our services, including advertising campaigns, CRM integrations and automation workflows, we may process data you share with us about your business, customers and operations.
              </li>
              <li>
                <span className="legal-term">Communication data:</span> When you communicate with us via email, WhatsApp or Slack, we keep those communications for service continuity and support.
              </li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2>4. How We Use Your Data and Why We May</h2>
            <ul>
              <li>
                <span className="legal-term">To answer your request:</span> review your business, contact you and, if it makes sense, prepare a proposal. Legal basis: steps taken at your request before entering into a contract (GDPR Art. 6(1)(b)).
              </li>
              <li>
                <span className="legal-term">To deliver our services:</span> manage client accounts and the contracted work. Legal basis: performance of a contract (Art. 6(1)(b)).
              </li>
              <li>
                <span className="legal-term">To measure our advertising:</span> know which ads bring people to our pages and which of them become clients, through the Meta Pixel and the Meta Conversions API. Legal basis: your consent (Art. 6(1)(a)), which you can withdraw at any time. Outside the EU/EEA, the UK and Switzerland, our landing pages measure by default and you can opt out at any time (section 11).
              </li>
              <li>
                <span className="legal-term">To keep our forms safe:</span> stop spam and repeated submissions. Legal basis: our legitimate interest in protecting our systems (Art. 6(1)(f)).
              </li>
              <li>
                <span className="legal-term">To send you news about our services:</span> only if you have asked for it. Legal basis: your consent (Art. 6(1)(a)).
              </li>
              <li>
                <span className="legal-term">To meet legal obligations:</span> for example, tax and accounting records. Legal basis: legal obligation (Art. 6(1)(c)).
              </li>
            </ul>
            <p>We do not sell your personal data.</p>
          </div>

          {/* 5 */}
          <div>
            <h2>5. Who Processes Your Data for Us</h2>
            <p>
              We use the following service providers. Each processes data on our behalf, under its own data processing terms, and receives only what it needs:
            </p>
            <ul>
              <li><span className="legal-term">Website hosting:</span> Cloudflare, which hosts groupargous.com, runs its domain and passes our forms' submissions to our CRM</li>
              <li><span className="legal-term">Our CRM:</span> our own internal platform, hosted on Vercel, with its database on Supabase. Only the Group ARGO partners can access it</li>
              <li><span className="legal-term">Advertising:</span> Meta (Facebook and Instagram) for the Pixel and the Conversions API: in the EU/EEA, the UK and Switzerland only with your consent, elsewhere on our landing pages until you opt out (section 11); and the ad platforms we run campaigns on (Meta Ads, Google Ads, TikTok Ads and LinkedIn Ads)</li>
              <li><span className="legal-term">Email and communication tools:</span> services we use to talk to you and our clients</li>
              <li><span className="legal-term">Automation and AI tools:</span> platforms such as n8n and Make, and AI services, used to run our workflows and in service delivery</li>
              <li><span className="legal-term">Client CRMs:</span> tools such as HubSpot and Pipedrive, when we work inside a client's own system</li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2>6. AI and Automation Disclosure</h2>
            <p>
              Group ARGO uses artificial intelligence and automated systems as part of our work. This includes AI-powered content generation, help with reviewing and prioritising incoming requests, personalized messaging and workflow automation. Data processed through these systems is handled in accordance with this Privacy Policy and applicable data protection laws.
            </p>
            <p>
              We do not take decisions with legal or similarly significant effects about you by automated means alone. A person at Group ARGO reviews every request before we reply.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2>7. Data Retention</h2>
            <ul>
              <li><span className="legal-term">Requests from our forms:</span> while we are in conversation with you. If we close your request without working together, it is deleted automatically 12 months after we close it.</li>
              <li><span className="legal-term">Clients:</span> for the duration of the engagement and up to 3 years afterwards, or longer where the law requires it (for example, invoices).</li>
              <li><span className="legal-term">IP address hash:</span> up to 2 days.</li>
              <li><span className="legal-term">Cookies:</span> see section 11.</li>
            </ul>
            <p>
              When we delete a record we keep only the date and the reason for the deletion, with no personal data.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2>8. International Data Transfers</h2>
            <p>
              We work from Spain and the USA, and some of our providers are based in the United States. When personal data of EU users is transferred outside the European Economic Area (EEA), we rely on the safeguards each provider offers, such as the EU–US Data Privacy Framework or the European Commission's Standard Contractual Clauses (SCCs).
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2>9. Your Rights (GDPR — EU Users)</h2>
            <p>If you are located in the European Union, you have the following rights under the GDPR:</p>
            <ul>
              <li><span className="legal-term">Right of Access:</span> Request a copy of the personal data we hold about you</li>
              <li><span className="legal-term">Right to Rectification:</span> Request correction of inaccurate or incomplete data</li>
              <li><span className="legal-term">Right to Erasure:</span> Request deletion of your personal data ("right to be forgotten")</li>
              <li><span className="legal-term">Right to Restriction:</span> Request that we limit the processing of your data</li>
              <li><span className="legal-term">Right to Data Portability:</span> Receive your data in a structured, machine-readable format</li>
              <li><span className="legal-term">Right to Object:</span> Object to processing based on legitimate interests or for direct marketing</li>
              <li><span className="legal-term">Right to Withdraw Consent:</span> Withdraw consent at any time where processing is based on consent, without affecting what was done before</li>
            </ul>
            <p>
              To exercise them, write to <Mail />. We will reply within one month. If you are not satisfied with our answer, you can file a complaint with the Spanish Data Protection Agency (Agencia Española de Protección de Datos, <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>) or with the data protection authority of your country.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2>10. Your Rights (US Users)</h2>
            <p>
              Depending on your state of residence, you may have the right to access, correct, or delete the personal information we hold about you, and to opt out of certain processing, including the use of your data for targeted advertising. To make any such request, contact us at <Mail /> and we will respond within 30 days.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2>11. Cookies</h2>
            <p>
              When you first visit, a banner asks whether you accept cookies. On our landing pages, the form also offers an optional box to accept them when you send it. Until you accept, we set no advertising cookies and send nothing to Meta.
            </p>
            <p>
              On our landing pages (/growth and /systems), that applies in the European Union and the European Economic Area, the United Kingdom and Switzerland, and whenever we cannot tell where you are visiting from (the page asks our server for your country, derived from your IP address and not stored). Everywhere else, the Meta Pixel's measurement cookies are on by default: they load when the page opens, the banner tells you so, and you can reject them at any time from that banner (the "Cookies" link at the bottom of the page brings it back). After you reject, nothing more is sent to Meta, on that visit or later ones.
            </p>
            <ul>
              <li><span className="legal-term">Always:</span> your cookie choice, stored in your browser so we do not ask again.</li>
              <li><span className="legal-term">Campaign details of your visit:</span> if the link that brought you carries them, they reach us with a form if you send one. In the EU/EEA, the UK and Switzerland, and whenever we cannot tell where you are visiting from, we store them in your browser only after you accept, and until you close the tab or reject; until then they stay only in the memory of the open page. Elsewhere, we store them in your browser until you close the tab. On the rest of the site, the page only asks our server for your country when your link carries these details and you have not accepted cookies.</li>
              <li><span className="legal-term">Only if you accept (or, outside the EU/EEA, the UK and Switzerland, on our landing pages, until you reject):</span> the Meta Pixel, which sets Meta's cookies (_fbp and _fbc, kept for up to 90 days) and tells Meta which pages you visited and whether you sent a form, so we can measure our ads. With your consent, we may also send the same events to Meta from our servers (Meta Conversions API). When you send one of our forms while the Pixel is active for you, our server tells Meta about it together with the campaign details of your visit and your email address, phone number, name and country, converted into one-way codes (SHA-256 hashes) so Meta can match your request to the ad you saw. These details never reach Meta in readable form.</li>
            </ul>
            <p>
              You can change your choice at any time with the "Cookie Settings" link at the bottom of every page ("Cookies" on our landing pages), or by clearing your browser's data for this site. Every cookie and stored item, with its purpose and duration, is listed in our <Link to="/cookie-policy">Cookie Policy</Link>. Meta's own use of this data is described in <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">Meta's Privacy Policy</a>.
            </p>
          </div>

          {/* 12 */}
          <div>
            <h2>12. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or disclosure: access to our CRM is limited to the Group ARGO partners, and our forms reach it only through an authenticated connection. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* 13 */}
          <div>
            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The "Last updated" date at the top of this page will reflect any revisions. We encourage you to review this page periodically.
            </p>
          </div>

          {/* 14 */}
          <div>
            <h2>14. Contact Us</h2>
            <p>
              To exercise any of your rights, or if you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className="legal-card">
              <p className="legal-term">Group ARGO</p>
              <p>Barcelona, Spain · Miami, Florida, USA</p>
              <p>
                Email: <Mail />
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
