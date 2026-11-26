/* Say Less web. Plain JS, no third-party code. All user text goes through textContent, never innerHTML. */
'use strict';
// The API address is set by build.py in <meta name=sl-api> (Cloudflare Worker; a local stand-in for tests).
const API = (document.querySelector('meta[name=sl-api]') || {}).content || 'https://sayless-api.webspind.workers.dev/rpc/';
const BASE = location.pathname.replace(/[^/]*$/, '');

/* ---------- tiny DOM helper ---------- */
function h(tag, a, ...kids) {
  const e = document.createElement(tag);
  if (a) for (const [k, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style') Object.assign(e.style, v);
    else if (k in e && typeof v !== 'string') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const svgIcon = d => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS(s.namespaceURI, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '2.4'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); s.append(p); return s; };
const I_SHUFFLE = 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5';
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- api ---------- */
async function rpc(fn, body) {
  let r;
  try { r = await fetch(API + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), referrerPolicy: 'no-referrer', cache: 'no-store' }); }
  catch (e) { throw new Error('No connection. Try again in a moment.'); }
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error((j && j.message) || 'Something went wrong. Try again.');
  return j;
}
// Read-only calls go as GET so the CDN and browser can cache them (photos never change).
async function rpcGet(fn, args, cache) {
  const r = await fetch(API + fn + '?' + new URLSearchParams(args), { referrerPolicy: 'no-referrer', cache: cache || 'no-store' });
  if (!r.ok) throw new Error('Something went wrong. Try again.');
  return r.json();
}
const PHOTOS = {};

