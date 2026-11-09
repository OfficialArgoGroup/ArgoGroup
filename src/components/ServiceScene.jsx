import ReportScene from './ReportScene'

// The visual beside each section of a service page, one per section:
//   Digital Marketing   pages of the monthly client report (ReportScene)
//   AI Technology       the ARGO platform, from real screenshots, plus the report
//   Creative & Brand    pieces from the portfolio (for now, ARGO's own)
// `active` starts the motion; the sticky panel passes it for the scene on
// show, the inline copy on phones is always active.

/** A screenshot of the platform in a window, panning slowly across it at the given height. */
function PlatformShot({ src, title, focusY = '50%' }) {
  return (
    <figure className="scene shot" style={{ '--fy': focusY }}>
      <div className="shot-bar" aria-hidden="true"><i /><i /><i /><span>{title}</span></div>
      <div className="shot-view"><img src={src} alt="" loading="lazy" /></div>
    </figure>
  )
}

const IMG = (name) => `/portfolio/${name}.jpg`

/** Columns of pieces drifting at their own pace; each is doubled so the loop never shows a seam. */
function Drift({ columns, tall = false }) {
  return (
    <div className={tall ? 'scene pf pf-tall' : 'scene pf'}>
      {columns.map((names, index) => (
        <div className="pf-col" key={index} style={{ '--t': `${26 + index * 7}s`, '--dir': index % 2 ? -1 : 1 }}>
          {[...names, ...names].map((name, i) => <img src={IMG(name)} alt="" loading="lazy" key={i} />)}
        </div>
      ))}
    </div>
  )
}

/** Three vertical ads fanned out, breathing. */
function Fan({ names }) {
  return (
    <div className="scene pf pf-fan">
      {names.map((name, i) => <img src={IMG(name)} alt="" loading="lazy" key={name} style={{ '--i': i }} />)}
    </div>
  )
}

export default function ServiceScene({ service, section, active = true }) {
  if (service === 0) {
    return <ReportScene page={['channels', 'ads', 'funnel'][section]} active={active} />
  }
  if (service === 1) {
    switch (section) {
      case 0: return <PlatformShot src="/platform/marca.jpg" title="ARGO Platform · Content system" focusY="45%" />
      case 1: return <PlatformShot src="/platform/crm.jpg" title="ARGO Platform · CRM" focusY="30%" />
      case 2: return <PlatformShot src="/platform/outreach.jpg" title="ARGO Platform · Pipeline" focusY="65%" />
      default: return <ReportScene page="summary" active={active} />
    }
  }
  switch (section) {
    case 0: return <Drift columns={[['identity-01', 'identity-03'], ['identity-02', 'identity-04']]} />
    case 1: return <Fan names={['ads-01', 'ads-02', 'ads-04']} />
    case 2: return <Drift columns={[['social-01', 'social-04'], ['social-02', 'social-05'], ['social-03', 'identity-02']]} />
    default: return <Drift columns={[['ads-03', 'social-03', 'identity-04'], ['social-05', 'ads-02', 'identity-01'], ['identity-03', 'social-01', 'ads-04']]} />
  }
}
