import { useEffect, useRef, useState } from 'react'

// Pages of the monthly client report, as the real one is laid out
// (argo-universo/05-clientes/reportes/plantilla/report.html), set here in the
// brand's typefaces: Playfair Display titles and figures, Inter text and labels,
// gold rules (argo.css, .rp). The client is made up and the
// figures are illustrative; everything that moves (numbers counting, bars
// growing, rows arriving) starts when the scene becomes active.

const CLIENT = 'Studio Aurora'
const PERIOD = 'October 2026'

/** Counts from 0 to `value` once `active`, keeping the given decimals. */
function useCountUp(value, active, decimals = 0, duration = 1400) {
  const [shown, setShown] = useState(active ? value : 0)
  const frame = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setShown(value * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    // Off show, it goes back to zero so it can count again next time.
    frame.current = requestAnimationFrame(active ? tick : () => setShown(0))
    return () => cancelAnimationFrame(frame.current)
  }, [value, active, duration])
  return shown.toFixed(decimals)
}

const fmt = (n) => Number(n).toLocaleString('en-US')

function Kpi({ value, decimals = 0, prefix = '', suffix = '', label, detail, delta, up = true, active }) {
  const shown = useCountUp(value, active, decimals)
  return (
    <div>
      <div className="v">{prefix}{decimals ? shown : fmt(shown)}{suffix && <small>{suffix}</small>}</div>
      <div className="k">{label}</div>
      <div className="d">{detail}{delta && <b className={up ? 'up' : 'down'}>{up ? '↑' : '↓'} {delta}</b>}</div>
    </div>
  )
}

function Header({ children }) {
  return (
    <>
      <div className="hdr"><b>ARGO <span>GROUP</span></b><span>{PERIOD} Report</span><span>Barcelona · Miami</span></div>
      {children}
      <div className="ftr"><span>Performance Marketing &amp; AI Automation</span><span className="g">groupargous.com</span></div>
    </>
  )
}