/* ---------- dates ---------- */
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const diff = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
const short = s => { const d = pd(s); return `${WDL[d.getDay()].slice(0, 3)} ${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`; };
const longd = s => { const d = pd(s); return `${WDL[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`; };
const span = days => { if (!days.length) return ''; const a = pd(days[0]), b = pd(days[days.length - 1]); const f = d => `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`; return days.length === 1 ? f(a) : `${f(a)} to ${f(b)}`; };
const WORD = ['no one', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = n => WORD[n] || String(n);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- brand data (from the app's round 9) ---------- */
const KINDS = {
  drinks: { obj: 'drinks', label: 'One drink', name: 'One drink', desc: 'It has never once been one drink.', ideas: ['The window table', 'A wine bar', 'Arcade bar'], col: '#2E44FF' },
  cabin: { obj: 'cabin', label: 'Cabin', name: 'Cabin, no signal', desc: 'Two nights. One fire. No bars.', ideas: ['Sauna and a swim', 'A long hike', 'Board games by the fire'], col: '#17614A' },
  run: { obj: 'run', label: '5K', name: '5K, allegedly', desc: 'We run. Then we earn the pastries.', ideas: ['Round the lake', 'Along the harbour', 'Through the park'], col: '#0E68C8' },
  birthday: { obj: 'cake', label: 'Birthday', name: 'Birthday, the big one', desc: 'They said nothing big. They did not mean it.', ideas: ['Karaoke', 'House party', 'One long dinner'], col: '#C9286B' },
  film: { obj: 'film', label: 'Film night', name: 'Film night', desc: 'Someone else picks. No one complains.', ideas: ['Something scary', 'Something funny', 'Something old'], col: '#5A2C8A' },
  dinner: { obj: 'pasta', label: 'Pasta night', name: 'Pasta night', desc: 'Bring wine. Leave your phone in the hall.', ideas: ['Carbonara', 'Lasagne', 'Pizza from scratch'], col: '#C4361B' },
};
const KW = [
  ['drinks', /drink|beer|øl|bajer|bar\b|wine|vin\b|cocktail|pub|fredagsbar|shots/i],
  ['cabin', /cabin|hytte|sommerhus|trip|tur\b|camp|tent|telt|hike|weekend|getaway|ski/i],
  ['run', /run|løb|5k|10k|padel|tennis|football|fodbold|gym|walk|gåtur|bike|cykel|swim|svøm|sport|match/i],
  ['birthday', /birthday|fødselsdag|bday|b-day|cake|kage|party|fest|turns \d|bliver \d/i],
  ['film', /film|movie|cinema|biograf|\bbio\b|netflix|series|serie|show|gaming|game night/i],
  ['dinner', /dinner|middag|food|mad\b|pizza|pasta|brunch|lunch|eat|spise|restaurant|sushi|burger|bbq|grill/i],
];
const guess = t => (KW.find(([, r]) => r.test(t || '')) || [])[0];
const COLS = ['#2E44FF', '#17614A', '#0E68C8', '#C9286B', '#5A2C8A', '#C4361B'];
const hash = s => { let x = 7; for (const c of (s || '').toLowerCase()) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
const nameCol = t => COLS[hash(t) % COLS.length];
const FACES = ['emil', 'freja', 'ida', 'mads', 'oliver', 'sofie'];
let FACEMAP = null;
const faceSrc = n => { const k = (n || '').trim().toLowerCase(); const i = FACEMAP && FACEMAP.has(k) ? FACEMAP.get(k) : hash(k); return `${BASE}a/f_${FACES[i % FACES.length]}.webp`; };
function buildFaces(p) { FACEMAP = new Map(); let i = hash(p.id || '') % FACES.length; [...(p.names || []), ...(p.answers || []).map(a => a.name)].forEach(n => { const k = n.trim().toLowerCase(); if (!FACEMAP.has(k)) FACEMAP.set(k, i++); }); }
const face = (n, cls = 'face') => h('img', { class: cls, src: faceSrc(n), alt: n, title: n, width: 64, height: 64, draggable: false });
const ROAST = [n => `${n}, we saved you a seat.`, n => `${n}, the group chat can see you not answering.`, n => `${n}, one tap. That is all we ask.`, n => `${n}, your calendar called. It says you are free.`, n => `${n}, we almost picked a day without you. Almost.`, n => `${n}, the plan is ready. It is only missing you.`];
const safeCol = c => /^#[0-9a-fA-F]{6}$/.test(c || '') ? c : COLS[0];
const setPlanColor = c => document.documentElement.style.setProperty('--plan', safeCol(c));

/* ---------- small ui ---------- */
let toastT;
function toast(msg) { $$('.toast').forEach(t => t.remove()); const t = h('div', { class: 'toast', role: 'status', text: msg }); document.body.append(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }
function sheet(title, ...body) {
  const close = () => { s.remove(); document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); };
  const s = h('div', { class: 'scrim', onclick: e => { if (e.target === s) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('h2', { text: title }), ...body));
  document.body.append(s); document.addEventListener('keydown', esc);
  setTimeout(() => { const f = $('button, input', s.firstChild); if (f) f.focus(); }, 30);
  s.close = close; return s;
}
async function copy(text, btn, label) {
  try { await navigator.clipboard.writeText(text); } catch (e) { const t = h('textarea', { value: text }); document.body.append(t); t.select(); try { document.execCommand('copy'); } catch (er) {} t.remove(); }
  if (btn) { const old = btn.textContent, w = btn.offsetWidth; btn.style.minWidth = w + 'px'; btn.classList.add('ok'); btn.textContent = label || 'Copied'; setTimeout(() => { btn.classList.remove('ok'); btn.textContent = old; }, 1800); }
}
function confetti(from) {
  if (RM) return; const r = from.getBoundingClientRect();
  for (let i = 0; i < 26; i++) {
    const c = h('img', { class: 'conf', src: `${BASE}a/conf_${i % 6}.webp`, alt: '' }); document.body.append(c);
    const x = r.left + r.width / 2, y = r.top + r.height / 3, a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 260;
    c.animate([{ transform: `translate(${x}px,${y}px) scale(.4)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * v}px,${y + Math.sin(a) * v - 120}px) rotate(${Math.random() * 540}deg) scale(1)`, opacity: 1, offset: .55 }, { transform: `translate(${x + Math.cos(a) * v * 1.2}px,${y + 420}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1400 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => c.remove();
  }
}
let actx = null, touched = false;
addEventListener('pointerdown', () => { touched = true; }, { once: true, capture: true });
function blip() {
  if (!touched || RM) return;
  try { actx = actx || new AudioContext(); const t = actx.currentTime; [523.25, 783.99].forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t + i * .09); g.gain.linearRampToValueAtTime(.18, t + i * .09 + .015); g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .35); o.connect(g); g.connect(actx.destination); o.start(t + i * .09); o.stop(t + i * .09 + .4); }); } catch (e) {}
}
function tilt(el) {
  if (RM || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0; const obj = $('.obj', el);
  const step = () => { cx += (tx - cx) * .14; cy += (ty - cy) * .14; el.style.transform = `perspective(900px) rotateX(${(-cy * 5).toFixed(2)}deg) rotateY(${(cx * 5).toFixed(2)}deg)`; if (obj) obj.style.transform = `translateX(-50%) translate(${(cx * -8).toFixed(1)}px,${(cy * -8).toFixed(1)}px)`; if (Math.abs(tx - cx) + Math.abs(ty - cy) > .002) raf = requestAnimationFrame(step); else raf = 0; };
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1; if (!raf) raf = requestAnimationFrame(step); });
  el.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(step); });
}
function bar(onPlan, right) {
  return h('header', { class: 'bar' + (onPlan ? ' on-plan' : '') }, h('div', { class: 'bar-in' },
    h('a', { class: 'brand', href: BASE, 'aria-label': 'Say Less, start a new plan' }, 'Say Less'), h('span', { class: 'sp' }), right || null));
}
function favicon(n) {
  const c = h('canvas', { width: 64, height: 64 }), x = c.getContext('2d');
  x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--plan').trim() || COLS[0];
  x.beginPath(); x.roundRect ? x.roundRect(0, 0, 64, 64, 14) : x.rect(0, 0, 64, 64); x.fill();
  x.fillStyle = '#fff'; x.font = '900 40px Rubik, Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n == null ? 'S' : String(n > 99 ? '99' : n), 32, 35);
  let l = $('link[rel=icon]'); if (!l) { l = h('link', { rel: 'icon' }); document.head.append(l); } l.href = c.toDataURL('image/png');
}

/* ---------- the plan card ---------- */
function lookOf(p) {
  const l = p.look || {}; const k = l.kind;
  if (k === 'photo' && typeof l.photo === 'string' && l.photo.startsWith('data:image/jpeg;base64,')) return { kind: 'photo', photo: l.photo, col: safeCol(l.color || nameCol(p.title)) };
  if (KINDS[k]) return { kind: k, col: safeCol(l.color || KINDS[k].col) };
  return { kind: 'letters', col: safeCol(l.color || nameCol(p.title)) };
}
function cardEl(p, o = {}) {
  const L = lookOf(p);
  const c = h('div', { class: 'card ' + (L.kind === 'letters' ? 'letters' : L.kind === 'photo' ? 'photo' : 'model'), style: { background: L.kind === 'photo' ? `#111 url("${L.photo}") center/cover no-repeat` : L.col } });
  if (L.kind !== 'letters' && L.kind !== 'photo') c.append(h('div', { class: 'shadow' }), h('img', { class: 'obj', src: `${BASE}a/${KINDS[L.kind].obj}.webp`, alt: '', draggable: false }));
  if (o.dates !== false && p.days && p.days.length) c.append(h('span', { class: 'dates', text: span(p.days) }));
  c.append(h('div', { class: 'tt' }, (p.title || 'Untitled').trim(), p.subtitle ? h('small', { text: p.subtitle }) : null));
  if (o.corner) c.append(o.corner);
  if (o.stub) c.append(h('div', { class: 'stub', text: o.stub }));
  return c;
}

/* ================================================================
   CREATE: What, When, Ready
   ================================================================ */
const C = { step: 0, title: '', subtitle: '', kind: null, color: null, photo: null, preset: null, days: new Set(), time: '', timeOn: false, by: undefined, optsOn: false, opts: [], namesOpen: false, names: [], host: '', mOff: 0, busy: false };
const cKind = () => C.photo ? 'photo' : C.kind || guess(C.title) || 'letters';
const cCol = () => C.color || (KINDS[cKind()] ? KINDS[cKind()].col : nameCol(C.title));
const cDays = () => [...C.days].sort();
const cPlan = () => ({ title: C.title || 'Your plan', subtitle: C.subtitle, days: cDays(), look: { kind: cKind(), color: cCol(), photo: C.photo } });
function cBy() {
  const d = cDays(); if (!d.length) return null;
  const first = pd(d[0]), dflt = add(first, -1);
  if (C.by === null) return null;
  if (C.by && pd(C.by) < first && pd(C.by) >= today()) return C.by;
  return dflt >= today() ? iso(dflt) : null;
}

function renderCreate() {
  setPlanColor(cCol()); document.title = 'Say Less: make a plan'; favicon(null);
  const stage = h('aside', { class: 'stage', 'aria-label': 'Your plan card' });
  const work = h('section', { class: 'work' });
  const root = h('div', {}, bar(false, h('span', { class: 'meta hide-phone', text: 'Friends never pay. No app, no account.' })), h('main', { class: 'split' }, stage, work));
  const draw = () => {
    setPlanColor(cCol());
    stage.replaceChildren();
    const card = cardEl(cPlan(), C.step === 2 ? { corner: h('button', { class: 'corner', 'aria-label': 'Shuffle the look', title: 'Shuffle', onclick: shuffle }, svgIcon(I_SHUFFLE)) } : {});
    tilt(card);
    stage.append(card, h('div', { class: 'stage-side' },
      h('div', { class: 'swatches', role: 'group', 'aria-label': 'Card colour' }, COLS.map(c => h('button', { class: c === cCol() ? 'on' : '', style: { background: c }, 'aria-label': 'Colour ' + c, 'aria-pressed': String(c === cCol()), onclick: () => { C.color = c; draw(); } }))),
      h('button', { class: 'link', text: 'Pick a look', onclick: pickLook })));
    const steps = h('nav', { class: 'steps', 'aria-label': 'Steps' }, ['1. What', '2. When', '3. Ready'].map((t, i) => h('button', { class: i === C.step ? 'on' : '', text: t, disabled: i > C.step && !canGo(i), 'aria-current': i === C.step ? 'step' : null, onclick: () => { if (i <= C.step || canGo(i)) { C.step = i; draw(); } } })));
    const body = [stepWhat, stepWhen, stepReady][C.step]();
    work.replaceChildren(h('div', { class: 'work-in' }, steps, body), foot());
  };
  const canGo = i => (i >= 1 ? C.title.trim().length > 0 : true) && (i >= 2 ? C.days.size > 0 : true);
  const shuffle = () => { const ks = Object.keys(KINDS); if (C.photo) { C.color = COLS[(COLS.indexOf(cCol()) + 1) % COLS.length]; } else { const cur = cKind(); const nk = ks[(ks.indexOf(cur) + 1 + Math.floor(Math.random() * (ks.length - 1))) % ks.length]; C.kind = nk; C.color = null; } draw(); };

  function stepWhat() {
    const title = h('input', { class: 'field big', id: 'title', maxLength: 60, placeholder: 'One drink, cabin trip, pasta night...', value: C.title, 'aria-label': 'Plan name', autocomplete: 'off',
      oninput: e => { C.title = e.target.value; if (C.preset && C.title !== KINDS[C.preset].name) C.preset = null; draw2(); } });
    const sub = h('input', { class: 'field', maxLength: 80, placeholder: 'One line for your friends (optional)', value: C.subtitle, 'aria-label': 'Subtitle', autocomplete: 'off', oninput: e => { C.subtitle = e.target.value; draw2(); } });
    const draw2 = () => { const card = $('.stage .card'); const n = cardEl(cPlan()); tilt(n); card.replaceWith(n); setPlanColor(cCol()); $$('.swatches button').forEach(b => b.classList.toggle('on', b.getAttribute('aria-label') === 'Colour ' + cCol())); $('.foot .btn').disabled = !C.title.trim(); };
    setTimeout(() => title.focus(), 50);
    const mine = (store.get('sl.mine') || []).slice(0, 8);
    return h('div', {}, h('p', { class: 'micro', style: { marginBottom: '10px' }, text: 'Pick a night with friends in ten seconds. No app, no account.' }), h('h1', { text: "What's the plan?" }), h('p', { class: 'lead', text: 'Name it. The card picks a look from the words, or pick one yourself.' }),
      h('div', { class: 'stack' }, title, sub),
      h('div', { class: 'stack' }, h('span', { class: 'micro', text: 'Or start from one' }),
        h('div', { class: 'presets' }, Object.entries(KINDS).map(([k, v]) => h('button', { class: 'tile' + (C.preset === k ? ' on' : ''), onclick: () => { C.preset = k; C.title = v.name; C.subtitle = v.desc; C.kind = k; C.color = null; C.photo = null; C.opts = v.ideas.slice(); draw(); } },
          h('img', { src: `${BASE}a/${v.obj}.webp`, alt: '' }), v.label)))),
      h('p', { class: 'meta', style: { marginTop: '24px' }, text: 'Free while Say Less is new. Friends never pay.' }),
      mine.length ? h('div', { class: 'stack shelf' }, h('span', { class: 'micro', text: 'Your plans' }), h('div', { class: 'presets' }, mine.map(m => h('a', { class: 'tile', href: `${BASE}?p=${m.id}` },
        m.obj ? h('img', { src: `${BASE}a/${m.obj}.webp`, alt: '' }) : h('span', { class: 'lt', style: { width: '64px', height: '64px', display: 'grid', placeItems: 'center', font: '900 30px/1 var(--head)', color: safeCol(m.col) }, text: (m.t || 'S').charAt(0).toUpperCase() }), m.t)))) : null);
  }

  function stepWhen() {
    const t0 = today(), m0 = new Date(t0.getFullYear(), t0.getMonth() + C.mOff, 1);
    const wrap = h('div', { class: 'months' });
    // span: tap the first day, then the last day (or drag across). Every day between is in. Max 62 days.
    const span = (a, b) => { let x = pd(a < b ? a : b); const y = pd(a < b ? b : a); C.days = new Set(); while (x <= y && C.days.size < 62) { C.days.add(iso(x)); x = add(x, 1); } };
    const tapDay = d => { if (C.a == null || C.b != null) { C.a = d; C.b = null; C.days = new Set([d]); } else { C.b = d; span(C.a, d); } };
    let drag = null;
    const refresh = () => { $$('.d[data-d]', wrap).forEach(b => b.classList.toggle('on', C.days.has(b.dataset.d))); const card = $('.stage .card'); const n = cardEl(cPlan()); tilt(n); card.replaceWith(n); $('.foot .btn').disabled = !C.days.size; $('.foot .cnt').textContent = C.days.size ? (C.a != null && C.b == null && C.days.size === 1 ? 'Now tap the last day' : `${C.days.size} ${C.days.size === 1 ? 'day' : 'days'} picked`) : 'Tap the first day'; };
    for (let k = 0; k < 2; k++) {
      const m = new Date(m0.getFullYear(), m0.getMonth() + k, 1), g = h('div', { class: 'mgrid', role: 'grid' });
      ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(w => g.append(h('span', { class: 'micro wd', text: w })));
      const lead = (m.getDay() + 6) % 7; for (let i = 0; i < lead; i++) g.append(h('span', { class: 'd blank' }));
      for (let d = new Date(m); d.getMonth() === m.getMonth(); d = add(d, 1)) {
        const s = iso(d), past = d < t0, far = diff(t0, d) > 180;
        g.append(h('button', { class: 'd' + (C.days.has(s) ? ' on' : ''), 'data-d': s, disabled: past || far, 'aria-pressed': String(C.days.has(s)), 'aria-label': longd(s), text: d.getDate() }));
      }
      wrap.append(h('div', { class: 'month' }, h('h3', { text: `${MON[m.getMonth()]} ${m.getFullYear()}` }), g));
    }
    const at = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.matches && el.matches('.d[data-d]:not([disabled])') ? el : null; };
    wrap.addEventListener('pointerdown', e => { const b = at(e); if (!b) return; e.preventDefault(); drag = { from: b.dataset.d, moved: false }; if (e.pointerType !== 'mouse') wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', e => { if (!drag) return; const b = at(e); if (!b || (b.dataset.d === drag.from && !drag.moved)) return; drag.moved = true; C.a = drag.from; C.b = b.dataset.d; span(drag.from, b.dataset.d); refresh(); });
    const end = () => { if (drag && !drag.moved) { tapDay(drag.from); refresh(); } drag = null; };
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', () => { drag = null; });
    wrap.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.d) { e.preventDefault(); tapDay(e.target.dataset.d); refresh(); } });
    const quick = (label, f) => h('button', { class: 'btn out sm', text: label, onclick: () => {
      const ds = f().filter(d => d >= t0).map(iso); C.days = new Set(); C.a = ds[0]; C.b = ds[ds.length - 1]; const first = ds[0] && pd(ds[0]); C.mOff = first ? (first.getFullYear() - t0.getFullYear()) * 12 + first.getMonth() - t0.getMonth() : 0; draw();
      ds.forEach((s, i) => setTimeout(() => { C.days.add(s); const b = $(`.d[data-d="${s}"]`); if (b) { b.classList.add('on', 'pop'); b.setAttribute('aria-pressed', 'true'); } if (i === ds.length - 1) refreshAll(); }, RM ? 0 : i * 45));
    } });
    const refreshAll = () => { const card = $('.stage .card'); const n = cardEl(cPlan()); tilt(n); card.replaceWith(n); $('.foot .btn').disabled = !C.days.size; $('.foot .cnt').textContent = `${C.days.size} ${C.days.size === 1 ? 'day' : 'days'} picked`; };
    const fri = () => { for (let i = 0; i < 7; i++) { const d = add(t0, i); if (d.getDay() === 5) return d; if (d.getDay() === 6 || d.getDay() === 0) return add(d, d.getDay() === 6 ? -1 : -2); } return t0; };
    const time = h('input', { class: 'field', type: 'time', value: C.time, 'aria-label': 'Start time', style: { maxWidth: '180px', height: '48px' }, oninput: e => { C.time = e.target.value; } });
    return h('div', {},
      h('div', { class: 'bhead' }, h('h1', { text: 'Pick the period' }), h('div', { class: 'calnav' }, h('button', { class: 'btn out sm', 'aria-label': 'Previous month', text: '<', disabled: C.mOff <= 0, onclick: () => { C.mOff--; draw(); } }), h('button', { class: 'btn out sm', 'aria-label': 'Next month', text: '>', onclick: () => { C.mOff++; draw(); } }))),
      h('p', { class: 'lead', text: 'Tap the first day, then the last day. Friends tap the days they are free in between.' }),
      h('div', { class: 'quick' }, quick('This weekend', () => { const f = fri(); return [f, add(f, 1), add(f, 2)]; }), quick('Next 2 weeks', () => [...Array(14)].map((_, i) => add(t0, i))), quick('Next 3 weeks', () => [...Array(21)].map((_, i) => add(t0, i))),
        C.days.size ? h('button', { class: 'link', text: 'Clear', onclick: () => { C.days.clear(); C.a = C.b = null; draw(); } }) : null),
      wrap,
      h('div', { class: 'row', style: { marginTop: '28px' } }, h('span', { class: 'grow' }, h('b', { text: 'Add a time' }), h('div', { class: 'meta', text: 'Optional. Leave it off and you decide later.' })),
        C.timeOn ? time : null, h('button', { class: 'sw', role: 'switch', 'aria-checked': String(C.timeOn), 'aria-label': 'Add a time', onclick: () => { C.timeOn = !C.timeOn; if (!C.timeOn) C.time = ''; else if (!C.time) C.time = '19:00'; draw(); } })),
      C.mOff > 0 ? h('button', { class: 'link hide-phone', style: { marginTop: '14px' }, text: 'Back to this month', onclick: () => { C.mOff = 0; draw(); } }) : null);
  }

  function stepReady() {
    const d = cDays(), by = cBy();
    const opts = h('div', { class: 'stack' });
    const drawOpts = () => { opts.replaceChildren(...C.opts.map((o, i) => h('div', { class: 'opt' }, h('input', { class: 'field', maxLength: 60, value: o, 'aria-label': 'Option ' + (i + 1), oninput: e => { C.opts[i] = e.target.value; } }), h('button', { class: 'x', 'aria-label': 'Remove option', text: '×', onclick: () => { C.opts.splice(i, 1); drawOpts(); } }))),
      C.opts.length < 8 ? h('button', { class: 'link', text: '+ Add an option', onclick: () => { C.opts.push(''); drawOpts(); $$('input', opts).pop().focus(); } }) : null); };
    if (C.optsOn) drawOpts();
    const nameIn = h('input', { class: 'field', maxLength: 40, placeholder: 'A friend\u2019s name', 'aria-label': 'Friend name', onkeydown: e => { if (e.key === 'Enter') addName(); } });
    const chips = h('div', { class: 'chips' });
    const drawChips = () => chips.replaceChildren(...C.names.map((n, i) => h('span', { class: 'chip' }, face(n), n, h('button', { 'aria-label': 'Remove ' + n, text: '×', onclick: () => { C.names.splice(i, 1); drawChips(); } }))));
    const addName = () => { const v = nameIn.value.trim(); if (v && !C.names.some(n => n.toLowerCase() === v.toLowerCase()) && C.names.length < 30) { C.names.push(v); drawChips(); } nameIn.value = ''; nameIn.focus(); };
    drawChips();
    return h('div', {}, h('h1', { text: 'Ready?' }), h('p', { class: 'lead', text: `${d.length} ${d.length === 1 ? 'day' : 'days'}, ${span(d)}${C.time ? ', from ' + C.time : ''}. Friends tap the days they are free.` }),
      h('div', { class: 'rows' },
        h('div', { class: 'row' }, h('span', { class: 'grow' }, h('b', { text: 'Answer by' }), h('div', { class: 'meta', text: by ? 'That day the leading night is picked for you.' : 'No deadline. You lock it when you are happy.' })),
          h('button', { class: 'datebtn', text: by ? longd(by) : 'No deadline', onclick: pickBy })),
        h('div', { class: 'row' }, h('span', { class: 'grow' }, h('b', { text: 'Add options to vote on' }), h('div', { class: 'meta', text: 'Like where to go. Friends pick as many as they like.' })),
          h('button', { class: 'sw', role: 'switch', 'aria-checked': String(C.optsOn), 'aria-label': 'Add options to vote on', onclick: () => { C.optsOn = !C.optsOn; if (C.optsOn && !C.opts.length) C.opts = (KINDS[cKind()] || KINDS.drinks).ideas.slice(); draw(); } })),
        C.optsOn ? h('div', { class: 'row', style: { display: 'block', padding: '16px 18px' } }, opts) : null,
        h('button', { class: 'row', style: { border: 0, width: '100%', textAlign: 'left' }, 'aria-expanded': String(C.namesOpen), onclick: () => { C.namesOpen = !C.namesOpen; draw(); } },
          h('span', { class: 'grow' }, h('b', { text: 'Add names (optional)' }), h('div', { class: 'meta', text: C.names.length ? C.names.join(', ') : 'So friends just tap their name. Anyone with the link can still join.' })), h('b', { text: C.namesOpen ? '−' : '+' })),
        C.namesOpen ? h('div', { class: 'row', style: { display: 'grid', gap: '12px', padding: '16px 18px' } }, h('div', { class: 'opt' }, nameIn, h('button', { class: 'btn sm', text: 'Add', onclick: addName })), chips) : null),
      h('div', { class: 'stack' }, h('label', { class: 'micro', for: 'host', text: 'Your name (shown to friends)' }),
        h('input', { class: 'field', id: 'host', maxLength: 40, value: C.host, placeholder: 'Optional', autocomplete: 'given-name', oninput: e => { C.host = e.target.value; } })));
  }
  function pickBy() {
    const d = cDays(); const first = pd(d[0]); const list = [];
    for (let x = add(first, -1); x >= today() && list.length < 28; x = add(x, -1)) list.push(iso(x));
    const s = sheet('Answer by', h('p', { class: 'meta', text: 'Always before the first day. That day the leading night is picked for you.' }),
      h('div', { class: 'chips' }, list.map(v => h('button', { class: 'datebtn', text: short(v), onclick: () => { C.by = v; s.close(); draw(); } }))),
      h('button', { class: 'btn out', text: 'No deadline', onclick: () => { C.by = null; s.close(); draw(); } }));
    if (!list.length) toast('The first day is too soon for a deadline.');
  }
  function pickLook() {
    const file = h('input', { type: 'file', accept: 'image/*', class: 'vh', 'aria-label': 'Upload a photo', onchange: async e => { const f = e.target.files[0]; if (!f) return; try { C.photo = await shrink(f); C.kind = null; s.close(); draw(); } catch (er) { toast('That photo did not work. Try another.'); } } });
    const s = sheet('Pick a look',
      h('div', { class: 'looks' }, Object.entries(KINDS).map(([k, v]) => h('button', { class: 'tile' + (cKind() === k ? ' on' : ''), onclick: () => { C.kind = k; C.photo = null; C.color = null; s.close(); draw(); } }, h('img', { src: `${BASE}a/${v.obj}.webp`, alt: '' }), v.label)),
        h('button', { class: 'tile' + (cKind() === 'letters' ? ' on' : ''), onclick: () => { C.kind = 'letters'; C.photo = null; s.close(); draw(); } }, h('span', { class: 'lt', text: 'Aa' }), 'Letters'),
        h('button', { class: 'tile' + (cKind() === 'photo' ? ' on' : ''), onclick: () => file.click() }, h('span', { class: 'lt', text: '+' }), 'Your photo')), file,
      h('p', { class: 'meta', text: 'Photos are made small and stored with the plan, so anyone with the link sees them.' }));
  }
  const foot = () => {
    const nxt = C.step < 2;
    const btn = h('button', { class: 'btn', text: nxt ? 'Next' : 'Make the link', disabled: (C.step === 0 && !C.title.trim()) || (C.step === 1 && !C.days.size) || C.busy, onclick: () => nxt ? (C.step++, draw(), scrollTo(0, 0)) : make(btn) });
    return h('div', { class: 'foot' }, C.step ? h('button', { class: 'link', text: 'Back', onclick: () => { C.step--; draw(); } }) : null,
      h('span', { class: 'meta cnt hide-phone', text: C.step === 1 ? (C.days.size ? `${C.days.size} ${C.days.size === 1 ? 'day' : 'days'} picked` : 'Pick at least one day') : 'Friends never pay.' }), h('span', { class: 'sp' }), btn);
  };
  async function make(btn) {
    C.busy = true; btn.disabled = true; btn.textContent = 'Making it...';
    const body = { title: C.title.trim(), subtitle: C.subtitle.trim(), days: cDays(), start_time: C.time || '', answer_by: cBy() || '', options: C.optsOn ? C.opts.map(s => s.trim()).filter(Boolean) : [], names: C.names, host_name: C.host.trim(), look: { kind: cKind(), color: cCol(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ...(C.photo ? { photo: C.photo } : {}) } };
    try {
      const r = await rpc('sl_create', { p: body });
      store.set('sl.h.' + r.id, r.host_key);
      const mine = store.get('sl.mine') || []; mine.unshift({ id: r.id, t: body.title, at: Date.now(), obj: KINDS[body.look.kind] ? KINDS[body.look.kind].obj : null, col: body.look.color }); store.set('sl.mine', mine.slice(0, 30));
      const link = friendLink(r.id); copy(link);
      const card = $('.stage .card'); const tk = cardEl(cPlan(), { stub: 'Link copied' }); card.replaceWith(tk); tk.classList.add('ticket'); confetti(tk);
      setTimeout(() => { Object.assign(C, { step: 0, title: '', subtitle: '', kind: null, color: null, photo: null, preset: null, days: new Set(), time: '', timeOn: false, by: undefined, optsOn: false, opts: [], namesOpen: false, names: [], busy: false }); go(`?p=${r.id}&v=share`); }, RM ? 300 : 1500);
    } catch (e) { C.busy = false; btn.disabled = false; btn.textContent = 'Make the link'; toast(e.message); }
  }
  draw(); return root;
}
function shrink(file) {
  return new Promise((ok, no) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const s = Math.min(1, 760 / Math.max(im.width, im.height)), c = h('canvas', { width: Math.round(im.width * s), height: Math.round(im.height * s) }); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      let q = .8, d = c.toDataURL('image/jpeg', q); while (d.length > 360000 && q > .3) { q -= .1; d = c.toDataURL('image/jpeg', q); } d.length > 390000 ? no() : ok(d); };
    im.onerror = () => { URL.revokeObjectURL(u); no(); }; im.src = u;
  });
}
const friendLink = id => `${location.origin}${BASE}?p=${id}`;

/* ================================================================
   PLAN PAGES: share, friend answer, waiting room, locked
   ================================================================ */
let P = null, POLL = null, VIEW = '', WATCH = { lead: null, ids: null };
const hostKey = id => store.get('sl.h.' + id);
const myAns = id => store.get('sl.a.' + id);
function stats(p) {
  const A = p.answers || [];
  const rows = p.days.map(d => { const y = A.filter(a => a.days[d] === 'yes'), m = A.filter(a => a.days[d] === 'maybe'); return { d, y, m, s: y.length * 2 + m.length }; });
  rows.sort((a, b) => b.s - a.s || b.y.length - a.y.length || (a.d < b.d ? -1 : 1));
  const answered = A.length, low = new Set(A.map(a => a.name.trim().toLowerCase()));
  const pending = (p.names || []).filter(n => !low.has(n.trim().toLowerCase()));
  return { rows, answered, pending, lead: rows[0] && rows[0].s > 0 ? rows[0].d : null };
}
function gold(st, r, i) {
  if (!r.s) return false;
  if (i !== 0) return false;
  if (st.answered >= 2 && r.y.length === st.answered) return true;
  if (i === 0 && st.pending.length && st.rows[1] && r.s - st.rows[1].s > st.pending.length * 2) return true;
  return false;
}

async function loadPlan(id) {
  const p = await rpc('sl_get', { p_id: id });
  if (!p) throw new Error('nf');
  if (p.look && p.look.photo === true) {
    if (!(p.id in PHOTOS)) PHOTOS[p.id] = await rpcGet('sl_photo', { p_id: p.id }, 'force-cache').catch(() => null);
    if (PHOTOS[p.id]) p.look = { ...p.look, photo: PHOTOS[p.id] }; else p.look = { ...p.look, kind: 'letters', photo: undefined };
  }
  p.answers = (p.answers || []).map(a => ({ ...a, days: a.days || {}, picks: Array.isArray(a.picks) ? a.picks : [] }));
  return p;
}
async function renderPlan(id, view) {
  const app = $('#app');
  if (!P || P.id !== id) {
    app.replaceChildren(bar(false), h('div', { class: 'center' }, h('p', { class: 'meta', text: 'Loading the plan...' })));
    try { P = await loadPlan(id); } catch (e) {
      app.replaceChildren(bar(false), h('div', { class: 'center' }, h('div', { class: 'stack' }, h('h1', { text: e.message === 'nf' ? 'This plan is gone' : 'Could not load the plan' }), h('p', { class: 'lead', text: e.message === 'nf' ? 'The link may be mistyped.' : e.message }), h('a', { class: 'btn', href: BASE, text: 'Make your own plan' }))));
      return;
    }
  }
  setPlanColor(lookOf(P).col); buildFaces(P);
  const host = !!hostKey(id), mine = myAns(id);
  if (!view) view = P.locked_day ? 'locked' : host || mine ? 'wait' : 'answer';
  if (P.locked_day && view !== 'share') view = 'locked';
  VIEW = view;
  const el = view === 'share' ? viewShare(host) : view === 'answer' ? viewAnswer() : view === 'locked' ? viewLocked(host) : viewWait(host);
  app.replaceChildren(el); scrollTo(0, 0);
  titleCount();
  startPoll(id);
}
function titleCount() { if (!P) return; const n = P.answers.length; document.title = (n ? `(${n}) ` : '') + P.title + ' · Say Less'; favicon(n || null); }
function startPoll(id) {
  clearInterval(POLL);
  let ver = null, quiet = 0, tick = 0;
  rpcGet('sl_version', { p_id: id }).then(v => { if (ver === null) ver = v; }).catch(() => {});
  POLL = setInterval(async () => {
    tick++;
    if (document.hidden && (VIEW !== 'wait' || tick % 6)) return; // hidden tabs check every 30 s
    if (quiet > 120 && tick % 6) return;                            // nothing for 10 min: slow to 30 s
    if (!P || P.id !== id) return clearInterval(POLL);
    try {
      const v = await rpcGet('sl_version', { p_id: id });            // a few bytes instead of the whole plan
      if (ver === null) { ver = v; return; }
      if (v === ver) { quiet++; return; }
      ver = v; quiet = 0;
      const np = await loadPlan(id), sig = x => JSON.stringify([x.locked_day, x.answers.map(a => [a.id, a.updated_at])]);
      if (sig(np) === sig(P)) return;
      const old = P; P = np; buildFaces(P); titleCount();
      if (np.locked_day && !old.locked_day) { if (VIEW !== 'answer') renderPlan(id); else toast('The host just locked the date.'); return; }
      if (!np.locked_day && old.locked_day) { renderPlan(id); return; }
      if (VIEW === 'wait') updateWait(old);
      else if (VIEW === 'share') { const n = np.answers.length - old.answers.length; if (n > 0) toast(`${np.answers[np.answers.length - 1].name} just answered.`); }
    } catch (e) {}
  }, 5000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && P && VIEW === 'wait') titleCount(); });

/* ---------- share ---------- */
function viewShare(host) {
  const link = friendLink(P.id), hk = hostKey(P.id);
  const invite = `${P.title}${P.subtitle ? ': ' + P.subtitle : ''}\nWhich of these work? ${span(P.days)}. Tap your name and answer, takes ten seconds:\n${link}`;
  const c1 = h('button', { class: 'btn', text: 'Copy link', onclick: e => copy(link, e.currentTarget) });
  const hostLink = hk ? `${link}#h=${hk}` : '';
  return h('div', {}, bar(false, h('button', { class: 'link', text: 'Waiting room', onclick: () => go(`?p=${P.id}`) })),
    h('main', { class: 'cols' },
      h('aside', { class: 'side' }, (() => { const c = cardEl(P); tilt(c); return c; })(), h('p', { class: 'meta', text: 'This is what your friends see first.' })),
      h('section', { class: 'main' },
        h('div', {}, h('h1', { text: 'Send it.' }), h('p', { class: 'lead', text: 'iPhone, Android or computer. Friends open it and tap. No app, no account.' })),
        h('div', { class: 'linkbox' }, h('code', { text: link.replace(/^https?:\/\//, '') }), c1),
        h('div', { class: 'three' },
          h('button', { class: 'btn out', text: 'Copy invite text', onclick: e => copy(invite, e.currentTarget) }),
          h('a', { class: 'btn out', href: `mailto:?subject=${encodeURIComponent(P.title)}&body=${encodeURIComponent(invite)}`, text: 'Email' }),
          navigator.share ? h('button', { class: 'btn out', text: 'Share', onclick: () => navigator.share({ title: P.title, text: invite.split('\n').slice(0, 2).join(' '), url: link }).catch(() => {}) }) : h('button', { class: 'btn out', text: 'Show QR', onclick: () => qrSheet(link) })),
        hk && host ? h('div', { class: 'hostbox' }, h('h3', { text: 'Your host link' }), h('p', { class: 'meta', text: 'Keep this one to yourself. It is how you lock the night from another phone or computer. This browser remembers it already.' }),
          h('div', { class: 'opt' }, h('button', { class: 'btn ink sm', text: 'Copy host link', onclick: e => copy(hostLink, e.currentTarget) }))) : null,
        h('div', {}, h('button', { class: 'btn out', text: 'Open the waiting room', onclick: () => go(`?p=${P.id}`) })))));
}
function qrSheet(text) {
  const c = qrCanvas(text);
  sheet('Scan with a phone', c ? h('div', { class: 'qr' }, c, h('p', { class: 'meta', text: 'Point a phone camera at it.' })) : h('p', { class: 'meta', text: 'The link is too long for a QR code.' }));
}

/* ---------- friend answer ---------- */
function viewAnswer() {
  const mine = myAns(P.id);
  const st = stats(P);
  const A = { name: mine ? mine.name : null, votes: {}, picks: [] };
  if (mine) { const a = P.answers.find(x => x.id === mine.answer); if (a) { A.votes = { ...a.days }; A.picks = a.picks.slice(); A.name = a.name; } }
  const main = h('section', { class: 'main' });
  const sideCard = cardEl(P); tilt(sideCard);
  const from = P.host_name ? `From ${P.host_name}. ` : '';
  const by = P.answer_by ? `Answer by ${longd(P.answer_by)}.` : '';
  const root = h('div', {}, bar(false, mine || hostKey(P.id) ? h('button', { class: 'link', text: 'See the board', onclick: () => go(`?p=${P.id}&v=wait`) }) : null),
    h('main', { class: 'cols' }, h('aside', { class: 'side' }, sideCard, h('p', { class: 'meta', text: `${from}${by}`.trim() || null }), h('p', { class: 'meta', text: `${st.answered} answered. No app, no account. Takes ten seconds.` })), main));
  const who = () => {
    const taken = new Set(P.answers.map(a => a.name.trim().toLowerCase()));
    const names = [...new Set([...(P.names || []), ...P.answers.map(a => a.name)])];
    const join = h('input', { class: 'field', maxLength: 40, placeholder: 'Not on the list? Your name', 'aria-label': 'Your name', autocomplete: 'given-name', onkeydown: e => { if (e.key === 'Enter') joinGo(); } });
    const joinGo = () => { const v = join.value.trim(); if (!v) return join.focus(); if (taken.has(v.toLowerCase())) { toast(`${v} already answered. Add a last letter, like ${v} B.`); return; } A.name = v; vote(); };
    main.replaceChildren(h('h1', { text: 'Who are you?' }), names.length ? h('div', { class: 'who' }, names.map(n => { const done = taken.has(n.trim().toLowerCase()); return h('button', { class: 'tile', disabled: done, onclick: () => { A.name = n; vote(); } }, face(n), h('b', { text: n }), h('span', { class: 'meta', text: done ? '✓ Answered' : 'Tap to answer' })); })) : h('p', { class: 'lead', text: 'Write your name and tap the days you are free.' }),
      h('div', { class: 'opt' }, join, h('button', { class: 'btn', text: 'Join', onclick: joinGo })));
  };
  const vote = () => {
    // Friends tap the days they are free in a calendar of the host's period. Tap once: free. Twice: maybe. Three times: clear.
    // Drag across days to mark (or clear) many at once. Days left empty are saved as "no".
    const inPlan = new Set(P.days), t0 = today();
    const othersYes = d => P.answers.filter(a => a.days[d] === 'yes' && (!mine || a.id !== mine.answer));
    const first = pd(P.days[0]), last = pd(P.days[P.days.length - 1]);
    const wrap = h('div', { class: 'months ans' });
    for (let m = new Date(first.getFullYear(), first.getMonth(), 1); m <= last; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
      const g = h('div', { class: 'mgrid', role: 'grid' });
      ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(w => g.append(h('span', { class: 'micro wd', text: w })));
      // only the weeks that hold a day of the span, like the old wall calendar
      const lead = (m.getDay() + 6) % 7, mdays = [];
      for (let i = 0; i < lead; i++) mdays.push(null);
      for (let d = new Date(m); d.getMonth() === m.getMonth(); d = add(d, 1)) mdays.push(new Date(d));
      const weeks = []; for (let i = 0; i < mdays.length; i += 7) weeks.push(mdays.slice(i, i + 7));
      for (const wk of weeks) {
        if (!wk.some(d => d && inPlan.has(iso(d)))) continue;
        for (const d of wk) { if (!d) { g.append(h('span', { class: 'd blank' })); continue; }
        const s = iso(d), ok = inPlan.has(s) && d >= add(t0, -1), ys = ok ? othersYes(s) : [], n = ys.length;
        g.append(h('button', { class: 'd', 'data-d': ok ? s : null, disabled: !ok, 'aria-label': longd(s) + (n ? `, ${n} others can` : ''), title: n ? ys.map(a => a.name).join(', ') + ' can' : null },
          h('span', { class: 'dn', text: String(d.getDate()) }), n ? h('span', { class: 'fr' }, ys.slice(0, 3).map(a => face(a.name)), n > 3 ? h('b', { text: '+' + (n - 3) }) : null) : null));
        }
      }
      if (!g.querySelector('.d:not(.blank)')) continue;
      wrap.append(h('div', { class: 'month' }, h('h3', { text: `${MON[m.getMonth()]} ${m.getFullYear()}` }), g));
    }
    const cells = () => $$('.d[data-d]', wrap);
    const paintCell = b => { const v = A.votes[b.dataset.d]; b.classList.toggle('on', v === 'yes'); b.classList.toggle('mb', v === 'maybe'); b.setAttribute('aria-pressed', v === 'yes' ? 'true' : v === 'maybe' ? 'mixed' : 'false'); };
    const setV = (d, v) => { if (v) A.votes[d] = v; else A.votes[d] = undefined; const b = $(`.d[data-d="${d}"]`, wrap); if (b) paintCell(b); upd(); };
    const cycle = d => { const v = A.votes[d]; setV(d, v === 'yes' ? 'maybe' : v === 'maybe' ? null : 'yes'); };
    // pointer: a plain tap cycles, a drag paints
    let start = null, mode = null, moved = false;
    const at = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest ? el.closest('.d[data-d]') : null; };
    wrap.addEventListener('pointerdown', e => { const b = at(e); if (!b) return; e.preventDefault(); start = b; moved = false; mode = A.votes[b.dataset.d] ? null : 'yes'; if (e.pointerType !== 'mouse') wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', e => { if (!start) return; const b = at(e); if (!b || (b === start && !moved)) return; if (!moved) { moved = true; setV(start.dataset.d, mode); } if ((A.votes[b.dataset.d] || null) !== mode) setV(b.dataset.d, mode); });
    const end = () => { if (start && !moved) { cycle(start.dataset.d); start.focus({ preventScroll: true }); } start = null; };
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', () => { start = null; });
    wrap.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.d[data-d]'); if (b && e.detail === 0) cycle(b.dataset.d); }); // keyboard Enter/Space
    const cnt = h('span', { class: 'meta tab' });
    const save = h('button', { class: 'btn', text: mine ? 'Save changes' : 'Save my answer', onclick: () => send() });
    const upd = () => { const y = P.days.filter(d => A.votes[d] === 'yes').length, m = P.days.filter(d => A.votes[d] === 'maybe').length; cnt.textContent = y || m ? `${y} free${m ? `, ${m} if I have to` : ''}` : 'Tap the days you are free'; };
    const picks = P.options && P.options.length ? h('div', { class: 'stack' }, h('h2', { text: 'What should we do?' }), h('p', { class: 'meta', text: 'Pick as many as you like.' }),
      h('div', { class: 'picks' }, P.options.map((o, i) => h('button', { class: 'tile' + (A.picks.includes(i) ? ' on' : ''), 'aria-pressed': String(A.picks.includes(i)), text: o, onclick: e => { const k = A.picks.indexOf(i); if (k < 0) A.picks.push(i); else A.picks.splice(k, 1); e.currentTarget.classList.toggle('on', k < 0); e.currentTarget.setAttribute('aria-pressed', String(k < 0)); } })))) : null;
    const legend = h('div', { class: 'legend' }, h('span', {}, h('i', { class: 'd on' }), 'Free'), h('span', {}, h('i', { class: 'd mb' }), 'If I have to (tap twice)'), h('span', {}, face('A'), 'Friends who can'));
    main.replaceChildren(
      h('div', { class: 'idbar' }, face(A.name), h('span', { class: 'grow' }, mine ? 'Welcome back, ' : 'Answering as ', h('b', { text: A.name }), mine ? '. Change your answers?' : ''),
        h('button', { class: 'link', text: mine ? `Not ${A.name}? Switch` : 'Switch', onclick: () => { if (mine) { try { localStorage.removeItem('sl.a.' + P.id); } catch (e) {} renderPlan(P.id, 'answer'); } else who(); } })),
      h('div', {}, h('h1', { text: 'When are you free?' }), h('p', { class: 'lead', text: 'Tap the days you can. Tap twice for “if I have to”. Drag to mark many.' }), h('p', { class: 'meta hide-phone', text: 'Keys: arrows to move, Y free, M maybe, N clear.' }), tzNote()),
      wrap, legend, picks,
      h('div', { class: 'foot', style: { padding: '18px 0', margin: '0' } }, cnt, h('button', { class: 'link', text: "Can't make any", onclick: () => { P.days.forEach(d => { A.votes[d] = undefined; }); cells().forEach(paintCell); send(true); } }), h('span', { class: 'sp' }), save));
    $('.idbar .grow', main).style.flex = '1';
    cells().forEach(paintCell); upd();
    // keyboard: move by day or week across the plan's days
    const near = (d, step) => { let x = pd(d); for (let i = 0; i < 70; i++) { x = add(x, step); if (x > last || x < first) return null; const b = $(`.d[data-d="${iso(x)}"]`, wrap); if (b) return b; } return null; };
    wrap.addEventListener('keydown', e => {
      const b = e.target.closest && e.target.closest('.d[data-d]'); if (!b) return;
      const k = e.key.toLowerCase(), mv = { arrowright: 1, arrowleft: -1, arrowdown: 7, arrowup: -7 }[k];
      if (mv) { e.preventDefault(); const nb = near(b.dataset.d, mv) || (Math.abs(mv) === 7 ? near(b.dataset.d, Math.sign(mv)) : null); if (nb) nb.focus(); }
      else if (k === 'y' || k === 'm' || k === 'n' || k === 'backspace' || k === 'delete') { e.preventDefault(); setV(b.dataset.d, { y: 'yes', m: 'maybe' }[k] || null); }
    });
    main.onkeydown = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send(); } };
    async function send(none) {
      if (!none && !P.days.some(d => A.votes[d])) { toast("Tap the days you're free, or press Can't make any."); return; }
      const out = {}; P.days.forEach(d => { out[d] = A.votes[d] || 'no'; });
      save.disabled = true; save.textContent = 'Saving...';
      try {
        const r = await rpc('sl_answer', { p_id: P.id, p_name: A.name, p_days: out, p_picks: A.picks, p_answer: mine ? mine.answer : null, p_key: mine ? mine.key : null });
        store.set('sl.a.' + P.id, { answer: r.answer, key: r.key, name: A.name });
        P = await loadPlan(P.id); JUST = true; go(`?p=${P.id}&v=wait`, true);
      } catch (e) { save.disabled = false; save.textContent = 'Try again'; toast(e.message === 'plan is locked' ? 'The host just locked the date.' : e.message); }
    }
  };
  if (A.name) vote(); else who();
  return root;
}

/* ---------- waiting room ---------- */
function snapKey() { return 'sl.s.' + P.id; }
function sinceLine(st) {
  const snap = store.get(snapKey()); if (!snap) return null;
  const me = myAns(P.id);
  const fresh = P.answers.filter(a => (!me || a.id !== me.answer) && (!snap.ids[a.id] || snap.ids[a.id] !== a.updated_at)).map(a => a.name);
  const parts = [];
  if (fresh.length) parts.push(`${listNames(fresh)} ${fresh.length === 1 ? 'answered' : 'answered'}.`);
  if (st.lead && snap.lead !== st.lead) parts.push(`${short(st.lead)} took the lead.`);
  return parts.length ? 'Since you left: ' + parts.join(' ') : 'Nothing new since you last looked.';
}
const listNames = a => a.length <= 2 ? a.join(' and ') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
function saveSnap(st) { store.set(snapKey(), { ids: Object.fromEntries(P.answers.map(a => [a.id, a.updated_at])), lead: st.lead }); }
let BOARD_MODE = 'rank', SHOW_ALL = false, JUST = false;
const yourTurn = () => h('a', { class: 'row turn', href: BASE, style: { textDecoration: 'none', color: 'inherit' } }, h('img', { src: `${BASE}a/${KINDS[Object.keys(KINDS)[Math.floor(Math.random() * 6)]].obj}.webp`, alt: '', style: { width: '56px', height: '56px', objectFit: 'contain' } }), h('span', { class: 'grow' }, h('b', { text: 'Your turn next.' }), h('div', { class: 'meta', text: 'Plan a hangout in 20 seconds. Free, no account.' })), h('b', { text: '->' }));
function tzNote() { const tz = P && P.look && P.look.tz, me = Intl.DateTimeFormat().resolvedOptions().timeZone; if (!tz || tz === me || !/^[A-Za-z_]+\/[A-Za-z_\/-]+$/.test(tz)) return null; return h('p', { class: 'meta', text: `All days are in ${tz.split('/').pop().replace(/_/g, ' ')} time.` }); }
function viewWait(host) {
  const st = stats(P), me = myAns(P.id);
  const since = sinceLine(st); saveSnap(st);
  WATCH = { lead: st.lead, ids: new Set(P.answers.map(a => a.id)) };
  const L = lookOf(P);
  const headline = st.pending.length ? `${cap(word(st.answered))} in, ${word(st.pending.length)} to go` : st.answered ? `${cap(word(st.answered))} answered` : 'Waiting for answers';
  const dl = P.answer_by ? `They have until ${longd(P.answer_by)}. Then the leader is picked.` : host ? 'No deadline. You lock it when you are happy.' : 'The host locks it when everyone is in.';
  const poster = h('div', { class: 'poster' }, h('div', {}, h('div', { class: 'meta', text: P.title }), h('h1', { id: 'headline', text: headline }), h('p', { class: 'meta', text: dl })),
    L.kind !== 'letters' && L.kind !== 'photo' ? h('img', { src: `${BASE}a/${KINDS[L.kind].obj}.webp`, alt: '' }) : h('span', { class: 'brandmark', style: { font: '900 64px/1 var(--head)', color: '#fff' }, text: (P.title || 'S').trim().charAt(0).toUpperCase() }));
  const roster = h('div', { class: 'roster', id: 'roster' });
  const drawRoster = () => roster.replaceChildren(...P.answers.map(a => h('button', { class: 'person', 'data-n': a.name, onmouseenter: () => hl(a.name), onmouseleave: () => hl(null), onfocus: () => hl(a.name), onblur: () => hl(null) }, face(a.name), a.name)),
    ...stats(P).pending.map(n => h('button', { class: 'person', 'data-n': n, 'aria-label': `${n} has not answered. Poke them`, onclick: () => poke(n) }, h('span', { class: 'qface', text: '?' }), n)));
  drawRoster();
  const nudgeText = () => { const s = stats(P); return `${s.pending.length ? listNames(s.pending) + ', ' : ''}${P.title}: which days work? Tap your name, takes ten seconds. ${friendLink(P.id)}`; };
  const controls = host ? h('div', { class: 'stack' }, h('button', { class: 'btn wide', text: 'Nudge everyone', onclick: e => { copy(nudgeText(), e.currentTarget, 'Copied, paste it in the chat'); } }),
    h('button', { class: 'btn out wide', text: 'Copy link', onclick: e => copy(friendLink(P.id), e.currentTarget) }),
    h('div', { class: 'opt' }, h('button', { class: 'link', text: 'Share page', onclick: () => go(`?p=${P.id}&v=share`) }), h('span', { class: 'sp', style: { flex: 1 } }), h('button', { class: 'link', text: me ? 'Change my answer' : 'Add my own answer', onclick: () => go(`?p=${P.id}&v=answer`) })))
    : h('div', { class: 'stack' }, h('button', { class: 'btn wide', text: me ? 'Change my answer' : 'Answer', onclick: () => go(`?p=${P.id}&v=answer`) }), h('button', { class: 'btn out wide', text: 'Copy link for the group', onclick: e => copy(friendLink(P.id), e.currentTarget) }));
  const saved = JUST && !host; JUST = false;
  const main = h('section', { class: 'main' },
    saved ? h('div', { class: 'stack' }, h('div', { class: 'since' }, h('h3', { text: st.pending.length ? `You're in. Waiting on ${word(st.pending.length)} more.` : "You're in." }), h('p', { class: 'meta', text: 'Change your answer any time from this link.' })), yourTurn()) : null,
    h('div', { class: 'bhead' }, h('h2', { text: 'Leading' }), h('span', { class: 'live', id: 'live', text: `Live, ${st.answered} answered` }), h('span', { class: 'sp' }),
      h('div', { class: 'tabs', role: 'tablist' }, [['rank', 'Ranked'], ['grid', 'Full grid']].map(([k, t]) => h('button', { class: BOARD_MODE === k ? 'on' : '', role: 'tab', 'aria-selected': String(BOARD_MODE === k), text: t, onclick: () => { BOARD_MODE = k; renderPlan(P.id, 'wait'); } })))),
    since || (me && !host && !saved) ? h('div', { class: 'since', id: 'since', text: [me && !host && !saved ? `Welcome back, ${me.name}.` : '', since || ''].join(' ').trim() }) : null,
    h('div', { id: 'boardwrap' }, BOARD_MODE === 'grid' ? gridTable() : boardEl(st, host)),
    P.options && P.options.length ? h('div', { class: 'stack', id: 'optres' }, optResults()) : null);
  return h('div', {}, bar(false, host ? h('span', { class: 'micro', text: 'You are the host' }) : null),
    h('main', { class: 'cols' }, h('aside', { class: 'side' }, poster, h('div', { class: 'box' }, h('span', { class: 'micro', text: 'Who is in' }), roster, controls)), main));
}
function boardEl(st, host) {
  if (!st.answered) return h('div', { class: 'empty' }, h('h3', { text: 'No answers yet' }), h('p', { class: 'meta', text: 'Send the link to the group. The nights line up here as people answer.' }));
  const prev = WATCH.prevRank || {};
  const rows = (SHOW_ALL ? st.rows : st.rows.filter(r => r.s > 0).slice(0, 4));
  const b = h('div', { class: 'board', id: 'board' }, rows.map((r, i) => {
    const was = prev[r.d], arrow = was == null || was === i ? null : was > i ? h('i', { class: 'up', 'aria-label': 'moved up', text: '▲' }) : h('i', { class: 'dn', 'aria-label': 'moved down', text: '▼' });
    const yW = st.answered ? r.y.length / st.answered * 100 : 0, mW = st.answered ? r.m.length / st.answered * 100 : 0;
    return h('div', { class: 'lrow' + (i === 0 ? ' first' : '') + (gold(st, r, i) ? ' gold' : ''), 'data-d': r.d, 'data-yes': r.y.map(a => a.name).join('\n'), onmouseenter: () => hlRow(r), onmouseleave: () => hl(null) },
      h('span', { class: 'rk tab' }, String(i + 1), arrow),
      h('span', { class: 'dt' }, h('b', { class: 'tab', text: short(r.d).split(' ').slice(0, 2).join(' ') }), h('span', { class: 'meta', text: MON[pd(r.d).getMonth()] })),
      h('div', { class: 'bars' }, h('div', { class: 'track' }, h('span', { class: 'y', style: { width: yW + '%' } }), h('span', { class: 'm', style: { width: mW + '%' } })), h('div', { class: 'faces' }, r.y.slice(0, 8).map(a => face(a.name)))),
      h('div', { class: 'tally' }, h('b', { class: 'tab', text: `${r.y.length} free${r.m.length ? `, ${r.m.length} maybe` : ''}` }),
        host ? h('button', { class: 'btn sm lockbtn', text: 'Lock this day', onclick: () => lockAsk(r.d) }) : null));
  }));
  WATCH.prevRank = Object.fromEntries(st.rows.map((r, i) => [r.d, i]));
  const more = st.rows.length > 4 ? h('button', { class: 'link', text: SHOW_ALL ? 'Show the top 4' : `Show all ${st.rows.length} days`, onclick: () => { SHOW_ALL = !SHOW_ALL; renderPlan(P.id, 'wait'); } }) : null;
  return h('div', { class: 'stack' }, b, host ? h('button', { class: 'link only-phone', text: 'Pick the day now', onclick: () => st.lead && lockAsk(st.lead) }) : null, more);
}
function gridTable() {
  if (!P.answers.length) return h('div', { class: 'empty' }, h('p', { class: 'meta', text: 'No answers yet.' }));
  const lab = { yes: 'Y', maybe: '?', no: '-' };
  return h('div', { class: 'grid-table' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}), P.days.map(d => h('th', { scope: 'col', class: 'tab', text: short(d).split(' ').slice(0, 2).join(' ') })))),
    h('tbody', {}, P.answers.map(a => h('tr', {}, h('th', { scope: 'row', class: 'nm' }, face(a.name), a.name), P.days.map(d => { const v = a.days[d] || 'none'; return h('td', { class: v, 'aria-label': `${a.name}, ${short(d)}: ${v === 'none' ? 'no answer' : v}`, text: lab[v] || '' }); }))))));
}
function optResults() {
  const n = P.answers.length, c = P.options.map((o, i) => ({ o, k: P.answers.filter(a => a.picks.includes(i)).length })).sort((a, b) => b.k - a.k);
  return [h('h2', { text: 'What to do' }), h('div', { class: 'optres' }, c.map((x, i) => h('div', { class: 'row' + (i === 0 && x.k ? ' first' : '') }, h('b', { class: 'grow', text: x.o }), h('span', { class: 'meta tab', text: `${x.k} of ${n} picked it` }))))];
}
function hl(name) {
  $$('.person').forEach(p => p.classList.toggle('dim', !!name && p.dataset.n !== name));
  $$('.lrow').forEach(r => { const on = name && r.dataset.yes.split('\n').includes(name); r.classList.toggle('hl', !!on); r.classList.toggle('dim', !!name && !on); });
}
function hlRow(r) { const yes = new Set(r.y.map(a => a.name)); $$('.person').forEach(p => p.classList.toggle('dim', !yes.has(p.dataset.n))); }
function poke(n) {
  const lines = ROAST.map(f => f(n)); let k = Math.floor(Math.random() * lines.length);
  const q = h('p', { class: 'quote', 'aria-live': 'polite', text: lines[k] });
  sheet(`Poke ${n}`, q, h('button', { class: 'btn', text: 'Copy for the group chat', onclick: e => copy(`${q.textContent} ${friendLink(P.id)}`, e.currentTarget) }), h('button', { class: 'link', text: 'Another one', onclick: () => { k = (k + 1) % lines.length; q.textContent = lines[k]; } }));
}
function lockAsk(d) {
  const st = stats(P), r = st.rows.find(x => x.d === d);
  const s = sheet(`Lock ${longd(d)}?`, h('p', { class: 'lead', text: `${r.y.length} yes${r.m.length ? `, ${r.m.length} maybe` : ''}. Everyone with the link sees the date. You can unlock it again.` }),
    h('button', { class: 'btn', text: 'Lock it', onclick: async e => { e.currentTarget.disabled = true; try { P = await rpc('sl_host', { p_id: P.id, p_key: hostKey(P.id), p: { locked_day: d } }).then(fix); s.close(); renderPlan(P.id, 'locked'); setTimeout(() => confetti($('.locked')), 300); } catch (er) { toast(er.message); e.currentTarget.disabled = false; } } }),
    h('button', { class: 'link', text: 'Not yet', onclick: () => s.close() }));
}
const fix = p => { p.answers = (p.answers || []).map(a => ({ ...a, days: a.days || {}, picks: Array.isArray(a.picks) ? a.picks : [] })); return p; };
function updateWait(old) {
  const host = !!hostKey(P.id), st = stats(P);
  const before = Object.fromEntries($$('.lrow').map(r => [r.dataset.d, r.getBoundingClientRect().top]));
  const wrap = $('#boardwrap'); if (!wrap) return;
  wrap.replaceChildren(BOARD_MODE === 'grid' ? gridTable() : boardEl(st, host));
  if (!RM) $$('.lrow').forEach(r => { const b = before[r.dataset.d]; if (b == null) { r.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }); return; } const dy = b - r.getBoundingClientRect().top; if (dy) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' }); });
  const oldIds = new Set(old.answers.map(a => a.id));
  const roster = $('#roster'); if (roster) {
    roster.replaceChildren(...P.answers.map(a => h('button', { class: 'person' + (oldIds.has(a.id) ? '' : ' bust-in'), 'data-n': a.name, onmouseenter: () => hl(a.name), onmouseleave: () => hl(null) }, face(a.name), a.name)),
      ...st.pending.map(n => h('button', { class: 'person', 'data-n': n, onclick: () => poke(n) }, h('span', { class: 'qface', text: '?' }), n)));
  }
  const hd = $('#headline'); if (hd) hd.textContent = st.pending.length ? `${cap(word(st.answered))} in, ${word(st.pending.length)} to go` : `${cap(word(st.answered))} answered`;
  const lv = $('#live'); if (lv) lv.textContent = `Live, ${st.answered} answered`;
  const or = $('#optres'); if (or) or.replaceChildren(...optResults());
  const fresh = P.answers.filter(a => !oldIds.has(a.id));
  if (st.lead && WATCH.lead && st.lead !== WATCH.lead && !document.hidden) { toast(`New leader: ${longd(st.lead)}`); blip(); }
  else if (fresh.length && !document.hidden) toast(`${listNames(fresh.map(a => a.name))} just answered.`);
  WATCH.lead = st.lead; if (!document.hidden) saveSnap(st);
}

/* ---------- locked ---------- */
function viewLocked(host) {
  const d = P.locked_day, dd = pd(d), L = lookOf(P), A = P.answers;
  const yes = A.filter(a => a.days[d] === 'yes'), maybe = A.filter(a => a.days[d] === 'maybe');
  const n = diff(today(), dd), cd = n === 0 ? 'Tonight' : n === 1 ? 'Tomorrow' : n > 1 ? `${n} days to go` : 'That was a good one';
  const digits = h('div', { class: 'digits', 'aria-hidden': 'true' }, String(dd.getDate()).split('').map(x => h('img', { src: `${BASE}a/d_${x}.webp`, alt: '' })));
  const card = h('div', { class: 'locked' },
    h('div', {}, h('div', { class: 'meta', text: P.title }), h('h2', { class: 'tab', text: cd })),
    h('div', { class: 'lockup' }, L.kind !== 'letters' && L.kind !== 'photo' ? h('img', { class: 'obj', src: `${BASE}a/${KINDS[L.kind].obj}.webp`, alt: '' }) : h('span'), digits),
    h('div', { class: 'mon' }, WDL[dd.getDay()], h('br'), MON[dd.getMonth()]),
    h('span', { class: 'vh', text: `${longd(d)} ${dd.getFullYear()}` }),
    h('div', { class: 'stack' }, h('div', { class: 'faces' }, yes.slice(0, 10).map(a => face(a.name))),
      h('div', { class: 'acts' }, h('button', { class: 'btn white', text: 'Add to calendar', onclick: calMenu }), h('button', { class: 'btn white', text: 'Download card', onclick: e => png(e.currentTarget) }))));
  const opt = P.options && P.options.length && A.length ? (() => { const c = P.options.map((o, i) => ({ o, k: A.filter(a => a.picks.includes(i)).length })).sort((a, b) => b.k - a.k)[0]; return c.k ? h('div', { class: 'row' }, h('span', { class: 'grow' }, h('h3', { text: c.o }), h('span', { class: 'meta', text: `${c.k} of ${A.length} picked it` }))) : null; })() : null;
  const main = h('section', { class: 'main' },
    h('div', {}, h('h1', { text: `${WDL[dd.getDay()]} it is.` }), h('p', { class: 'lead', text: `${longd(d)}${P.start_time ? ', ' + P.start_time : ''}. ${yes.length} yes${maybe.length ? `, ${maybe.length} maybe` : ''}.` })),
    opt,
    h('div', { class: 'box' }, h('h2', { text: "Who's in" }), yes.length || maybe.length ? h('div', { class: 'roster' }, yes.map(a => h('span', { class: 'person' }, face(a.name), a.name)), maybe.map(a => h('span', { class: 'person' }, face(a.name), `${a.name} (maybe)`))) : h('p', { class: 'meta', text: 'Nobody said yes to this day yet.' })),
    h('div', { class: 'opt' }, h('button', { class: 'btn out', text: 'Copy plan text', onclick: e => copy(`${P.title}: ${longd(d)}${P.start_time ? ' at ' + P.start_time : ''}. ${friendLink(P.id)}`, e.currentTarget) }),
      host ? h('button', { class: 'link', style: { marginLeft: '16px' }, text: 'Unlock the date', onclick: async () => { try { P = fix(await rpc('sl_host', { p_id: P.id, p_key: hostKey(P.id), p: { locked_day: '' } })); renderPlan(P.id, 'wait'); } catch (e) { toast(e.message); } } }) : null));
  if (!host) main.append(yourTurn());
  return h('div', {}, bar(false, host ? h('span', { class: 'micro', text: 'You are the host' }) : null), h('main', { class: 'cols wide' }, h('aside', { class: 'side' }, card), main));
}
function planText() { const d = P.locked_day; return `${P.title}${P.subtitle ? ': ' + P.subtitle : ''}\n${longd(d)} ${pd(d).getFullYear()}${P.start_time ? ', ' + P.start_time : ''}\n${friendLink(P.id)}`; }
function calMenu() {
  const d = P.locked_day.replace(/-/g, ''), tz = P.look && P.look.tz;
  let dates; if (P.start_time && /^\d\d:\d\d$/.test(P.start_time)) { const s = pd(P.locked_day); const e = new Date(s.getFullYear(), s.getMonth(), s.getDate(), +P.start_time.slice(0, 2) + 3, +P.start_time.slice(3)); dates = `${d}T${P.start_time.replace(':', '')}00/${iso(e).replace(/-/g, '')}T${String(e.getHours()).padStart(2, '0')}${String(e.getMinutes()).padStart(2, '0')}00`; } else dates = `${d}/${iso(add(pd(P.locked_day), 1)).replace(/-/g, '')}`;
  const g = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: P.title, dates, details: (P.subtitle ? P.subtitle + '\n' : '') + friendLink(P.id), ...(tz ? { ctz: tz } : {}) });
  const s = sheet('Add to calendar', h('a', { class: 'btn wide', href: g, target: '_blank', rel: 'noopener noreferrer', text: 'Google Calendar' }), h('button', { class: 'btn out wide', text: 'Apple or Outlook (.ics file)', onclick: () => { ics(); s.close(); } }), h('button', { class: 'btn out wide', text: 'Copy plan details', onclick: e => copy(planText(), e.currentTarget) }));
}
function download(name, blob) { const u = URL.createObjectURL(blob), a = h('a', { href: u, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }
function ics() {
  if (!/^\d{4}-\d\d-\d\d$/.test(P.locked_day || '')) return;
  const d = P.locked_day.replace(/-/g, ''), esc = s => String(s).replace(/\r\n|\r|\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
  let dt;
  if (P.start_time && /^\d\d:\d\d$/.test(P.start_time)) { const t = P.start_time.replace(':', '') + '00', e = pd(P.locked_day); const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), +P.start_time.slice(0, 2) + 3, +P.start_time.slice(3)); dt = `DTSTART:${d}T${t}\r\nDTEND:${iso(end).replace(/-/g, '')}T${String(end.getHours()).padStart(2, '0')}${String(end.getMinutes()).padStart(2, '0')}00`; }
  else dt = `DTSTART;VALUE=DATE:${d}\r\nDTEND;VALUE=DATE:${iso(add(pd(P.locked_day), 1)).replace(/-/g, '')}`;
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Say Less//EN', 'BEGIN:VEVENT', `UID:${P.id}-${d}@sayless.webspind.com`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, dt, `SUMMARY:${esc(P.title)}`, `DESCRIPTION:${esc((P.subtitle ? P.subtitle + '\n' : '') + friendLink(P.id))}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  download(`${P.title.replace(/[^\w\- ]+/g, '').trim() || 'plan'}.ics`, new Blob([body], { type: 'text/calendar' }));
}
async function png(btn) {
  btn.disabled = true;
  try {
    await document.fonts.load('900 80px Rubik'); const L = lookOf(P), W = 1080, H = 1350, c = h('canvas', { width: W, height: H }), x = c.getContext('2d'), dd = pd(P.locked_day);
    x.fillStyle = L.col; x.fillRect(0, 0, W, H);
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = s; });
    if (L.kind === 'photo') { const i = await load(L.photo); if (i) { const s = Math.max(W / i.width, H / i.height); x.drawImage(i, (W - i.width * s) / 2, (H - i.height * s) / 2, i.width * s, i.height * s); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, 0, W, H); } }
    else if (L.kind !== 'letters') { const i = await load(`${BASE}a/${KINDS[L.kind].obj}.webp`); if (i) { const s = 560 / Math.max(i.width, i.height); x.drawImage(i, (W - i.width * s) / 2, 150, i.width * s, i.height * s); } }
    x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
    x.font = '900 92px Rubik'; wrap(x, P.title, 80, 880, W - 160, 92);
    x.font = '800 54px Rubik'; x.fillText(`${WDL[dd.getDay()]} ${dd.getDate()} ${MON[dd.getMonth()]}${P.start_time ? ', ' + P.start_time : ''}`, 80, 1190);
    x.font = '700 34px Jakarta, sans-serif'; x.fillText('Say Less', 80, 1270);
    c.toBlob(b => { download(`${P.title.replace(/[^\w\- ]+/g, '').trim() || 'plan'}.png`, b); btn.disabled = false; }, 'image/png');
  } catch (e) { btn.disabled = false; toast('Could not make the card.'); }
}
function wrap(x, t, X, Y, w, lh) { const words = t.split(/\s+/), lines = []; let l = ''; for (const wd of words) { const tt = l ? l + ' ' + wd : wd; if (x.measureText(tt).width > w && l) { lines.push(l); l = wd; } else l = tt; } lines.push(l); lines.slice(0, 3).forEach((s, i) => x.fillText(s, X, Y - (Math.min(lines.length, 3) - 1 - i) * lh)); }

