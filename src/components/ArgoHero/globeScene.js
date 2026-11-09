// GlobeScene — the canvas engine behind the hero.
//
// Why a plain class and not React state: the globe redraws ~60 times a second.
// Pushing that through React (setState → re-render) would re-render the whole
// hero every frame. Instead React renders the markup once, hands this class the
// DOM nodes it needs, and the class paints the canvas and writes a few inline
// styles (opacity / transform) directly. React never re-renders during scroll.
import { LAND_MASK, MASK_LAT0, MASK_STEP } from "./landMask.js";

const D2R = Math.PI / 180;
const GOLD = "212,175,55";
const CREAM = "242,237,228";

// Colours only; geometry and choreography are the same in both themes.
// ink: the original black hero. cream: ARGO cream (#F2EDE4) with the deeper gold
// the cream site uses for anything gold (#A8842A), so the dots still read.
// "fade" is where the bottom gradient lands: the next section's background.
const PALETTES = {
  ink: {
    gold: GOLD,
    ocean: CREAM,
    body: "rgba(19,19,19,0.96)",
    pulse: "rgba(255,236,170,0.95)",
    cityCore: "#FFF1BF",
    veil: "13,13,13", // dims the globe behind the headline, and the dive vignette
    fade: "13,13,13",
  },
  cream: {
    gold: "168,132,42",
    ocean: "23,21,16",
    body: "rgba(233,226,212,0.96)",
    pulse: "rgba(124,96,24,0.95)",
    cityCore: "#171510",
    veil: "242,237,228",
    fade: "251,249,245",
  },
};

// Camera: resting tilt, and where the dive lands (Iberia / western Europe, so the
// Miami → Barcelona arc arrives from the left of the frame).
const TILT_REST = 16 * D2R;
const TILT_DIVE = 37 * D2R;
const DIVE_THETA = 14 * D2R;

