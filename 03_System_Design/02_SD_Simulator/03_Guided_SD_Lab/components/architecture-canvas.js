// Architecture canvas: draws an architecture (from LAB.Progression), animates how it changes between stages,
// supports zoom / pan / fit, and gives the flow visualizer packets, marks and chips to work with.
// Colours come from CSS classes (cat-*, k-*, tone-*), so the drawing follows the light / dark theme.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 166, H = 56;
  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  }
  function text(parent, x, y, str, cls, anchor = 'start') {
    const t = el('text', { x, y, class: cls, 'text-anchor': anchor, 'dominant-baseline': 'central' }, parent);
    t.textContent = str;
    return t;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  // Where the line from a node's centre towards (tx, ty) leaves its outline, plus a small gap.
  function edgePoint(n, tx, ty, gap = 5) {
    const dx = tx - n.x, dy = ty - n.y, hw = n.w / 2 + gap, hh = n.h / 2 + gap;
    const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return [n.x + dx * t, n.y + dy * t];
  }

  let seq = 0;
  LAB.Canvas = class {
    constructor(svg, { onSelect } = {}) {
      this.svg = svg;
      this.uid = `cv${++seq}`; // marker ids must be unique per canvas on the page
      this.onSelect = onSelect;
      this.clock = new LAB.Clock();
      this.pos = {};
      this.edgeEls = {};
      this.nodeEls = {};
      svg.innerHTML = '';
      const defs = el('defs', {}, svg);
      for (const k of ['sync', 'async', 'gone']) {
        const m = el('marker', { id: `${this.uid}-${k}`, class: `m-${k}`, viewBox: '0 0 10 10', refX: 8.5, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 11, markerHeight: 11, orient: 'auto-start-reverse' }, defs);
        el('path', { d: 'M0 0L10 5L0 10z' }, m);
      }
      this.gEdges = el('g', { class: 'edges' }, svg);
      this.gLabels = el('g', { class: 'labels' }, svg);
      this.gNodes = el('g', { class: 'nodes' }, svg);
      this.gFx = el('g', { class: 'fx' }, svg);
      this.vb = { x: 0, y: 0, w: 1100, h: 600 };
      this.bindZoom();
      svg.addEventListener('click', e => {
        const n = e.target.closest('.node');
        if (n && !this.dragged) this.onSelect?.(n.dataset.id);
      });
    }

    // ---------- drawing ----------
    // Draw `arch` in its final state. Options: prev (architecture to animate from), fresh (diff to badge as new),
    // going (ids that the next stage removes, drawn as leaving).
    async render(arch, { prev = null, fresh = null, going = null } = {}) {
      this.clock.cancel();
      const animate = prev && !LAB.reducedMotion();
      const old = animate ? { pos: { ...this.pos }, vb: { ...this.vb } } : null;
      this.arch = arch;
      this.clearFlow();
      this.gEdges.replaceChildren(); this.gLabels.replaceChildren(); this.gNodes.replaceChildren();
      this.pos = {}; this.edgeEls = {}; this.nodeEls = {};
      for (const n of Object.values(arch.nodes)) this.drawNode(n, fresh?.addedNodes.includes(n.id), going?.includes(n.id));
      for (const e of Object.values(arch.edges)) this.drawEdge(e, fresh?.addedEdges.includes(e.id), going?.includes(e.id));
      this.layoutEdges();
      this.select(this.selected && arch.nodes[this.selected] ? this.selected : null);
      const target = this.fitBox();
      if (!animate) { this.setVB(target); return; }
      try { await this.build(prev, old, target, fresh); }
      catch (e) { if (!(e instanceof LAB.Cancelled)) throw e; this.finish(target); }
    }
    drawNode(n, isNew, isGoing) {
      const g = el('g', { class: `node cat-${n.category ?? 'service'}${n.ghost ? ' ghost' : ''}${n.ext ? ' ext' : ''}${isNew ? ' new' : ''}${isGoing ? ' going' : ''}`, 'data-id': n.id, tabindex: 0, role: 'button', 'aria-label': `${n.label}: inspect` }, this.gNodes);
      const w = n.w ?? W, h = H;
      el('rect', { class: 'nb', x: -w / 2, y: -h / 2, width: w, height: h, rx: 10 }, g);
      el('circle', { class: 'ic', cx: -w / 2 + 23, cy: 0, r: 15 }, g);
      text(g, -w / 2 + 23, 1, n.icon ?? '•', 'ici', 'middle');
      text(g, -w / 2 + 45, n.sub ? -9 : 0, n.label, 'nl');
      if (n.sub) text(g, -w / 2 + 45, 10, n.sub, 'ns');
      if (isNew) {
        const b = el('g', { class: 'badge', transform: `translate(${w / 2 - 20} ${-h / 2})` }, g);
        el('rect', { x: -19, y: -9, width: 38, height: 18, rx: 9 }, b);
        text(b, 0, .5, 'NEW', '', 'middle');
      }
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onSelect?.(n.id); } });
      this.nodeEls[n.id] = g;
      this.pos[n.id] = { x: n.x, y: n.y, w, h, s: 1 };
      this.place(n.id);
    }
    drawEdge(e, isNew, isGoing) {
      const g = el('g', { class: `edge k-${e.kind}${isNew ? ' new' : ''}${isGoing ? ' going' : ''}`, 'data-id': e.id }, this.gEdges);
      const p = el('path', { class: 'ep', 'marker-end': `url(#${this.uid}-${isGoing ? 'gone' : e.kind})` }, g);
      let lab = null;
      if (e.label) {
        lab = el('g', { class: `el k-${e.kind}${isNew ? ' new' : ''}${isGoing ? ' going' : ''}` }, this.gLabels);
        lab.r = el('rect', { y: -10, height: 20, rx: 10 }, lab);
        lab.t = text(lab, 0, .5, e.label, '', 'middle');
      }
      this.edgeEls[e.id] = { g, p, lab, e };
    }
    place(id) {
      const p = this.pos[id];
      this.nodeEls[id]?.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${p.s})`);
    }
    geom(e) {
      const A = this.pos[e.from], B = this.pos[e.to];
      if (!A || !B) return null;
      if (!e.bend) {
        const p1 = edgePoint(A, B.x, B.y), p2 = edgePoint(B, A.x, A.y);
        const t = e.labelAt ?? .5;
        return { d: `M${p1}L${p2}`, mid: [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)] };
      }
      // Curved connection: bend is the sideways offset of the control point from the midpoint.
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const c = [mx - dy / len * e.bend, my + dx / len * e.bend];
      const p1 = edgePoint(A, ...c), p2 = edgePoint(B, ...c), t = e.labelAt ?? .5;
      const q = (i) => (1 - t) ** 2 * p1[i] + 2 * (1 - t) * t * c[i] + t * t * p2[i];
      return { d: `M${p1}Q${c} ${p2}`, mid: [q(0), q(1)] };
    }
    layoutEdges() {
      for (const { p, lab, e } of Object.values(this.edgeEls)) {
        const g = this.geom(e);
        if (!g) continue;
        p.setAttribute('d', g.d);
        if (lab) {
          const w = e.label.length * 6.3 + 16;
          lab.r.setAttribute('x', -w / 2); lab.r.setAttribute('width', w);
          lab.setAttribute('transform', `translate(${g.mid[0]} ${g.mid[1]})`);
        }
      }
    }

    // ---------- stage-change animation ----------
    async build(prev, old, target, fresh) {
      const c = this.clock;
      const added = new Set(fresh?.addedNodes ?? []), addedE = new Set(fresh?.addedEdges ?? []);
      // 1. what leaves: old connections and components fade out
      const ghosts = el('g', { class: 'ghosts' }, this.gEdges);
      const leaving = [];
      for (const e of Object.values(prev.edges)) if (!this.arch.edges[e.id] || addedE.has(e.id)) {
        const A = old.pos[e.from], B = old.pos[e.to];
        if (A && B) leaving.push(el('path', { class: `ep gone-path k-${e.kind}`, d: `M${edgePoint(A, B.x, B.y)}L${edgePoint(B, A.x, A.y)}` }, ghosts));
      }
      // 2. components that stay start where they were; new ones start invisible
      for (const id of Object.keys(this.pos)) {
        if (added.has(id)) { this.pos[id].s = .01; this.nodeEls[id].style.opacity = 0; }
        else if (old.pos[id]) Object.assign(this.pos[id], { x0: old.pos[id].x, y0: old.pos[id].y, x1: this.pos[id].x, y1: this.pos[id].y, x: old.pos[id].x, y: old.pos[id].y });
        this.place(id);
      }
      for (const [id, x] of Object.entries(this.edgeEls)) if (addedE.has(id)) { x.g.style.opacity = 0; if (x.lab) x.lab.style.opacity = 0; }
      this.layoutEdges();
      this.setVB(old.vb);
      if (leaving.length) await c.tween(380, t => leaving.forEach(p => p.style.opacity = 1 - t));
      ghosts.remove();
      // 3. move and re-frame together
      const v0 = old.vb;
      await c.tween(650, t => {
        for (const p of Object.values(this.pos)) if (p.x1 != null) { p.x = lerp(p.x0, p.x1, t); p.y = lerp(p.y0, p.y1, t); }
        for (const id of Object.keys(this.pos)) this.place(id);
        this.layoutEdges();
        this.setVB({ x: lerp(v0.x, target.x, t), y: lerp(v0.y, target.y, t), w: lerp(v0.w, target.w, t), h: lerp(v0.h, target.h, t) });
      });
      // 4. new components pop in, then their connections draw
      for (const id of added) {
        this.nodeEls[id].style.opacity = 1;
        await c.tween(320, t => { this.pos[id].s = .01 + .99 * t; this.place(id); });
      }
      const drawn = [...addedE].map(id => this.edgeEls[id]).filter(Boolean);
      for (const x of drawn) { x.len = x.p.getTotalLength() || 1; x.g.style.opacity = 1; x.p.style.strokeDasharray = x.len; }
      await c.tween(520, t => drawn.forEach(x => x.p.style.strokeDashoffset = x.len * (1 - t)));
      for (const x of drawn) { x.p.style.strokeDasharray = ''; x.p.style.strokeDashoffset = ''; if (x.lab) x.lab.style.opacity = 1; }
      this.finish(target);
    }
    // Snap to the final state (end of the animation, or when it was interrupted).
    finish(target) {
      this.gEdges.querySelector('.ghosts')?.remove();
      for (const [id, p] of Object.entries(this.pos)) {
        if (p.x1 != null) { p.x = p.x1; p.y = p.y1; delete p.x0; delete p.y0; delete p.x1; delete p.y1; }
        p.s = 1; this.place(id); this.nodeEls[id].style.opacity = '';
      }
      for (const x of Object.values(this.edgeEls)) { x.g.style.opacity = ''; x.p.style.strokeDasharray = ''; x.p.style.strokeDashoffset = ''; if (x.lab) x.lab.style.opacity = ''; }
      this.layoutEdges();
      this.setVB(target);
    }

    // ---------- selection ----------
    select(id) {
      this.selected = id;
      for (const [k, g] of Object.entries(this.nodeEls)) g.classList.toggle('selected', k === id);
    }

    // ---------- zoom / pan ----------
    setVB(v) { this.vb = { ...v }; this.svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); }
    fitBox() {
      const ps = Object.values(this.pos);
      if (!ps.length) return { x: 0, y: 0, w: 1100, h: 600 };
      let x0 = Math.min(...ps.map(p => p.x - p.w / 2)), x1 = Math.max(...ps.map(p => p.x + p.w / 2));
      let y0 = Math.min(...ps.map(p => p.y - p.h / 2)) - 34, y1 = Math.max(...ps.map(p => p.y + p.h / 2)) + 20;
      // curved connections and their labels can reach outside the boxes
      for (const g of [this.gEdges, this.gLabels]) {
        const b = g.childElementCount ? g.getBBox() : null;
        if (b?.width) { x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x + b.width); y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y + b.height); }
      }
      // keep small architectures from being blown up to giant boxes
      const minW = 760, minH = 420;
      if (x1 - x0 < minW) { const d = (minW - (x1 - x0)) / 2; x0 -= d; x1 += d; }
      if (y1 - y0 < minH) { const d = (minH - (y1 - y0)) / 2; y0 -= d; y1 += d; }
      const pad = 36;
      return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
    }
    fit() { this.setVB(this.fitBox()); }
    zoom(k, cx = this.vb.x + this.vb.w / 2, cy = this.vb.y + this.vb.h / 2) {
      const v = this.vb, w = Math.min(4000, Math.max(260, v.w * k)), r = w / v.w;
      this.setVB({ x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r, w, h: v.h * r });
    }
    toSvg(e) {
      const m = this.svg.getScreenCTM().inverse();
      return [m.a * e.clientX + m.c * e.clientY + m.e, m.b * e.clientX + m.d * e.clientY + m.f];
    }
    bindZoom() {
      const svg = this.svg;
      svg.addEventListener('wheel', e => {
        e.preventDefault();
        this.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, ...this.toSvg(e));
      }, { passive: false });
      let start = null;
      svg.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        start = { vb: { ...this.vb }, cx: e.clientX, cy: e.clientY };
        this.dragged = false;
      });
      addEventListener('pointermove', e => {
        if (!start) return;
        if (!this.dragged && Math.hypot(e.clientX - start.cx, e.clientY - start.cy) < 4) return;
        if (!this.dragged) { this.dragged = true; svg.setPointerCapture?.(e.pointerId); svg.classList.add('panning'); }
        // viewBox units per screen pixel (the SVG scales with "meet", so the larger ratio wins)
        const r = svg.getBoundingClientRect(), s = Math.max(start.vb.w / r.width, start.vb.h / r.height);
        this.setVB({ ...start.vb, x: start.vb.x - (e.clientX - start.cx) * s, y: start.vb.y - (e.clientY - start.cy) * s });
      });
      addEventListener('pointerup', () => { start = null; svg.classList.remove('panning'); setTimeout(() => { this.dragged = false; }, 0); });
    }

    // ---------- flow visuals ----------
    clearFlow() {
      this.gFx.replaceChildren();
      this.svg.classList.remove('flowing');
      for (const g of Object.values(this.nodeEls)) { g.classList.remove('lit', 'mark-ok', 'mark-fail', 'mark-warn', 'mark-down', 'mark-active'); g.querySelector('.fchip')?.remove(); }
      for (const x of Object.values(this.edgeEls)) { x.g.classList.remove('live', 'lit', 'tone-req', 'tone-res', 'tone-async', 'tone-cache', 'tone-fail', 'tone-ok', 'tone-info'); x.lab?.classList.remove('lit'); }
    }
    focus(on) { this.svg.classList.toggle('flowing', on); }
    // edges: also keep the connections along the path lit (for steps that already happened)
    light(ids, edges = false) {
      for (const id of ids) this.nodeEls[id]?.classList.add('lit');
      if (edges) for (let i = 0; i < ids.length - 1; i++) { const [x] = this.edgeBetween(ids[i], ids[i + 1]); x?.g.classList.add('lit'); x?.lab?.classList.add('lit'); }
    }
    mark(id, m) {
      const g = this.nodeEls[id];
      if (!g) return;
      g.classList.remove('mark-ok', 'mark-fail', 'mark-warn', 'mark-down', 'mark-active');
      if (m) g.classList.add(`mark-${m}`);
    }
    // A status chip pinned above a component (cache HIT, consumer lag, chosen instance...).
    chip(id, str, tone = 'info') {
      const g = this.nodeEls[id], p = this.pos[id];
      if (!g) return;
      g.querySelector('.fchip')?.remove();
      if (str == null) return;
      const c = el('g', { class: `fchip tone-${tone}`, transform: `translate(0 ${-p.h / 2 - 15})` }, g);
      const w = str.length * 6.6 + 18;
      el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11 }, c);
      text(c, 0, .5, str, '', 'middle');
    }
    edgeBetween(a, b) {
      for (const x of Object.values(this.edgeEls)) {
        if (x.e.from === a && x.e.to === b) return [x, false];
        if (x.e.from === b && x.e.to === a) return [x, true];
      }
      return [null, false];
    }
    packet(label, tone) {
      const g = el('g', { class: `pk tone-${tone}` }, this.gFx);
      const w = Math.max(28, label.length * 6.9 + 18);
      g.r = el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11 }, g);
      g.t = text(g, 0, .5, label, '', 'middle');
      return g;
    }
    relabel(pk, label, tone) {
      const w = Math.max(28, label.length * 6.9 + 18);
      pk.r.setAttribute('x', -w / 2); pk.r.setAttribute('width', w);
      pk.t.textContent = label;
      pk.setAttribute('class', `pk tone-${tone}`);
    }
    // Carry a message along a chain of components: { p: ['client', 'lb', 'app'], l: 'GET /4c92', k: 'req',
    // ret?: 'label for the reply', fail?: true (the last hop is refused and bounces back), delay?: ms before it starts }.
    async travel(tr, clock) {
      if (tr.delay) await clock.wait(tr.delay);
      const ms = tr.ms ?? 620;
      const tone = tr.k ?? 'req';
      const pk = this.packet(tr.l, tone);
      const hops = [];
      for (let i = 0; i < tr.p.length - 1; i++) hops.push([tr.p[i], tr.p[i + 1]]);
      if (tr.ret) for (let i = tr.p.length - 1; i > 0; i--) hops.push([tr.p[i], tr.p[i - 1], true]);
      this.light(tr.p);
      for (let h = 0; h < hops.length; h++) {
        const [a, b, back] = hops[h];
        if (back && h === tr.p.length - 1) this.relabel(pk, tr.ret, tr.rk ?? 'res');
        const [x, rev] = this.edgeBetween(a, b);
        if (!x) { console.warn(`Flow hop ${a} → ${b} has no connection in this stage`); continue; }
        const len = x.p.getTotalLength(), at = t => x.p.getPointAtLength(rev ? len * (1 - t) : len * t);
        const curTone = back ? (tr.rk ?? 'res') : tone;
        x.g.classList.add('live', 'lit', `tone-${curTone}`);
        x.lab?.classList.add('lit');
        const lastHop = h === hops.length - 1;
        if (tr.fail && lastHop) {
          await clock.tween(ms * .55, t => { const q = at(t * .55); pk.setAttribute('transform', `translate(${q.x} ${q.y})`); });
          this.relabel(pk, tr.l, 'fail');
          const q0 = at(.55);
          await clock.tween(380, t => pk.setAttribute('transform', `translate(${q0.x + Math.sin(t * Math.PI * 6) * 6 * (1 - t)} ${q0.y})`), true);
          await clock.tween(ms * .45, t => { const q = at(.55 * (1 - t)); pk.setAttribute('transform', `translate(${q.x} ${q.y})`); });
        } else {
          await clock.tween(ms, t => { const q = at(t); pk.setAttribute('transform', `translate(${q.x} ${q.y})`); });
        }
        x.g.classList.remove('live', `tone-${curTone}`);
      }
      pk.remove();
    }
  };
})();
