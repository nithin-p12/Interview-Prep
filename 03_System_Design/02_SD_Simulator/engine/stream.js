// Continuous traffic for "learn" flows: a steady stream of dots along the wires, load meters, an in-diagram
// ON / OFF switch, and a background loop that lives until the scene is reset (seek, tab change, other flow).
// The loop never runs on the invisible preview stage, and it follows the stage clock (pause / speed).
(function () {
  const { el, place, Cancelled } = SD;
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const live = s => s.svg.id === 'stage';

  // Run fn(dt seconds) about every `every` ms while this scene is alive.
  SD.loop = (s, fn, every = 50) => {
    if (!live(s)) return;
    (async () => {
      let last = performance.now();
      try {
        for (;;) {
          if (s.clock.instant) { await frame(); last = performance.now(); continue; } // earlier steps being replayed
          await s.clock.tween(every);
          const now = performance.now();
          fn(Math.min(.25, (now - last) / 1000) * (s.clock.paused ? 0 : s.clock.speed));
          last = now;
        }
      } catch (e) { if (!(e instanceof Cancelled)) throw e; }
    })();
  };

  // One dot travelling along a chain of components (ids); resolves when it arrives. fail: it turns red and fades
  // just before the last component.
  SD.dot = async (s, ids, color, { ms = 420, r = 5, fail = false } = {}) => {
    if (!live(s) || s.clock.instant) return;
    const d = el('circle', { r, fill: color, class: 'sd-dot' }, s.top);
    try {
      for (let i = 0; i < ids.length - 1; i++) {
        const A = s.nodes[ids[i]], B = s.nodes[ids[i + 1]];
        if (!A || !B) break;
        const [x1, y1] = s.edgePoint(A, B._x, B._y), [x2, y2] = s.edgePoint(B, A._x, A._y);
        const last = i === ids.length - 2, to = fail && last ? .8 : 1;
        await s.clock.tween(ms, t => { d.setAttribute('cx', x1 + (x2 - x1) * t * to); d.setAttribute('cy', y1 + (y2 - y1) * t * to); }, true);
        if (fail && last) { d.setAttribute('fill', '#ce3434'); await s.clock.tween(350, t => { d.setAttribute('r', r + t * 4); d.setAttribute('opacity', 1 - t); }); return false; }
      }
      return true;
    } catch (e) { if (!(e instanceof Cancelled)) throw e; return false; }
    finally { d.remove(); }
  };

  // A load meter under a component: a bar plus "load 72%"; green < 70%, amber < 100%, red above.
  SD.meter = (s, x, y, w = 130) => {
    const g = s.g(x, y, s.root, { class: 'sd-meter' });
    el('rect', { x: -w / 2, y: -5, width: w, height: 10, rx: 5, fill: '#eef0f2', stroke: '#dfe3e8' }, g);
    const bar = el('rect', { x: -w / 2, y: -5, width: 0, height: 10, rx: 5, fill: '#348747' }, g);
    const t = s.text(g, 0, 17, 'load 0%', { 'font-size': 11.5, 'font-weight': 700, fill: '#348747' });
    return {
      g, value: 0,
      set(v) {
        this.value = v;
        const c = v < .7 ? '#348747' : v < 1 ? '#c47d1e' : '#ce3434';
        bar.setAttribute('width', Math.min(1, v) * w); bar.setAttribute('fill', c);
        t.textContent = `load ${Math.round(v * 100)}%${v >= 1 ? ' · overloaded' : ''}`; t.setAttribute('fill', c);
      },
    };
  };

  // An ON / OFF switch drawn in the diagram (part of the scene, so it disappears with it).
  SD.toggle = (s, x, y, label, get, set) => {
    const g = s.g(x, y, s.top, { class: 'sd-toggle', role: 'button', tabindex: 0 });
    const w = label.length * 7 + 86;
    el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 15, fill: '#fff', stroke: '#c9cfd6' }, g);
    const lab = s.text(g, -w / 2 + 14, 0, label, { 'text-anchor': 'start', 'font-size': 12.5, 'font-weight': 650, fill: '#203347' });
    const track = el('rect', { x: w / 2 - 50, y: -9, width: 36, height: 18, rx: 9 }, g);
    const knob = el('circle', { cy: 0, r: 7, fill: '#fff' }, g);
    const paint = () => {
      const on = get();
      track.setAttribute('fill', on ? '#348747' : '#ce3434');
      knob.setAttribute('cx', on ? w / 2 - 23 : w / 2 - 41);
      lab.setAttribute('fill', on ? '#203347' : '#ce3434');
    };
    const flip = e => { e.stopPropagation(); set(!get()); paint(); };
    g.addEventListener('click', flip);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(e); } });
    g.style.cursor = 'pointer';
    paint();
    return { g, paint };
  };
})();
