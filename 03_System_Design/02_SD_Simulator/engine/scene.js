// SVG scene helpers and a pausable, speed-aware animation clock for the System Design pages.
// Ported from the Kafka Learn lessons; classic script (no modules) so pages also work when opened from disk.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  class Cancelled extends Error {}

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  }
  function place(n, x, y, s = n._s ?? 1) {
    n._x = x; n._y = y; n._s = s;
    n.setAttribute('transform', `translate(${x} ${y}) scale(${s})`);
    return n;
  }
  const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

  class Clock {
    constructor() { this.speed = 1; this.paused = false; this.instant = false; this.token = 0; }
    cancel() { this.token++; }
    // Resolves after `ms` of unpaused, speed-scaled time; rejects with Cancelled when the scene resets.
    tween(ms, fn = () => {}, linear = false) {
      if (this.instant) { fn(1); return Promise.resolve(); }
      const token = this.token;
      return new Promise((resolve, reject) => {
        let elapsed = 0, last = performance.now();
        const frame = now => {
          if (token !== this.token) return reject(new Cancelled());
          if (!this.paused) elapsed += (now - last) * this.speed;
          last = now;
          const t = Math.min(1, elapsed / ms);
          fn(linear ? t : ease(t));
          t < 1 ? requestAnimationFrame(frame) : resolve();
        };
        requestAnimationFrame(frame);
      });
    }
  }

  const TONES = {
    ok: { stroke: '#348747', fill: '#f1f9ee' },
    fail: { stroke: '#ce3434', fill: '#fff4f4' },
    warn: { stroke: '#c47d1e', fill: '#fdf6ea' },
  };

  class Stage {
    constructor(svg) { this.svg = svg; this.clock = new Clock(); this.reset(); }
    reset() {
      this.clock.cancel();
      this.svg.replaceChildren();
      const defs = el('defs', {}, this.svg);
      const marker = el('marker', { id: 'sd-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0 0L10 5L0 10z', fill: '#9aa3a9' }, marker);
      this.back = el('g', { class: 'sd-back' }, this.svg);
      this.wires = el('g', { class: 'sd-wires' }, this.svg);
      this.root = el('g', {}, this.svg);
      this.top = el('g', { class: 'sd-top' }, this.svg);
      this.fx = el('g', { class: 'sd-fx' }, this.svg);
      this.nodes = {};
      this.links = {};
    }

    // ---- shapes ----
    g(x = 0, y = 0, parent = this.root, attrs = {}) { return place(el('g', attrs, parent), x, y, 1); }
    text(parent, x, y, str, attrs = {}) {
      const t = el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', ...attrs }, parent);
      t.textContent = str;
      return t;
    }
    box(x, y, w, h, label, { parent = this.root, fill = '#fff', stroke = '#babdbe', color = '#203347', size = 14, weight = 600, dash, rx = 6, sub, subSize = 11 } = {}) {
      const g = this.g(x, y, parent, { class: 'sd-box' });
      g.rect = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx, fill, stroke, 'stroke-width': 1.4, 'stroke-dasharray': dash }, g);
      if (label) g.label = this.text(g, 0, sub ? -(subSize + size) * .4 : 0, label, { 'font-size': size, 'font-weight': weight, fill: color });
      if (sub) g.sub = this.text(g, 0, (subSize + size) * .45, sub, { 'font-size': subSize, fill: '#7b878f' });
      return g;
    }
    // A component of the architecture: icon disc, name, one-line role. Remembered by id for wires and packets.
    // ext: a system we don't own (payment provider, email service), drawn with a dashed outline.
    node(id, { x, y, w = 170, h = 58, label, sub, icon, color = '#4f7bd9', soft = '#eef3fd', ext = false }) {
      const g = this.g(x, y, this.root, { class: 'sd-node', 'data-id': id });
      Object.assign(g, { id, w, h, color, soft, label0: label, sub0: sub });
      g.rect = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: '#fff', stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': ext ? '6 4' : null }, g);
      el('circle', { cx: -w / 2 + 24, cy: 0, r: 16, fill: soft }, g);
      this.text(g, -w / 2 + 24, 1, icon ?? '•', { 'font-size': 16 });
      g.label = this.text(g, -w / 2 + 48, sub ? -9 : 0, label, { 'text-anchor': 'start', 'font-size': 14, 'font-weight': 650, fill: '#203347' });
      if (sub) g.sub = this.text(g, -w / 2 + 48, 11, sub, { 'text-anchor': 'start', 'font-size': 11.5, fill: '#7b878f' });
      this.nodes[id] = g;
      return g;
    }
    // ok / fail / warn tint for a node (null restores it).
    tone(n, tone) {
      const t = TONES[tone];
      n.rect.setAttribute('stroke', t ? t.stroke : n.color);
      n.rect.setAttribute('fill', t ? t.fill : '#fff');
      n.rect.setAttribute('stroke-width', t ? 2.4 : 1.6);
    }
    setSub(n, str, color) { if (n.sub) { n.sub.textContent = str; n.sub.setAttribute('fill', color ?? '#7b878f'); } }
    // Where the line from n's centre towards (tx, ty) leaves n's outline (plus a small gap).
    edgePoint(n, tx, ty, gap = 4) {
      const dx = tx - n._x, dy = ty - n._y, hw = n.w / 2 + gap, hh = n.h / 2 + gap;
      const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
      return [n._x + dx * t, n._y + dy * t];
    }
    wire(a, b) {
      const A = this.nodes[a], B = this.nodes[b];
      const [x1, y1] = this.edgePoint(A, B._x, B._y), [x2, y2] = this.edgePoint(B, A._x, A._y);
      const l = el('line', { class: 'wire', x1, y1, x2, y2, 'marker-end': 'url(#sd-arrow)', 'data-a': a, 'data-b': b }, this.wires);
      this.links[`${a}>${b}`] = l;
      return l;
    }
    // The wire between a and b in either direction, and whether it runs b → a.
    linkOf(a, b) { const f = this.links[`${a}>${b}`]; return f ? [f, false] : [this.links[`${b}>${a}`], true]; }
    // Marching dashes along a wire in the direction data travels.
    flow(a, b, color, on = true) {
      const [l, rev] = this.linkOf(a, b);
      if (!l) return;
      l.classList.toggle('flow', on);
      l.classList.toggle('rev', on && rev);
      if (on) l.style.setProperty('--c', color); else l.style.removeProperty('--c');
    }
    // A message travelling between components.
    packet(x, y, label, color = '#2f6fe0', { parent = this.top } = {}) {
      const g = this.g(x, y, parent, { class: 'sd-packet' });
      const w = Math.max(26, label.length * 6.7 + 18);
      g.rect = el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11, fill: color }, g);
      g.label = this.text(g, 0, .5, label, { 'font-size': 11.5, 'font-weight': 700, fill: '#fff', 'font-family': 'Consolas, "Cascadia Mono", monospace' });
      g.w = w;
      return g;
    }
    repaint(p, color, label) {
      if (color) p.rect.setAttribute('fill', color);
      if (label != null) {
        p.label.textContent = label;
        const w = Math.max(26, label.length * 6.7 + 18);
        p.rect.setAttribute('width', w); p.rect.setAttribute('x', -w / 2);
      }
    }
    // Carry a packet along a chain of components: ids = ['client', 'lb', 'svc']. Returns the packet (removed unless keep).
    async send(ids, label, color = '#2f6fe0', { ms = 560, keep = false, pulse = true, packet } = {}) {
      const first = this.nodes[ids[0]], second = this.nodes[ids[1]];
      const p = packet ?? this.packet(...this.edgePoint(first, second._x, second._y), label, color);
      if (packet) { this.repaint(p, color, label); place(p, ...this.edgePoint(first, second._x, second._y)); }
      if (!packet) await this.pop(p, 160);
      for (let i = 0; i < ids.length - 1; i++) {
        const A = this.nodes[ids[i]], B = this.nodes[ids[i + 1]];
        place(p, ...this.edgePoint(A, B._x, B._y));
        this.flow(ids[i], ids[i + 1], color);
        await this.move(p, ...this.edgePoint(B, A._x, A._y), ms);
        this.flow(ids[i], ids[i + 1], color, false);
        if (pulse) await this.pulse(B, 1, 1.07);
      }
      if (!keep) p.remove();
      return p;
    }
    // A packet that cannot get through: it turns red, shakes and comes back.
    async bounce(a, b, label, color = '#2f6fe0') {
      const A = this.nodes[a], B = this.nodes[b];
      const from = this.edgePoint(A, B._x, B._y), to = this.edgePoint(B, A._x, A._y);
      const p = this.packet(...from, label, color);
      await this.pop(p, 150);
      await this.move(p, (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 420);
      this.repaint(p, '#ce3434');
      await this.shake(p);
      await this.move(p, ...from, 340);
      p.remove();
    }
    // A small label pinned near something (status, latency, a counter).
    chip(x, y, str, { color = '#203347', fill = '#fff', stroke = '#d5d9dc', size = 11.5, anchor = 'middle', mono = false, parent = this.root } = {}) {
      const g = this.g(x, y, parent, { class: 'sd-chip' });
      Object.assign(g, { size, mono, anchor });
      g.rect = el('rect', { y: -11, height: 22, rx: 11, fill, stroke }, g);
      g.label = this.text(g, 0, .5, str, { 'font-size': size, 'font-weight': 650, fill: color, 'font-family': mono ? 'Consolas, "Cascadia Mono", monospace' : null });
      this.setChip(g, str);
      return g;
    }
    // New text (and optionally colours) for a chip; the pill resizes to fit.
    setChip(c, str, { color, fill, stroke } = {}) {
      const w = str.length * c.size * (c.mono ? .6 : .56) + 16, x0 = c.anchor === 'start' ? 0 : c.anchor === 'end' ? -w : -w / 2;
      c.rect.setAttribute('x', x0); c.rect.setAttribute('width', w);
      c.label.setAttribute('x', x0 + w / 2);
      c.label.textContent = str;
      if (color) c.label.setAttribute('fill', color);
      if (fill) c.rect.setAttribute('fill', fill);
      if (stroke) c.rect.setAttribute('stroke', stroke);
    }
    // A little table that shows what a store holds (rows of monospace text).
    store(x, y, w, title, { color = '#7b878f' } = {}) {
      const g = this.g(x, y, this.root, { class: 'sd-store' });
      Object.assign(g, { w, rows: [], color });
      this.text(g, 0, 0, title, { 'text-anchor': 'start', 'font-size': 11, 'font-weight': 700, fill: color, 'letter-spacing': '.04em' });
      return g;
    }
    // now: draw it without animating (for a flow's starting state, built before the clock runs).
    async row(st, str, { fill = '#f6f7fb', stroke = '#e3e6ee', color = '#203347', now = false } = {}) {
      const r = this.g(0, 18 + st.rows.length * 24, st);
      r.rect = el('rect', { x: 0, y: -10, width: st.w, height: 20, rx: 4, fill, stroke }, r);
      r.label = this.text(r, 8, .5, str, { 'text-anchor': 'start', 'font-size': 11.5, 'font-family': 'Consolas, "Cascadia Mono", monospace', fill: color });
      st.rows.push(r);
      if (!now) await this.show(r, 260);
      return r;
    }
    paintRow(r, { fill, stroke, color } = {}) {
      if (fill) r.rect.setAttribute('fill', fill);
      if (stroke) r.rect.setAttribute('stroke', stroke);
      if (color) r.label.setAttribute('fill', color);
    }
    async unrow(st, r) {
      await this.fade(r, 0, 300);
      r.remove();
      st.rows.splice(st.rows.indexOf(r), 1);
      st.rows.forEach((x, i) => place(x, 0, 18 + i * 24));
    }
    line(x1, y1, x2, y2, { parent = this.root, arrow = true, dash, stroke = '#7b878f', width = 1.5 } = {}) {
      return el('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, 'stroke-dasharray': dash, 'marker-end': arrow ? 'url(#sd-arrow)' : null }, parent);
    }
    note(x, y, str, attrs = {}) { return this.text(this.root, x, y, str, { 'font-size': 13, fill: '#65727a', ...attrs }); }

    // ---- animation ----
    wait(ms) { return this.clock.tween(ms); }
    move(n, x, y, ms = 700) {
      const x0 = n._x ?? 0, y0 = n._y ?? 0;
      return this.clock.tween(ms, t => place(n, x0 + (x - x0) * t, y0 + (y - y0) * t));
    }
    scale(n, s, ms = 400) { const s0 = n._s ?? 1; return this.clock.tween(ms, t => place(n, n._x ?? 0, n._y ?? 0, s0 + (s - s0) * t)); }
    fade(n, to, ms = 400) {
      const from = +(n.getAttribute('opacity') ?? 1);
      return this.clock.tween(ms, t => n.setAttribute('opacity', from + (to - from) * t));
    }
    show(n, ms = 400) { n.setAttribute('opacity', 0); return this.fade(n, 1, ms); }
    pop(n, ms = 380) { const s = n._s ?? 1; place(n, n._x ?? 0, n._y ?? 0, .01); return this.scale(n, s, ms); }
    async pulse(n, times = 1, k = 1.15) { const s = n._s ?? 1; for (let i = 0; i < times; i++) { await this.scale(n, s * k, 150); await this.scale(n, s, 150); } }
    shake(n, ms = 420) { const x = n._x ?? 0, y = n._y ?? 0; return this.clock.tween(ms, t => place(n, x + Math.sin(t * Math.PI * 6) * 6 * (1 - t), y), true); }
    draw(n, ms = 500) {
      const len = n.getTotalLength?.() || Math.hypot(n.getAttribute('x2') - n.getAttribute('x1'), n.getAttribute('y2') - n.getAttribute('y1')) || 1;
      n.setAttribute('stroke-dasharray', len);
      return this.clock.tween(ms, t => n.setAttribute('stroke-dashoffset', len * (1 - t))).then(() => { n.removeAttribute('stroke-dasharray'); n.removeAttribute('stroke-dashoffset'); });
    }
    // A short-lived label that pops up, holds and fades away.
    async flash(x, y, str, opts = {}, ms = 900) {
      const c = this.chip(x, y, str, { parent: this.top, ...opts });
      await this.pop(c, 200);
      await this.wait(ms);
      await this.fade(c, 0, 250);
      c.remove();
    }

    // Bounding box of any node in root coordinates (used for spotlights).
    bounds(n) {
      const b = n.getBBox(), m = this.root.getCTM().inverse().multiply(n.getCTM());
      const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    }
    spotlight(nodes) {
      this.fx.replaceChildren();
      for (const n of nodes.filter(n => n?.isConnected)) {
        const b = this.bounds(n), pad = 8;
        el('rect', { class: 'sd-ring', x: b.x - pad, y: b.y - pad, width: b.w + pad * 2, height: b.h + pad * 2, rx: 12 }, this.fx);
      }
    }
    clearSpotlight() { this.fx.replaceChildren(); }
  }

  window.SD = { NS, el, place, Clock, Stage, Cancelled };
})();