export const CITIES = [
  { name: "Barcelona", lat: 41.39, lon: 2.17, main: true },
  { name: "Miami", lat: 25.76, lon: -80.19, main: true },
  { name: "Madrid", lat: 40.42, lon: -3.7 },
  { name: "Lisbon", lat: 38.72, lon: -9.14 },
  { name: "Paris", lat: 48.86, lon: 2.35 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Berlin", lat: 52.52, lon: 13.4 },
  { name: "Milan", lat: 45.46, lon: 9.19 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Chicago", lat: 41.88, lon: -87.63 },
  { name: "Austin", lat: 30.27, lon: -97.74 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const wrapPi = (a) => {
  a = (a + Math.PI) % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a - Math.PI;
};

// ---- static geometry, built once per page load -----------------------------
let LAND = null;
let OCEAN = null;
function buildPoints() {
  if (LAND) return;
  LAND = [];
  OCEAN = [];
  LAND_MASK.split("|").forEach((row, i) => {
    const sep = row.indexOf(",");
    const n = parseInt(row.slice(0, sep), 10);
    const bin = atob(row.slice(sep + 1));
    const lat = (MASK_LAT0 + i * MASK_STEP) * D2R;
    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    for (let j = 0; j < n; j++) {
      const land = (bin.charCodeAt(j >> 3) >> (j & 7)) & 1;
      const lon = (-180 + ((j + 0.5) * 360) / n) * D2R;
      // sin/cos of longitude precomputed: per frame the rotation is multiply-add only
      const p = { cl, sl, so: Math.sin(lon), co: Math.cos(lon), coarse: i % 2 === 0 && j % 2 === 0 };
      if (land) LAND.push(p);
      else if (i % 2 === 0 && j % 2 === 0) {
        p.sparse = i % 4 === 0 && j % 4 === 0;
        OCEAN.push(p);
      }
    }
  });
}

function vec(latDeg, lonDeg) {
  const la = latDeg * D2R;
  const lo = lonDeg * D2R;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}
// Great-circle arc between two cities, lifted off the surface in the middle.
function buildArc(a, b, steps) {
  const A = vec(a.lat, a.lon);
  const B = vec(b.lat, b.lon);
  const dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
  const w = Math.acos(Math.max(-1, Math.min(1, dot)));
  const sw = Math.sin(w);
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const k1 = Math.sin((1 - t) * w) / sw;
    const k2 = Math.sin(t * w) / sw;
    const lift = 1 + 0.22 * Math.sin(Math.PI * t);
    out.push([(k1 * A[0] + k2 * B[0]) * lift, (k1 * A[1] + k2 * B[1]) * lift, (k1 * A[2] + k2 * B[2]) * lift]);
  }
  return out;
}
const ARC = buildArc(CITIES[0], CITIES[1], 96);

// ---- the scene --------------------------------------------------------------
export class GlobeScene {
  /**
   * @param {object} els  DOM nodes: canvas, hero, track, content, nav, foot, logo, cards[]
   * @param {object} opts rotationSpeed (°/s), showCards, cards: [{city, side, hang}], theme ("ink" | "cream")
   */
  constructor(els, opts) {
    buildPoints();
    this.els = els;
    this.opts = opts;
    this.pal = PALETTES[opts.theme] || PALETTES.ink;
    this.auto = 38 * D2R; // free-running rotation angle
    this.p = 0; // raw scroll progress through the pinned track (0..1)
    this.sp = 0; // smoothed progress the camera follows
    this.clock = 0;
    this.last = 0;
    this.mouse = { x: 0, y: 0, rx: 0, ry: 0 };
    this.visible = true;
    this.rm = false;
    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.paths = [];
  }

  start() {
    const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    this.rm = !!(mq && mq.matches);
    if (mq && mq.addEventListener) {
      this.onMq = (e) => {
        this.rm = e.matches;
        this.needsDraw = true;
      };
      mq.addEventListener("change", this.onMq);
      this.mq = mq;
    }
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(this.els.hero);
    // pause all work while the hero is off screen
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && !this.raf) {
        this.last = 0;
        this.raf = requestAnimationFrame(this.loop);
      }
    });
    this.io.observe(this.els.track);
    this.els.hero.addEventListener("pointermove", this.onPointer, { passive: true });
    this.resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.resize); // re-measure the headline once fonts land
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro && this.ro.disconnect();
    this.io && this.io.disconnect();
    this.mq && this.mq.removeEventListener("change", this.onMq);
    this.els.hero.removeEventListener("pointermove", this.onPointer);
  }

  resize() {
    const { hero, canvas } = this.els;
    const W = hero.clientWidth;
    const H = hero.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    this.dims = { W, H, dpr };
    // the data cards park in the side gutters, so measure the widest headline line
    const title = hero.querySelector(".ah-title");
    if (title) {
      const rg = document.createRange();
      rg.selectNodeContents(title);
      this.textHalf = Math.max(288, rg.getBoundingClientRect().width / 2);
    }
    this.needsDraw = true;
  }

  onPointer(e) {
    const rc = this.els.hero.getBoundingClientRect();
    this.mouse.x = (e.clientX - rc.left) / rc.width - 0.5;
    this.mouse.y = (e.clientY - rc.top) / rc.height - 0.5;
  }

  // How far through the pinned track the page has scrolled (0 at the top, 1 when the hero releases).
  readProgress() {
    const r = this.els.track.getBoundingClientRect();
    const run = r.height - window.innerHeight;
    return run > 0 ? clamp01(-r.top / run) : 0;
  }

  loop(ts) {
    if (!this.visible) {
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (ts - (this.last || ts)) / 1000);
    this.last = ts;
    if (!this.dims) return;

    if (this.rm) {
      // reduced motion: static globe, no scroll choreography
      if (!this.needsDraw) return;
      this.needsDraw = false;
      this.sp = 0;
      this.applyScroll();
      this.draw();
      return;
    }

    this.p = this.readProgress();
    // the camera eases toward the scroll position (exponential smoothing): cinematic, never twitchy
    this.sp += (this.p - this.sp) * (1 - Math.exp(-dt * 7));
    if (Math.abs(this.p - this.sp) < 0.0004) this.sp = this.p;
    const dive = smooth(0.1, 0.75, this.sp);
    this.auto -= (this.opts.rotationSpeed ?? 6) * D2R * dt * (1 - dive * 0.6);
    this.clock += dt;

    // logo leans toward the pointer, eased
    const m = this.mouse;
    m.rx += (-m.y * 14 - m.rx) * 0.08;
    m.ry += (m.x * 18 - m.ry) * 0.08;
    if (this.els.logo) this.els.logo.style.transform = `rotateX(${m.rx.toFixed(2)}deg) rotateY(${m.ry.toFixed(2)}deg)`;

    this.applyScroll();
    this.draw();
  }

  // Text, footer and nav fade on scroll — written as inline styles, no React re-render.
  applyScroll() {
    const p = this.sp;
    const out = smooth(0, 0.3, p);
    const { content, foot, nav } = this.els;
    if (content) {
      content.style.opacity = (1 - out).toFixed(3);
      content.style.transform = `translateY(${(-p * 140).toFixed(1)}px) scale(${(1 - out * 0.04).toFixed(4)})`;
      content.style.visibility = out > 0.99 ? "hidden" : "visible";
    }
    if (foot) foot.style.opacity = (1 - out).toFixed(3);
    if (nav) nav.style.opacity = (1 - smooth(0.6, 0.9, p)).toFixed(3);
  }

  draw() {
    const { canvas } = this.els;
    const { W, H, dpr } = this.dims;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const mobile = W < 720;
    const p = this.sp;
    // three beats: lift (globe rises to centre), dive (camera flies in), settle (field calms for the next section)
    const lift = smooth(0, 0.35, p);
    const dive = smooth(0.1, 0.75, p);
    const settle = smooth(0.78, 1, p);

    const R0 = mobile ? W * 0.52 : Math.min(W * 0.33, H * 0.44);
    const cy0 = mobile ? H * 0.5 : H * 0.62;
    const R = R0 * (1 + dive * (mobile ? 2.4 : 1.8));
    const cx = W / 2;
    const cy = cy0 + (H * 0.5 - cy0) * lift + R * 0.06 * dive;

    // rotation blends from free spin to the dive target, which keeps drifting with scroll
    const target = DIVE_THETA - (p - 0.4) * 34 * D2R + Math.sin(this.clock * 0.18) * 5 * D2R;
    const th = this.auto + wrapPi(target - this.auto) * dive;
    const tilt = TILT_REST + (TILT_DIVE - TILT_REST) * dive;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const sth = Math.sin(th);
    const cth = Math.cos(th);
    const globeA = 1 - settle * 0.72;
    const { gold: GOLD, ocean: OCEAN_INK, body, pulse, cityCore, veil, fade } = this.pal;

    // soft gold halo
    let g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.5);
    g.addColorStop(0, `rgba(${GOLD},${(0.14 * (1 - dive * 0.6)).toFixed(3)})`);
    g.addColorStop(0.55, `rgba(${GOLD},0.035)`);
    g.addColorStop(1, `rgba(${GOLD},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // sphere body + rim light
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    g = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
    g.addColorStop(0, `rgba(${GOLD},0)`);
    g.addColorStop(1, `rgba(${GOLD},${(0.12 * globeA).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fill();

    // level of detail: thin the grid only when dots would crowd (small globes, phones)
    const spacingPx = R * MASK_STEP * D2R;
    const coarseOnly = spacingPx < 3.6;
    // dot size stays in screen pixels, so zooming reveals detail instead of inflating blobs
    const dotK = Math.min(1.55, Math.max(0.8, spacingPx / 6.5)) * (coarseOnly ? 1.15 : 1);
    const pad = 4;

    // ocean: faint cream texture (denser during the close-up)
    const denseOcean = dive > 0.35;
    ctx.beginPath();
    for (let i = 0; i < OCEAN.length; i++) {
      const q = OCEAN[i];
      if (!q.sparse && !denseOcean) continue;
      const sa = q.so * cth + q.co * sth;
      const ca = q.co * cth - q.so * sth;
      const z = q.cl * ca;
      if (q.sl * st + z * ct <= 0.05) continue; // back of the sphere
      const sx = cx + R * q.cl * sa;
      const sy = cy - R * (q.sl * ct - z * st);
      if (sx < -pad || sx > W + pad || sy < -pad || sy > H + pad) continue; // off screen
      const r = 0.6 * dotK;
      ctx.moveTo(sx + r, sy);
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = `rgba(${OCEAN_INK},${(0.075 * globeA).toFixed(3)})`;
    ctx.fill();

    // land: gold dots, bucketed by depth (one fill per bucket) so the limb falls off
    const NB = 7;
    for (let b = 0; b < NB; b++) this.paths[b] = new Path2D();
    for (let i = 0; i < LAND.length; i++) {
      const q = LAND[i];
      if (coarseOnly && !q.coarse) continue;
      const sa = q.so * cth + q.co * sth;
      const ca = q.co * cth - q.so * sth;
      const z = q.cl * ca;
      const z2 = q.sl * st + z * ct;
      if (z2 <= 0) continue;
      const sx = cx + R * q.cl * sa;
      const sy = cy - R * (q.sl * ct - z * st);
      if (sx < -pad || sx > W + pad || sy < -pad || sy > H + pad) continue;
      const b = Math.min(NB - 1, (z2 * NB) | 0);
      const r = (0.62 + 0.38 * ((b + 0.5) / NB)) * 1.25 * dotK;
      this.paths[b].moveTo(sx + r, sy);
      this.paths[b].arc(sx, sy, r, 0, Math.PI * 2);
    }
    for (let b = 0; b < NB; b++) {
      const z = (b + 0.5) / NB;
      ctx.fillStyle = `rgba(${GOLD},${((0.16 + 0.84 * z) * globeA).toFixed(3)})`;
      ctx.fill(this.paths[b]);
    }

    // Miami — Barcelona arc, with a travelling pulse; it grows into the lead line of the dive
    const pts = ARC.map((v) => {
      const x = v[0] * cth + v[2] * sth;
      const z = -v[0] * sth + v[2] * cth;
      const y = v[1];
      return [cx + R * x, cy - R * (y * ct - z * st), y * st + z * ct];
    });
    let len = 0;
    let started = false;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const s = pts[i];
      if (s[2] < -0.06) continue;
      if (!started) {
        ctx.moveTo(s[0], s[1]);
        started = true;
      } else {
        const q = pts[i - 1];
        len += Math.hypot(s[0] - q[0], s[1] - q[1]);
        ctx.lineTo(s[0], s[1]);
      }
    }
    if (started && len > 0) {
      const lw = 1 + dive * 1.4;
      ctx.lineCap = "round";
      ctx.lineWidth = lw * 0.8;
      ctx.strokeStyle = `rgba(${GOLD},${(0.3 + 0.25 * dive).toFixed(3)})`;
      ctx.stroke();
      const run = (this.clock * 0.24) % 1;
      ctx.setLineDash([len * 0.2, len * 1.2]);
      ctx.lineDashOffset = -run * len * 1.4;
      ctx.lineWidth = lw * 1.6;
      ctx.shadowColor = `rgba(${GOLD},0.9)`;
      ctx.shadowBlur = 10 + dive * 10;
      ctx.strokeStyle = pulse;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }

    // city markers
    const anchors = {};
    for (const c of CITIES) {
      const la = c.lat * D2R;
      const lo = c.lon * D2R;
      const so = Math.sin(lo);
      const co = Math.cos(lo);
      const cl = Math.cos(la);
      const sl = Math.sin(la);
      const sa = so * cth + co * sth;
      const z = cl * (co * cth - so * sth);
      const s = [cx + R * cl * sa, cy - R * (sl * ct - z * st), sl * st + z * ct];
      anchors[c.name] = s;
      if (s[2] <= 0.02) continue;
      if (s[0] < -60 || s[0] > W + 60 || s[1] < -60 || s[1] > H + 60) continue;
      const k = c.main ? 1 : 0.55;
      const rr = Math.max(2.2, Math.min(7, R0 * 0.012 * (1 + dive * 0.8))) * k;
      g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], rr * 5);
      g.addColorStop(0, `rgba(${GOLD},${(0.5 * k).toFixed(2)})`);
      g.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s[0], s[1], rr * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.main ? cityCore : `rgba(${GOLD},0.95)`;
      ctx.beginPath();
      ctx.arc(s[0], s[1], rr, 0, Math.PI * 2);
      ctx.fill();
      if (c.main) {
        const ph = (this.clock % 2.4) / 2.4;
        ctx.strokeStyle = `rgba(${GOLD},${(0.7 * (1 - ph)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s[0], s[1], rr + ph * rr * 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // data cards: parked in the side gutters, level with their city, joined by a fine leader line
    const show = this.opts.showCards !== false && !mobile;
    const cardFade = 1 - smooth(0, 0.18, p);
    const half = this.textHalf || 480;
    const defs = this.opts.cards || [];
    for (let i = 0; i < defs.length; i++) {
      const el = this.els.cards[i];
      if (!el) continue;
      const def = defs[i];
      const s = anchors[def.city];
      const w = el.offsetWidth || 170;
      const h = el.offsetHeight || 76;
      const tx = def.side > 0 ? W / 2 + half + 32 : W / 2 - half - 32 - w;
      const fits = tx >= 20 && tx + w <= W - 20;
      const vis = show && fits && s && s[2] > 0.15 ? Math.min(1, (s[2] - 0.15) * 4) * cardFade : 0;
      el.style.opacity = vis.toFixed(3);
      if (vis <= 0) continue;
      let ty = def.hang === "below" ? s[1] + 18 : def.hang === "above" ? s[1] - 18 - h : s[1] - h / 2;
      ty = Math.max(100, Math.min(H - 130 - h, ty));
      el.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`;
      const ex = def.side > 0 ? tx : tx + w;
      const ey = Math.max(ty + 14, Math.min(ty + h - 14, s[1]));
      g = ctx.createLinearGradient(ex, 0, s[0], 0);
      g.addColorStop(0, `rgba(${GOLD},${(0.6 * vis).toFixed(3)})`);
      g.addColorStop(0.55, `rgba(${GOLD},${(0.12 * vis).toFixed(3)})`);
      g.addColorStop(1, `rgba(${GOLD},${(0.45 * vis).toFixed(3)})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(s[0] + def.side * 10, ey);
      ctx.lineTo(s[0], s[1]);
      ctx.stroke();
      ctx.fillStyle = `rgba(${GOLD},${(0.9 * vis).toFixed(3)})`;
      ctx.fillRect(ex - (def.side > 0 ? 3 : 0), ey - 1.5, 3, 3);
    }

    // dim the globe behind the headline so the type reads
    const dim = 0.82 * (1 - smooth(0, 0.3, p));
    if (dim > 0.005) {
      const tcx = W / 2;
      const tcy = mobile ? H * 0.5 : H * 0.47;
      const tr = mobile ? W * 0.8 : Math.max(W * 0.34, 320);
      g = ctx.createRadialGradient(tcx, tcy, tr * 0.15, tcx, tcy, tr);
      g.addColorStop(0, `rgba(${veil},${dim.toFixed(3)})`);
      g.addColorStop(0.7, `rgba(${veil},${(dim * 0.45).toFixed(3)})`);
      g.addColorStop(1, `rgba(${veil},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // edge vignette during the dive
    if (dive > 0.01) {
      g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, `rgba(${veil},0)`);
      g.addColorStop(1, `rgba(${veil},${(0.7 * dive).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // bottom fade: footer legibility, then a seamless hand-off into the next section
    const fadeTop = H * (0.72 - settle * 0.3);
    g = ctx.createLinearGradient(0, fadeTop, 0, H);
    g.addColorStop(0, `rgba(${fade},0)`);
    g.addColorStop(1, `rgba(${fade},${(0.55 + 0.45 * Math.max(dive, settle)).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, fadeTop, W, H - fadeTop);
  }
}
