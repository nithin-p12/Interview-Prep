// Request-flow visualizer: plays a flow's steps on the canvas (play / pause / step / replay / speed),
// and renders the flow bar under the canvas. A flow is data:
//   { title, sub, variants?: { key: { label, steps } }, steps?: [...] }
//   step = { t: 'caption', go: [track, ...] (run in parallel), mark: { nodeId: 'ok'|'fail'|'warn'|'down'|null },
//            chip: { nodeId: 'text' | ['text', tone] | null } }   marks and chips apply once the tracks arrive.
(function () {
  const { esc, rich, Cancelled } = LAB;

  LAB.FlowPlayer = class {
    constructor(canvas, bar) {
      this.canvas = canvas;
      this.bar = bar;
      this.clock = new LAB.Clock();
      this.clock.speed = LAB.prefs.get('speed', 1);
      this.flow = null;
      this.bar.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        const a = b.dataset.act;
        if (a === 'play') this.toggle();
        else if (a === 'prev') this.step(-1);
        else if (a === 'next') this.step(1);
        else if (a === 'replay') { this.playing = true; this.go(0); }
        else if (a === 'variant') this.load(this.flow, b.dataset.v);
        else if (a === 'dot') { this.playing = false; this.go(+b.dataset.i); }
        else if (a === 'speed') { this.clock.speed = +b.dataset.s; LAB.prefs.set('speed', this.clock.speed); this.paint(); }
      });
    }
    get steps() { return this.flow ? (this.flow.variants ? this.flow.variants[this.variant].steps : this.flow.steps) : []; }
    load(flow, variant) {
      this.flow = flow;
      this.variant = flow.variants ? (variant && flow.variants[variant] ? variant : Object.keys(flow.variants)[0]) : null;
      this.playing = !LAB.reducedMotion();
      this.go(0);
    }
    // Stepping by hand switches to step-by-step mode (no auto-advance).
    step(d) { if (this.flow) { this.playing = false; this.go(this.i + d); } }
    stop() {
      this.clock.cancel();
      this.flow = null;
      this.canvas.clearFlow();
      this.paint();
    }
    toggle() {
      if (!this.flow) return;
      if (this.phase === 'done') { this.playing = true; this.go(0); return; }
      this.playing = !this.playing;
      this.clock.paused = false;
      if (this.playing && this.phase === 'hold') this.go(this.i + 1);
      else this.paint();
    }
    // Show steps before i in their end state, then animate step i.
    async go(i) {
      const steps = this.steps;
      if (!this.flow || i < 0 || i >= steps.length) return;
      this.clock.cancel(); this.clock.paused = false;
      this.i = i;
      const c = this.canvas;
      c.clearFlow(); c.focus(true);
      for (let j = 0; j < i; j++) this.settle(steps[j]);
      this.phase = 'run'; this.paint();
      const step = steps[i];
      try {
        await Promise.all((step.go ?? []).map(tr => c.travel(tr, this.clock)));
        this.settle(step);
        if (step.go?.length === 0 || !step.go) await this.clock.wait(500);
        if (i === steps.length - 1) { this.phase = 'done'; this.playing = false; this.paint(); return; }
        this.phase = 'hold'; this.paint();
        if (!this.playing) return;
        // Give the reader time for the caption before moving on.
        const hold = 1400 + (step.t?.length ?? 0) * 26;
        await this.clock.tween(hold, t => this.bar.querySelector('.fb-hold i')?.style.setProperty('width', `${t * 100}%`), true);
        this.go(i + 1);
      } catch (e) { if (!(e instanceof Cancelled)) throw e; }
    }
    settle(step) {
      const c = this.canvas;
      for (const tr of step.go ?? []) c.light(tr.p, true);
      for (const [id, m] of Object.entries(step.mark ?? {})) c.mark(id, m);
      for (const [id, v] of Object.entries(step.chip ?? {})) Array.isArray(v) ? c.chip(id, v[0], v[1]) : c.chip(id, v);
    }
    paint() {
      const b = this.bar;
      if (!this.flow) {
        b.className = 'flow-bar idle';
        b.innerHTML = `<span class="fb-hint">▶ Pick a <b>request flow</b> above the diagram to watch a request travel through this architecture.</span>`;
        return;
      }
      const steps = this.steps, s = steps[this.i], last = this.i === steps.length - 1;
      const icon = this.phase === 'done' ? '↻' : this.playing ? '⏸' : '▶';
      const playTitle = this.phase === 'done' ? 'Play again' : this.playing ? 'Pause (Space)' : 'Play (Space)';
      b.className = `flow-bar ${this.phase}`;
      b.innerHTML = `
        <div class="fb-ctl">
          <button data-act="prev" title="Previous step (←)" aria-label="Previous step" ${this.i ? '' : 'disabled'}>⏮</button>
          <button data-act="play" class="primary" title="${playTitle}" aria-label="${playTitle}">${icon}</button>
          <button data-act="next" title="Next step (→)" aria-label="Next step" ${last ? 'disabled' : ''}>⏭</button>
          <button data-act="replay" title="Replay from the start" aria-label="Replay from the start">↻</button>
        </div>
        <div class="fb-main">
          <div class="fb-top">
            <b class="fb-title">${esc(this.flow.title)}</b>
            ${this.flow.variants ? `<span class="seg">${Object.entries(this.flow.variants).map(([k, v]) => `<button data-act="variant" data-v="${k}" class="${k === this.variant ? 'on' : ''}">${esc(v.label)}</button>`).join('')}</span>` : ''}
            <span class="fb-dots">${steps.map((_, k) => `<button data-act="dot" data-i="${k}" class="${k < this.i ? 'seen' : k === this.i ? 'cur' : ''}" aria-label="Step ${k + 1}"></button>`).join('')}</span>
            <span class="fb-count">Step ${this.i + 1} / ${steps.length}</span>
          </div>
          <p class="fb-cap">${rich(s.t)}</p>
          <span class="fb-hold"><i></i></span>
        </div>
        <div class="seg speed" title="Animation speed">${[.5, 1, 1.5, 2].map(v => `<button data-act="speed" data-s="${v}" class="${v === this.clock.speed ? 'on' : ''}">${v}×</button>`).join('')}</div>`;
    }
  };

  // Flow picker above the canvas: one pill per flow available at this stage.
  LAB.renderFlowPicker = (host, flows, current, onPick) => {
    host.innerHTML = flows.length
      ? `<span class="fp-label">Flows</span>${flows.map(f => `<button data-flow="${f.id}" class="fp tone-${f.tone ?? 'req'}${f.id === current ? ' on' : ''}" title="${esc(f.sub ?? '')}"><i></i>${esc(f.title)}</button>`).join('')}`
      : '<span class="fp-label muted">No request flows in this stage</span>';
    host.onclick = e => { const b = e.target.closest('[data-flow]'); if (b) onPick(b.dataset.flow); };
  };
})();