/** Spend by channel: KPIs, the channel table, a week-by-week chart. */
function ChannelsPage({ active }) {
  const weeks = [[640, 310], [720, 290], [810, 330], [690, 350]]
  const max = 1200
  return (
    <Header>
      <div className="sec"><span className="t">Paid media · <i>by channel</i></span></div>
      <div className="kpis tight">
        <Kpi value={3240} prefix="€" label="Ad spend" detail="Meta and Google" active={active} />
        <Kpi value={86} label="Leads" detail="Form and WhatsApp" delta="22% vs Sep" active={active} />
        <Kpi value={37.7} decimals={1} prefix="€" label="Cost per lead" detail="Blended" delta="18% vs Sep" active={active} />
        <Kpi value={31} label="Booked calls" detail="Qualified by the clinic" delta="9 more" active={active} />
      </div>
      <div className="label">Spend and results by channel</div>
      <table>
        <thead><tr><th>Channel</th><th className="r">Spend</th><th className="r">Leads</th><th className="r">CPL</th></tr></thead>
        <tbody>
          <tr style={{ '--i': 0 }}><td>Meta Ads <span className="tag ok">lead gen</span></td><td className="r num">€1,980</td><td className="r num g">54</td><td className="r num">€36.7</td></tr>
          <tr style={{ '--i': 1 }}><td>Google Ads <span className="tag">search</span></td><td className="r num">€1,260</td><td className="r num">32</td><td className="r num">€39.4</td></tr>
          <tr className="total" style={{ '--i': 2 }}><td>Total</td><td className="r num">€3,240</td><td className="r num">86</td><td className="r num">€37.7</td></tr>
        </tbody>
      </table>
      <div className="chart">
        <div className="label">Weekly spend · Meta <i className="sw meta" /> Google <i className="sw google" /></div>
        <div className="bars stacked">
          {weeks.map(([meta, google], i) => (
            <div key={i} style={{ '--i': i }}>
              <span>€{fmt(meta + google)}</span>
              <i className="google" style={{ height: `${(google / max) * 100}%` }} />
              <i className="meta" style={{ height: `${(meta / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="months"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
      </div>
    </Header>
  )
}

/** Ad by ad: what won, what is paused, and the month-on-month read. */
function AdsPage() {
  const ads = [
    ['"Three questions before you book"', 'Objection-led', '31 leads', '€29.8', 'winner', 'ok'],
    ['"Your first visit, explained"', 'Process-led', '14 leads', '€38.1', 'promising', ''],
    ['"Open on Saturdays"', 'Offer-led', '9 leads', '€44.6', 'scaling', ''],
    ['"Meet the team"', 'Trust-led', '3 leads', '€71.0', 'paused', 'warn'],
  ]
  return (
    <Header>
      <div className="sec"><span className="t">Ad <i>by ad</i></span></div>
      <p className="lead">Four ads ran in {PERIOD}. One of them brought more than a third of the month's leads at the lowest cost, so it takes the budget from here.</p>
      <table>
        <thead><tr><th>Ad</th><th className="r">Result</th><th className="r">Cost</th></tr></thead>
        <tbody>
          {ads.map(([title, angle, result, cost, tag, tone], i) => (
            <tr key={title} style={{ '--i': i }}>
              <td>{title}<span className="sub">{angle}</span></td>
              <td className="r"><b>{result}</b><span className={`tag ${tone}`}>{tag}</span></td>
              <td className="r num">{cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Compared to last month</h2>
      <div className="stats">
        <div><div className="v up">−18%</div><div className="k"><b>Cost per lead.</b> From €46 to €37.7, after moving budget to the winner.</div></div>
        <div><div className="v">2.1%</div><div className="k"><b>Click-through rate.</b> Up from 1.6%, the new creatives are stopping the scroll.</div></div>
        <div><div className="v">1.9</div><div className="k"><b>Frequency.</b> Stable: the audience is not seeing the same ad too often yet.</div></div>
        <div><div className="v up">+40%</div><div className="k"><b>Leads.</b> 86 against 61 in September, on 8% more spend.</div></div>
      </div>
      <div className="callout">
        <div className="label">What we'll do</div>
        <p>Two new variants of the winner go live in the first week, the trust-led ad stays paused, and we test a fifth angle on Saturdays only.</p>
      </div>
    </Header>
  )
}

/** The lead funnel: from visit to booked call, with the rates. */
function FunnelPage() {
  const steps = [['Website visits', 4120, ''], ['Started the form', 312, '7.6%'], ['Leads', 86, '27.6%'], ['Qualified', 54, '62.8%'], ['Booked a call', 31, '57.4%']]
  return (
    <Header>
      <div className="sec"><span className="t">Website traffic <i>&amp; leads</i></span></div>
      <p className="lead">Data from GA4 and the CRM, 1–31 October. Every lead is traced from the ad it clicked to whether the clinic booked the call.</p>
      <div className="charts c2">
        <div className="chart">
          <div className="label">Leads from the contact form</div>
          <div className="bars">
            <div style={{ '--i': 0 }}><span>61</span><i style={{ height: '57%' }} /></div>
            <div style={{ '--i': 1 }}><span>86</span><i style={{ height: '80%' }} /></div>
          </div>
          <div className="months"><span>Sep</span><span>Oct</span></div>
          <div className="cap">A third more leads, with the same form.</div>
        </div>
        <div className="chart">
          <div className="label">The lead funnel</div>
          <table style={{ margin: 0 }}>
            <thead><tr><th>Step</th><th className="r">Count</th><th className="r">Rate</th></tr></thead>
            <tbody>
              {steps.map(([step, count, rate], i) => (
                <tr key={step} style={{ '--i': i }}><td>{step}</td><td className="r num">{fmt(count)}</td><td className="r num" style={{ color: 'var(--muted)' }}>{rate || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="funnel" aria-hidden="true">
        {steps.map(([step, count], i) => (
          <div key={step} style={{ '--i': i, width: `${100 - i * 17}%` }}><span>{step}</span><b>{fmt(count)}</b></div>
        ))}
      </div>
      <div className="callout">
        <div className="label">Where the funnel leaks</div>
        <p>Most of the loss is between the visit and the form: 92% leave without starting it. That is the page, not the ads, and it is the next thing we fix.</p>
      </div>
    </Header>
  )
}

/** The month at a glance: one report, every channel. */
function SummaryPage({ active }) {
  return (
    <Header>
      <div className="sec"><span className="t">The month <i>at a glance</i></span></div>
      <p className="lead">Paid media, the website and the Google profile, in one place, with the same numbers the CRM has.</p>
      <div className="label">Paid media · Meta and Google</div>
      <div className="kpis tight">
        <Kpi value={3240} prefix="€" label="Ad spend" detail="Within budget" active={active} />
        <Kpi value={86} label="Leads" detail="Form and WhatsApp" delta="40% vs Sep" active={active} />
        <Kpi value={37.7} decimals={1} prefix="€" label="Cost per lead" detail="Blended" delta="18% vs Sep" active={active} />
        <Kpi value={31} label="Booked calls" detail="36% of leads" delta="9 more" active={active} />
      </div>
      <div className="label">Website, SEO &amp; local search</div>
      <div className="kpis tight">
        <Kpi value={4120} label="Visits" detail="All channels" delta="12% vs Sep" active={active} />
        <Kpi value={1870} label="Google impressions" detail="Search Console" delta="31% vs Sep" active={active} />
        <Kpi value={6.4} decimals={1} label="Avg. position" detail="Top queries" delta="from 9.1" active={active} />
        <Kpi value={142} label="Profile actions" detail="Calls, routes, site" delta="18% vs Sep" active={active} />
      </div>
      <div className="callout">
        <div className="label">The month in one line</div>
        <p>€3,240 brought 86 leads and 31 booked calls; the winner ad and the Saturday slot explain most of the gain, and the form is the next lever.</p>
      </div>
      <p className="note">Platform results are reconciled with the CRM every week: the leads above are the ones that reached the clinic, not the ones Meta and Google report.</p>
    </Header>
  )
}

const PAGES = { channels: ChannelsPage, ads: AdsPage, funnel: FunnelPage, summary: SummaryPage }

export default function ReportScene({ page, active = true }) {
  const Page = PAGES[page] ?? SummaryPage
  const frame = useRef(null)
  const sheet = useRef(null)

  // The page is shown whole: scaled down to fit its frame (never up), and
  // centred in it. Measured again whenever the frame or the page changes size.
  useEffect(() => {
    const fit = () => {
      const box = frame.current
      const page = sheet.current
      const cs = getComputedStyle(box)
      const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      if (!page.offsetHeight || availH <= 0) return
      const scale = Math.min(1, availW / page.offsetWidth, availH / page.offsetHeight)
      page.style.setProperty('--fit', scale.toFixed(4))
      page.style.setProperty('--dy', `${Math.max(0, (availH - page.offsetHeight * scale) / 2).toFixed(1)}px`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame.current)
    observer.observe(sheet.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={active ? 'scene rp is-live' : 'scene rp'} ref={frame} data-client={CLIENT}>
      <div className="rp-page" ref={sheet}><Page active={active} /></div>
    </div>
  )
}