/* ---------- QR (byte mode, ECC level M, versions 1 to 10). Small self-made encoder, no third-party code. ---------- */
function qrCanvas(text) {
  const data = new TextEncoder().encode(text);
  const CAP = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216]; // data codewords, level M
  const EC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // ec codewords per block
  const BL = [0, [1, 0], [1, 0], [1, 0], [2, 0], [2, 0], [4, 0], [4, 0], [2, 2], [3, 2], [4, 1]]; // [g1 blocks, g2 blocks]
  let v = 1; while (v <= 10 && CAP[v] < data.length + 3) v++; if (v > 10) return null;
  const bits = []; const put = (n, l) => { for (let i = l - 1; i >= 0; i--) bits.push((n >> i) & 1); };
  put(4, 4); put(data.length, v < 10 ? 8 : 16); data.forEach(b => put(b, 8)); put(0, Math.min(4, CAP[v] * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const cw = []; for (let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let p = 0; cw.length < CAP[v]; p++) cw.push(p % 2 ? 17 : 236);
  const EXP = [], LOG = []; for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 285; }
  const mul = (a, b) => a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
  const gen = n => { let g = [1]; for (let i = 0; i < n; i++) { const ng = Array(g.length + 1).fill(0); g.forEach((c, j) => { ng[j] ^= c; ng[j + 1] ^= mul(c, EXP[i]); }); g = ng; } return g; };
  const ecOf = (blk, n) => { const g = gen(n), r = blk.concat(Array(n).fill(0)); for (let i = 0; i < blk.length; i++) { const c = r[i]; if (c) g.forEach((gc, j) => { r[i + j] ^= mul(gc, c); }); } return r.slice(blk.length); };
  const [g1, g2] = BL[v], nb = g1 + g2, base = Math.floor(CAP[v] / nb), blocks = [];
  let off = 0; for (let b = 0; b < nb; b++) { const len = base + (b >= g1 ? 1 : 0); blocks.push(cw.slice(off, off + len)); off += len; }
  const ecs = blocks.map(b => ecOf(b, EC[v])), out = [];
  for (let i = 0; i < base + 1; i++) blocks.forEach(b => { if (i < b.length) out.push(b[i]); });
  for (let i = 0; i < EC[v]; i++) ecs.forEach(e => out.push(e[i]));
  const N = v * 4 + 17, M = [...Array(N)].map(() => Array(N).fill(null)), R = [...Array(N)].map(() => Array(N).fill(false));
  const set = (r, c, val) => { M[r][c] = val; R[r][c] = true; };
  const finder = (r, c) => { for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) { const rr = r + i, cc = c + j; if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue; set(rr, cc, i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))); } };
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  for (let i = 8; i < N - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const AP = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]][v];
  const LA = AP.length - 1; AP.forEach((r, ri) => AP.forEach((c, ci) => { if ((ri === 0 && ci === 0) || (ri === 0 && ci === LA) || (ri === LA && ci === 0)) return; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) set(r + i, c + j, Math.max(Math.abs(i), Math.abs(j)) !== 1); }));
  for (let i = 0; i < 9; i++) { R[8][i] = R[i][8] = true; } for (let i = 0; i < 8; i++) { R[8][N - 1 - i] = R[N - 1 - i][8] = true; }
  set(N - 8, 8, true);
  if (v >= 7) { let vb = v << 12, rem = v; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1F25); vb |= rem; for (let i = 0; i < 18; i++) { const b = ((vb >> i) & 1) === 1, a = Math.floor(i / 3), c = i % 3 + N - 11; set(a, c, b); set(c, a, b); } }
  const ab = []; out.forEach(b => { for (let i = 7; i >= 0; i--) ab.push((b >> i) & 1); });
  let k = 0, up = true;
  for (let c = N - 1; c > 0; c -= 2) { if (c === 6) c--; for (let t = 0; t < N; t++) { const r = up ? N - 1 - t : t; for (let d = 0; d < 2; d++) { const cc = c - d; if (!R[r][cc]) { M[r][cc] = k < ab.length ? ab[k] === 1 : false; k++; } } } up = !up; }
  const mask = (r, c) => (r + c) % 2 === 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!R[r][c] && mask(r, c)) M[r][c] = !M[r][c];
  let f = (0 << 3) | 0; let rem = f; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537); f = ((f << 10) | rem) ^ 0x5412;
  const fb = i => ((f >> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) M[i][8] = fb(i); M[7][8] = fb(6); M[8][8] = fb(7); M[8][7] = fb(8); for (let i = 9; i < 15; i++) M[8][14 - i] = fb(i);
  for (let i = 0; i < 8; i++) M[8][N - 1 - i] = fb(i); for (let i = 8; i < 15; i++) M[N - 15 + i][8] = fb(i);
  const q = 4, sc = 8, cv = h('canvas', { width: (N + q * 2) * sc, height: (N + q * 2) * sc, 'aria-label': 'QR code for the link', role: 'img' }), x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#0A0B0F';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (M[r][c]) x.fillRect((c + q) * sc, (r + q) * sc, sc, sc);
  return cv;
}

/* ---------- router ---------- */
function go(q, replace) { history[replace ? 'replaceState' : 'pushState'](null, '', BASE + q); route(); }
function route() {
  clearInterval(POLL);
  const u = new URLSearchParams(location.search), id = u.get('p');
  const m = /[#&]h=([a-z0-9]{10,40})/.exec(location.hash);
  if (id && m) {
    history.replaceState(null, '', location.pathname + location.search);
    // only keep a host key the server accepts, and never replace one that already works
    if (m[1] !== hostKey(id)) { rpc('sl_host', { p_id: id, p_key: m[1], p: {} }).then(() => { store.set('sl.h.' + id, m[1]); if (P && P.id === id) renderPlan(id); }, () => toast('That host link is not valid for this plan.')); }
  }
  if (id && /^[a-z0-9]{6,20}$/.test(id)) { const v = u.get('v'); renderPlan(id, ['share', 'answer', 'wait'].includes(v) ? v : null); }
  else { P = null; VIEW = 'create'; $('#app').replaceChildren(renderCreate()); }
}
addEventListener('popstate', route);
route();
