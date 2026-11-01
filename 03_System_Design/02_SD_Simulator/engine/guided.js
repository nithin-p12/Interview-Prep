// Guided mode for the System Design pages: the same look as the 6-tab pages (sd.css + scene.js), but the
// architecture is BUILT stage by stage. Stages are the tab row; the mentor speaks from the floating guide card;
// hovering a component opens the usual popover; request flows use the usual flow pills and player bar.
// Content comes from a Guided SD Lab system definition (stages / flows / components / knowledge base).
(function () {
  const { Stage, el, place, Cancelled } = SD;
  const { esc, rich } = LAB;
  const $ = id => document.getElementById(id);
  const W = 168;
  const CAT = {
    service: ['#2f6fe0', '#edf3fe'], messaging: ['#8f4fc4', '#f5eefb'], cache: ['#d9822b', '#fdf1e4'],
    storage: ['#5f6b7a', '#eef0f3'], infra: ['#4c6175', '#e9eef3'], client: ['#44505c', '#eef0f2'], external: ['#6b7280', '#f0f1f3'],
  };
  const TONE = { req: '#2f6fe0', res: '#348747', ok: '#348747', async: '#8f4fc4', cache: '#d9822b', fail: '#ce3434', warn: '#c47d1e', info: '#7b878f' };
  const TABTONE = ['t-overview', 't-components', 't-flows', 't-explain', 't-overview', 't-components', 't-followups', 't-answer'];
  const CAT_NAME = { service: 'Service', messaging: 'Messaging', cache: 'Cache', storage: 'Storage', infra: 'Infrastructure', client: 'Client', external: 'External service' };
  const lerp = (a, b, t) => a + (b - a) * t;
  const list = (xs, tag = 'ul') => `<${tag}>${xs.map(x => `<li>${rich(x)}</li>`).join('')}</${tag}>`;
  // A content block: text, list, ordered list, table or code.
  const block = b => [
    b.text ? `<p>${rich(b.text)}</p>` : '',
    b.list ? list(b.list) : '', b.ol ? list(b.ol, 'ol') : '',
    b.table ? `<table class="g-tbl">${b.table.head ? `<thead><tr>${b.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${b.table.rows.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '',
    b.code ? codeWindow(b.t ?? 'schema', b.code) : '',
    b.after ? `<p class="muted">${rich(b.after)}</p>` : '',
  ].join('');
  const codeWindow = (title, code) => `<section class="code"><div class="code-head"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-title">${esc(title)}</span></div><pre><code>${esc(code).split('\n').map(l => `<span class="ln">${l || ' '}</span>`).join('')}</code></pre></section>`;

  window.GUIDED = function ({ system, layout, n = 1, classic }) {
    const sys = LAB.systems[system], prog = new LAB.Progression(sys), state = new LAB.State(sys.id), stages = sys.stages;
    const kb = sys.kb;

    // ---------- page shell (same structure and classes as the 6-tab pages) ----------
    document.body.innerHTML = `
      <main class="sd guided" id="sd">
        <header class="sd-head">
          <div class="sd-id">
            <a class="home" href="../02_SD_Interview_Simulator.html" title="All designs"><i>SD</i> System Design</a>
            <span class="head-divider" aria-hidden="true"></span>
            <a id="prev-stage" class="topic-arrow" href="#" aria-label="Previous stage">‹</a>
            <h1><span class="num">${n}</span>${esc(sys.config.title)}<span class="g-badge">Guided</span></h1>
            <a id="next-stage" class="topic-arrow" href="#" aria-label="Next stage">›</a>
            <span class="tagline">Build it step by step, the way a senior engineer would</span>
            ${classic ? `<a class="tool g-classic" href="${esc(classic)}" title="The tab-based version of this design">Classic view ↗</a>` : ''}
          </div>
          <nav class="tabs" id="tabs" aria-label="Stages"></nav>
        </header>
        <section class="card" id="card">
          <div class="stage-col" id="stage-col">
            <div class="flow-pick" id="flow-pick"></div>
            <div class="stage-wrap" id="stage-wrap">
              <svg id="stage" viewBox="0 0 1100 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(sys.config.title)} architecture"></svg>
              <div class="view-tools">
                <button id="replay-btn" class="tool icon" title="Replay how this stage changed the design" aria-label="Replay the change">⟲</button>
                <button id="before-btn" class="tool icon" title="Show the previous stage (compare)" aria-label="Show the previous stage">◐</button>
                <button id="full-btn" class="tool icon" title="Full screen (F)" aria-label="Full screen">⛶</button>
              </div>
              <div id="guide" class="guide-card" aria-live="polite"></div>
              <div id="pop" class="pop" hidden></div>
            </div>
            <div id="player-ui" class="player-ui" hidden>
              <div class="hold" title="Time left on this step"><span id="hold-bar"></span></div>
              <div class="controls">
                <button id="prev-step" title="Previous step (←)">⏮ Prev</button
                ><button id="play" class="primary" title="Pause / play (Space)">⏸ Pause</button
                ><button id="next-step" title="Next step (→)">Next ⏭</button
                ><button id="restart" title="Start this flow again">↻ Restart</button
                ><button id="exit-flow" title="Close the flow and return to the stage notes (Esc)">✕ Stage notes</button>
                <div id="dots" class="dots"></div>
                <div id="speed" class="segmented speed" role="group" aria-label="Animation speed">
                  <button data-speed=".5">0.5×</button><button data-speed="1">1×</button><button data-speed="1.5">1.5×</button><button data-speed="2">2×</button>
                </div>
              </div>
            </div>
          </div>
          <div class="doc doc-answer" id="doc" hidden></div>
        </section>
      </main>
      <div id="toast" class="toast"></div>`;
    document.title = `${sys.config.title} · Guided · System Design`;

    const s = new Stage($('stage'));
    let k = -1, flow = null, variant = null, edgeEls = {}, pinned = null, minimised = false, comparing = false;
    let fx = []; // flow chips

    // ---------- positions ----------
    // layout.pos: default position per component; layout.at[stageId]: moves from that stage on.
    const posOf = (id, kk) => {
      let p = layout.pos[id];
      for (let i = 0; i <= kk; i++) if (layout.at?.[stages[i].id]?.[id]) p = layout.at[stages[i].id][id];
      return p;
    };

    // ---------- drawing (any SD.Stage: the main one, or the mini diagram on the interview page) ----------
    function prepare(st) {
      st.reset();
      st.labels = el('g', { class: 'sd-labels' });
      st.svg.insertBefore(st.labels, st.root);
    }
    function addNode(st, nd, kk) {
      const [x, y] = posOf(nd.id, kk), [c, soft] = CAT[nd.category] ?? CAT.service;
      const g = st.node(nd.id, { x, y, w: W, label: nd.label, sub: nd.sub, icon: nd.icon, color: c, soft, ext: nd.ext || nd.ghost });
      g.style.cursor = 'pointer';
      return g;
    }
    function addEdge(st, e, store) {
      const l = st.wire(e.from, e.to);
      if (e.kind === 'async') l.classList.add('async');
      let chip = null;
      if (e.label) chip = st.chip(0, 0, e.label, { size: 10.5, color: e.kind === 'async' ? '#8f4fc4' : '#65727a', fill: '#fff', stroke: '#e6e8ec', parent: st.labels });
      const x = { l, chip, e };
      if (store) store[e.id] = x;
      layoutEdge(st, x);
      return x;
    }
    // Straight wire between the two boxes; its label sits in the middle when there is room for it.
    function layoutEdge(st, x) {
      const A = st.nodes[x.e.from], B = st.nodes[x.e.to];
      const [x1, y1] = st.edgePoint(A, B._x, B._y), [x2, y2] = st.edgePoint(B, A._x, A._y);
      Object.entries({ x1, y1, x2, y2 }).forEach(([a, v]) => x.l.setAttribute(a, v));
      if (x.chip) {
        const room = Math.hypot(x2 - x1, y2 - y1), need = x.e.label.length * 10.5 * .56 + 24;
        x.chip.style.display = room > need ? '' : 'none';
        place(x.chip, (x1 + x2) / 2, (y1 + y2) / 2);
      }
    }
    function drawArch(st, kk, store) {
      prepare(st);
      const a = prog.arch(kk);
      for (const nd of Object.values(a.nodes)) addNode(st, nd, kk);
      for (const e of Object.values(a.edges)) addEdge(st, e, store);
    }
    function badges(d) {
      for (const id of d.addedNodes) {
        const g = s.nodes[id];
        if (g) s.chip(W / 2 - 20, -g.h / 2, 'NEW', { size: 9.5, color: '#fff', fill: '#348747', stroke: '#348747', parent: g });
      }
    }

    // ---------- the stage-change animation ----------
    async function build(kk) {
      const prev = prog.arch(kk - 1), cur = prog.arch(kk), d = prog.diff(kk);
      edgeEls = {};
      drawArch(s, kk - 1, edgeEls);
      const c = s.clock;
      // 1. connections that go away (or get replaced) fade out
      const leaving = Object.keys(edgeEls).filter(id => !cur.edges[id] || d.addedEdges.includes(id));
      if (leaving.length) {
        leaving.forEach(id => edgeEls[id].l.classList.add('going'));
        await c.tween(450, t => leaving.forEach(id => { edgeEls[id].l.style.opacity = 1 - t; if (edgeEls[id].chip) edgeEls[id].chip.style.opacity = 1 - t; }));
        leaving.forEach(id => { edgeEls[id].l.remove(); edgeEls[id].chip?.remove(); delete edgeEls[id]; });
      }
      for (const id of d.removedNodes) { s.nodes[id].remove(); delete s.nodes[id]; }
      // 2. components that change role are redrawn in place
      for (const id of d.changedNodes) {
        const old = s.nodes[id], x = old._x, y = old._y;
        old.remove();
        const g = addNode(s, { ...cur.nodes[id] }, kk - 1);
        place(g, x, y);
        await s.pulse(g, 1, 1.06);
      }
      // 3. components that move slide to their new place; their wires follow
      const moving = Object.keys(cur.nodes).filter(id => prev.nodes[id]).map(id => ({ g: s.nodes[id], from: posOf(id, kk - 1), to: posOf(id, kk) }))
        .filter(m => m.from[0] !== m.to[0] || m.from[1] !== m.to[1]);
      if (moving.length) await c.tween(650, t => {
        for (const m of moving) place(m.g, lerp(m.from[0], m.to[0], t), lerp(m.from[1], m.to[1], t));
        Object.values(edgeEls).forEach(x => layoutEdge(s, x));
      });
      // 4. new components pop in, then their connections draw
      for (const id of d.addedNodes) await s.pop(addNode(s, cur.nodes[id], kk), 340);
      const fresh = d.addedEdges.map(id => addEdge(s, cur.edges[id], edgeEls));
      fresh.forEach(x => { if (x.chip) x.chip.style.opacity = 0; });
      await Promise.all(fresh.map(x => s.draw(x.l, 550)));
      fresh.forEach(x => { if (x.chip) x.chip.style.opacity = ''; });
    }
    let drawSeq = 0;
    async function showArch(animate) {
      const my = ++drawSeq, d = k ? prog.diff(k) : null;
      try {
        if (animate && k) await build(k);
        else { edgeEls = {}; drawArch(s, k, edgeEls); }
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
        if (my !== drawSeq) return; // a newer stage took over the canvas
        edgeEls = {}; drawArch(s, k, edgeEls);
      }
      if (my !== drawSeq) return;
      if (d) badges(d);
      if (!flow) { spotlightNew(); placeGuide(); }
    }
    const spotlightNew = () => { if (k) s.spotlight(prog.diff(k).addedNodes.map(id => s.nodes[id])); };

    // ---------- navigation: stages are the tab row ----------
    function tabs() {
      $('tabs').innerHTML = stages.map((st, i) => {
        const locked = i > state.reached, done = state.done.has(st.id);
        return `${i ? '<span class="sep" aria-hidden="true">›</span>' : ''}<button data-k="${i}" class="${TABTONE[i % TABTONE.length]}${i === k ? ' selected' : ''}${done ? ' visited' : ''}${locked ? ' locked' : ''}" title="${esc(st.title)}${locked ? ' (locked: continue through the earlier stages)' : ''}" ${locked ? 'aria-disabled="true"' : ''}><span class="tn">${locked ? '🔒' : done ? '✓' : i + 1}</span>${esc(st.nav ?? st.title)}</button>`;
      }).join('');
      $('prev-stage').classList.toggle('disabled', k <= 0);
      $('next-stage').classList.toggle('disabled', k >= stages.length - 1 || k + 1 > state.reached);
    }
    $('tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const i = +b.dataset.k;
      if (i > state.reached) toast(`Continue through stage ${state.reached + 1} first`);
      else go(i, { animate: i === k + 1 });
    });
    $('prev-stage').addEventListener('click', e => { e.preventDefault(); if (k > 0) go(k - 1); });
    $('next-stage').addEventListener('click', e => { e.preventDefault(); if (k + 1 <= state.reached) go(k + 1, { animate: true }); });

    function go(i, { animate = false, flowId = null } = {}) {
      stopFlow(true);
      hidePop(true);
      comparing = false; $('before-btn').classList.remove('selected');
      k = i; state.unlock(i);
      const st = stages[k], summary = st.kind === 'summary';
      $('card').className = `card ${TABTONE[k % TABTONE.length]}`;
      $('stage-col').hidden = summary; $('doc').hidden = !summary;
      tabs();
      LAB.route.set(st.id, flowId);
      if (summary) { renderInterview(); return; }
      flowPicker();
      mentor();
      showArch(animate);
      if (flowId && prog.flows(k).some(f => f.id === flowId)) startFlow(flowId);
    }

    // ---------- the mentor, in the guide card ----------
    function mentor() {
      const st = stages[k], next = stages[k + 1], comps = (st.introduce?.components ?? []).map(id => prog.component(id));
      const sec = (title, body, open, cls = '') => `<details class="gm-sec ${cls}" ${open ? 'open' : ''}><summary>${title}</summary><div>${body}</div></details>`;
      const g = $('guide');
      g.className = `guide-card mentor${minimised ? ' v-title' : ''}`;
      g.style.setProperty('--fc', ({ requirement: '#2f6fe0', constraint: '#c47d1e', goal: '#348747', risk: '#ce3434' })[st.challenge?.type] ?? '');
      g.innerHTML = `
        <div class="gc-head"><span class="eyebrow">Stage ${k + 1} of ${stages.length}${st.challenge ? ` · ${esc(st.challenge.label)}` : ''}</span><button class="gc-min" id="gc-min" title="${minimised ? 'Show' : 'Minimise'} the notes (M)">${minimised ? '+' : '–'}</button></div>
        <h2>${esc(st.title)}</h2>
        <div class="gc-body gm-scroll">
          ${st.challenge ? `<p class="gm-lead">${rich(st.challenge.text)}</p>` : ''}
          ${st.problem ? `<p class="gm-problem"><span class="gm-label">Why change the design</span>${rich(st.problem)}</p>` : ''}
          ${st.introduce ? `<div class="gm-intro"><span class="gm-label">What we introduce</span>${comps.length ? `<span class="gm-chips">${comps.map(c => `<button data-comp="${c.id}" style="--c:${CAT[c.category][0]};--s:${CAT[c.category][1]}" title="Show how ${esc(c.label)} works">${c.icon} ${esc(c.label)}</button>`).join('')}</span>` : ''}<p>${rich(st.introduce.text)}</p></div>` : ''}
          ${st.why ? sec('Why it is necessary', `<p>${rich(st.why)}</p>`, true) : ''}
          ${st.how ? sec('How it works', list(st.how, 'ol'), false) : ''}
          ${(st.extra ?? []).map(b => sec(esc(b.t), block({ ...b, t: undefined }), b.open)).join('')}
          ${st.without ? sec('Without it', `<p>${rich(st.without)}</p>`, false, 'gm-without') : ''}
          ${st.tradeoffs ? sec(`Trade-offs <small>${st.tradeoffs.length}</small>`, list(st.tradeoffs), false, 'gm-trade') : ''}
          ${st.failures ? sec(`Failure scenarios <small>${st.failures.length}</small>`, list(st.failures), false, 'gm-fail') : ''}
          ${st.faq ? sec(`Common questions <small>${st.faq.length}</small>`, st.faq.map(f => `<p class="gm-faq"><b>${rich(f.q)}</b>${rich(f.a)}</p>`).join(''), false) : ''}
          ${st.takeaway ? `<p class="gm-take"><b>Takeaway</b> ${rich(st.takeaway)}</p>` : ''}
        </div>
        <div class="gm-foot">
          ${prog.flows(k).length ? `<span class="muted gm-hint">▶ Watch a flow above</span>` : '<span></span>'}
          ${next ? `<button class="primary" id="continue">Continue: ${esc(next.nav ?? next.title)} ›</button>` : ''}
        </div>`;
      notesMode(true);
      placeGuide();
    }
    $('guide').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'gc-min') toggleMin();
      else if (b.id === 'continue') { state.complete(stages[k].id); go(k + 1, { animate: true }); }
      else if (b.dataset.comp) showPop(b.dataset.comp, true);
      else if (b.id === 'gc-notes') stopFlow();
    });
    // While the stage notes are open the diagram sits beside them, so the card never hides a component.
    function notesMode(on) { $('stage-wrap').classList.toggle('with-notes', on && !minimised); }
    function toggleMin() {
      minimised = !minimised;
      if (!flow) notesMode(true);
      $('guide').classList.toggle('v-title', minimised);
      const m = $('gc-min');
      if (m) { m.textContent = minimised ? '+' : '–'; m.title = `${minimised ? 'Show' : 'Minimise'} the notes (M)`; }
      placeGuide();
    }

    // Put the card in the corner of the stage where it hides the least of the diagram (focus components count most).
    function placeGuide(focus = []) {
      const g = $('guide'), wrap = $('stage-wrap');
      if (g.hidden || matchMedia('(max-width: 900px)').matches) return;
      if (wrap.classList.contains('with-notes')) { g.style.left = '10px'; g.style.top = '10px'; return; }
      const W0 = wrap.clientWidth, H0 = wrap.clientHeight, w = g.offsetWidth, h = g.offsetHeight, m = 10, gutter = 44;
      const wr = wrap.getBoundingClientRect();
      const boxes = Object.entries(s.nodes).map(([id, n]) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - wr.left - 6, y: r.top - wr.top - 6, w: r.width + 12, h: r.height + 12, weight: focus.includes(id) ? 6 : 1 };
      });
      const spots = [[m, m], [W0 - gutter - w - m, m], [m, H0 - h - m], [W0 - gutter - w - m, H0 - h - m], [(W0 - gutter - w) / 2, H0 - h - m], [(W0 - gutter - w) / 2, m]];
      let best = spots[0], bestScore = Infinity;
      for (const [x, y] of spots) {
        let score = 0;
        for (const b of boxes) score += Math.max(0, Math.min(x + w, b.x + b.w) - Math.max(x, b.x)) * Math.max(0, Math.min(y + h, b.y + b.h) - Math.max(y, b.y)) * b.weight;
        if (score < bestScore - 1) { bestScore = score; best = [x, y]; }
      }
      g.style.left = `${Math.max(m, best[0])}px`; g.style.top = `${Math.max(m, best[1])}px`;
    }
    addEventListener('resize', () => placeGuide(flowFocus()));

    // ---------- component popover (hover to look, click to pin) ----------
    function popHtml(id) {
      const a = prog.arch(k), nd = a.nodes[id], c = { ...prog.component(id), ...(nd && { label: nd.label, sub: nd.sub }) };
      const [col, soft] = CAT[c.category] ?? CAT.service, at = prog.introducedAt(id);
      const links = Object.values(a.edges).filter(e => e.from === id || e.to === id).map(e => {
        const out = e.from === id, other = a.nodes[out ? e.to : e.from];
        return `<li>${out ? '→' : '←'} <b>${esc(other.label)}</b> <span class="muted">${e.kind === 'async' ? 'async' : 'sync'}${e.label ? ` · ${esc(e.label)}` : ''}</span></li>`;
      }).join('');
      const facts = [['With it', c.with && `<p>${rich(c.with)}</p>`], ['Does', c.responsibilities?.length && list(c.responsibilities)], ['Inside', c.internalFlow?.length && list(c.internalFlow, 'ol')],
        ['Talks to', links && `<ul class="g-links">${links}</ul>`], ['Fails', c.failures?.length && list(c.failures)], ['Trade-offs', c.tradeoffs?.length && list(c.tradeoffs)]].filter(([, v]) => v);
      return `<div class="pop-in" style="--c:${col};--s:${soft}">
        <div class="pop-head"><span class="ic">${c.icon}</span><div><h3>${esc(c.label)}</h3><span class="layer-chip">${CAT_NAME[c.category] ?? ''} · since stage ${at + 1}</span></div>
          <span class="pin-tag">${pinned ? '📌 pinned' : 'click to pin'}</span><button class="pop-close" title="Close (Esc)">✕</button></div>
        <p class="comp-what">${rich(c.purpose ?? '')}</p>
        ${c.whyIntroduced ? `<div class="why"><b>Why it was introduced</b>${rich(c.whyIntroduced)}</div>` : ''}
        ${c.without ? `<div class="without"><b>Without it</b>${rich(c.without)}</div>` : ''}
        <dl class="facts">${facts.map(([t, v]) => `<dt>${t}</dt><dd>${v}</dd>`).join('')}</dl>
      </div>`;
    }
    function showPop(id, pin = false) {
      if (pinned && !pin && pinned !== id) return;
      const n = s.nodes[id];
      if (!n) return;
      if (pin) pinned = id;
      const p = $('pop');
      p.innerHTML = popHtml(id);
      p.classList.toggle('pinned', !!pinned);
      p.hidden = false;
      // beside the component: right if it fits, else left; vertically clamped inside the stage
      const wrap = $('stage-wrap'), wr = wrap.getBoundingClientRect(), r = n.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
      let x = r.right - wr.left + 12;
      if (x + pw > wrap.clientWidth - 50) x = r.left - wr.left - pw - 12;
      if (x < 8) x = Math.max(8, (wrap.clientWidth - pw) / 2);
      const y = Math.min(Math.max(8, r.top - wr.top + r.height / 2 - ph / 2), wrap.clientHeight - ph - 8);
      p.style.left = `${x}px`; p.style.top = `${Math.max(8, y)}px`;
    }
    function hidePop(force = false) {
      if (pinned && !force) return;
      pinned = null;
      $('pop').hidden = true;
    }
    const nodeAt = e => e.target.closest?.('.sd-node')?.dataset.id;
    $('stage').addEventListener('mouseover', e => { const id = nodeAt(e); if (id) showPop(id); });
    $('stage').addEventListener('mouseout', e => { if (nodeAt(e) && !e.relatedTarget?.closest?.('.sd-node')) hidePop(); });
    $('stage').addEventListener('click', e => {
      const id = nodeAt(e);
      if (id) { if (pinned === id) hidePop(true); else { pinned = null; showPop(id, true); } }
      else hidePop(true);
    });
    $('pop').addEventListener('click', e => { if (e.target.closest('.pop-close')) hidePop(true); });

    // ---------- request flows: the flow pills and the player bar ----------
    function flowPicker() {
      const flows = prog.flows(k);
      $('flow-pick').hidden = !flows.length;
      $('flow-pick').innerHTML = `<span class="fp-label">Flows</span>${flows.map(f => `<button data-flow="${f.id}" class="${f.id === flow?.id ? 'selected' : ''}" style="--c:${TONE[f.tone] ?? TONE.req}"><i></i><span>${esc(f.title)}</span><small>${esc(f.sub ?? '')}</small></button>`).join('')}`;
    }
    $('flow-pick').addEventListener('click', e => {
      const b = e.target.closest('[data-flow]');
      if (b) startFlow(b.dataset.flow);
    });
    const steps = () => flow ? (flow.variants ? flow.variants[variant].steps : flow.steps) : [];
    let i = 0, playing = true, phase = 'run';
    function startFlow(id, v) {
      hidePop(true);
      if (comparing) { comparing = false; $('before-btn').classList.remove('selected'); edgeEls = {}; drawArch(s, k, edgeEls); if (k) badges(prog.diff(k)); }
      flow = prog.flow(id);
      variant = flow.variants ? (v && flow.variants[v] ? v : Object.keys(flow.variants)[0]) : null;
      playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      $('player-ui').hidden = false;
      notesMode(false);
      flowPicker();
      LAB.route.set(stages[k].id, id);
      runStep(0);
    }
    function stopFlow(silent = false) {
      if (!flow) return;
      flow = null;
      s.clock.cancel(); s.clock.paused = false;
      clearFx();
      $('player-ui').hidden = true;
      $('stage').classList.remove('paused');
      if (!silent) { flowPicker(); mentor(); spotlightNew(); LAB.route.set(stages[k].id); }
    }
    function clearFx() {
      s.top.replaceChildren(); s.fx.replaceChildren();
      fx = [];
      for (const n of Object.values(s.nodes)) { s.tone(n, null); n.style.opacity = ''; }
      for (const x of Object.values(edgeEls)) x.l.classList.remove('flow', 'rev');
    }
    function settle(step) {
      for (const [id, m] of Object.entries(step.mark ?? {})) {
        const n = s.nodes[id];
        if (!n) continue;
        s.tone(n, m === 'down' ? 'fail' : m === 'active' ? null : m);
        n.style.opacity = m === 'down' ? .55 : '';
      }
      for (const [id, v] of Object.entries(step.chip ?? {})) {
        fx.filter(f => f.id === id).forEach(f => f.g.remove());
        fx = fx.filter(f => f.id !== id);
        if (v == null) continue;
        const [str, tone] = Array.isArray(v) ? v : [v, 'info'], n = s.nodes[id], col = TONE[tone] ?? TONE.info;
        if (n) fx.push({ id, g: s.chip(n._x, n._y - n.h / 2 - 15, str, { color: col, fill: '#fff', stroke: col, parent: s.top }) });
      }
    }
    // One packet journey: along p (any direction), optionally back with a reply, or refused on the last hop.
    async function track(tr) {
      if (tr.delay) await s.wait(tr.delay);
      const color = TONE[tr.k ?? 'req'], p = tr.p, ms = tr.ms ?? 560;
      if (tr.fail) {
        if (p.length > 2) await s.send(p.slice(0, -1), tr.l, color, { ms });
        await s.bounce(p.at(-2), p.at(-1), tr.l, color);
        return;
      }
      const pk = await s.send(p, tr.l, color, { ms, keep: !!tr.ret });
      if (tr.ret) await s.send([...p].reverse(), tr.ret, TONE[tr.rk ?? 'res'], { ms, packet: pk });
    }
    const flowFocus = () => flow ? [...new Set((steps()[i]?.go ?? []).flatMap(t => t.p))] : [];
    async function runStep(n) {
      const st = steps();
      if (!flow || n < 0 || n >= st.length) return;
      s.clock.cancel(); s.clock.paused = false;
      i = n; phase = 'run';
      clearFx();
      s.clearSpotlight();
      for (let j = 0; j < n; j++) settle(st[j]);
      flowCard(); paintPlayer();
      try {
        await Promise.all((st[n].go ?? []).map(track));
        settle(st[n]);
        if (!st[n].go?.length) await s.wait(500);
        if (n === st.length - 1) { phase = 'done'; playing = false; flowCard(); paintPlayer(); return; }
        phase = 'hold'; paintPlayer();
        if (!playing) return;
        const hold = 1500 + (st[n].t?.length ?? 0) * 26;
        await s.clock.tween(hold, t => $('hold-bar').style.width = `${t * 100}%`, true);
        runStep(n + 1);
      } catch (e) { if (!(e instanceof Cancelled)) throw e; }
    }
    function flowCard() {
      const st = steps(), step = st[i], g = $('guide'), done = phase === 'done';
      g.className = `guide-card${done ? ' is-done' : ''}${minimised ? ' v-title' : ''}`;
      g.style.setProperty('--fc', TONE[flow.tone] ?? '');
      g.innerHTML = `
        <div class="gc-head"><span class="eyebrow">${esc(flow.title)}${flow.variants ? ` · ${esc(flow.variants[variant].label)}` : ''} · step ${i + 1} of ${st.length}</span><button class="gc-min" id="gc-min" title="${minimised ? 'Show' : 'Minimise'} (M)">${minimised ? '+' : '–'}</button></div>
        ${flow.variants ? `<div class="segmented g-var">${Object.entries(flow.variants).map(([key, v]) => `<button data-var="${key}" class="${key === variant ? 'selected' : ''}">${esc(v.label)}</button>`).join('')}</div>` : ''}
        <div class="gc-body"><p id="step-text">${rich(step.t)}</p></div>
        ${done ? `<div class="gc-done"><p>✓ End of the flow.</p><div class="cta-row"><button class="cta" id="gc-replay">↻ Replay</button><button class="cta ghost" id="gc-notes">‹ Stage notes</button></div></div>` : ''}`;
      requestAnimationFrame(() => placeGuide(flowFocus()));
    }
    $('guide').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b?.dataset.var) startFlow(flow.id, b.dataset.var);
      else if (b?.id === 'gc-replay') { playing = true; runStep(0); }
    });
    function paintPlayer() {
      const st = steps();
      $('play').textContent = phase === 'done' ? '↻ Replay' : playing ? '⏸ Pause' : '▶ Play';
      $('prev-step').disabled = i === 0;
      $('next-step').disabled = i >= st.length - 1;
      $('dots').innerHTML = st.map((_, j) => `<button class="dot ${j < i ? 'seen' : j === i ? 'current' : ''}" data-dot="${j}" aria-label="Step ${j + 1}"></button>`).join('');
      for (const b of $('speed').children) b.classList.toggle('selected', +b.dataset.speed === s.clock.speed);
      $('stage').classList.toggle('paused', !playing && phase !== 'done');
      if (phase !== 'hold') $('hold-bar').style.width = '0';
    }
    function togglePlay() {
      if (!flow) return;
      if (phase === 'done') { playing = true; runStep(0); return; }
      playing = !playing;
      s.clock.paused = !playing && phase === 'run';
      if (playing && phase === 'hold') runStep(i + 1);
      else if (!playing && phase === 'hold') { s.clock.cancel(); }
      paintPlayer();
    }
    const stepBy = d => { if (flow) { playing = false; s.clock.paused = false; runStep(i + d); } };
    $('play').addEventListener('click', togglePlay);
    $('prev-step').addEventListener('click', () => stepBy(-1));
    $('next-step').addEventListener('click', () => stepBy(1));
    $('restart').addEventListener('click', () => { playing = true; s.clock.paused = false; runStep(0); });
    $('exit-flow').addEventListener('click', () => stopFlow());
    $('dots').addEventListener('click', e => { const b = e.target.closest('[data-dot]'); if (b) { playing = false; s.clock.paused = false; runStep(+b.dataset.dot); } });
    $('speed').addEventListener('click', e => { const b = e.target.closest('[data-speed]'); if (b) { s.clock.speed = +b.dataset.speed; paintPlayer(); } });

    // ---------- view tools ----------
    $('replay-btn').addEventListener('click', () => { if (k && stages[k].kind !== 'summary') { stopFlow(true); hidePop(true); flowPicker(); mentor(); showArch(true); } });
    $('before-btn').addEventListener('click', () => {
      if (!k) return;
      stopFlow(true); flowPicker(); mentor(); hidePop(true);
      comparing = !comparing;
      $('before-btn').classList.toggle('selected', comparing);
      edgeEls = {};
      if (comparing) {
        drawArch(s, k - 1, edgeEls);
        const d = prog.diff(k);
        for (const id of d.removedEdges) edgeEls[id]?.l.classList.add('going');
        s.chip(550, 18, `Before stage ${k + 1} · click ◐ again to compare`, { size: 12, color: '#614373', fill: '#f7effb', stroke: '#d8b7e9', parent: s.top });
      } else { drawArch(s, k, edgeEls); badges(prog.diff(k)); spotlightNew(); }
    });
    function toggleFullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else $('sd').requestFullscreen?.().catch(() => {});
    }
    $('full-btn').addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
      const on = !!document.fullscreenElement;
      document.body.classList.toggle('focus', on);
      $('full-btn').textContent = on ? '✕' : '⛶';
      $('full-btn').title = on ? 'Exit full screen (F)' : 'Full screen (F)';
      setTimeout(() => placeGuide(flowFocus()), 60);
    });

    // ---------- stage 8: the interview-ready answer, in the document style ----------
    function renderInterview() {
      const a = prog.arch(k), ids = Object.keys(a.nodes), secs = [];
      const add = (id, h, html, { c = '#2f6fe0', wide = false } = {}) => secs.push({ id, h, html, c, wide });
      add('req', 'Problem & requirements', `<p>${rich(kb.problem)}</p><h4>Functional</h4>${list(kb.requirements.functional)}<h4>Non-functional</h4>${list(kb.requirements.nonFunctional)}${kb.requirements.outOfScope ? `<h4>Out of scope (say so)</h4>${list(kb.requirements.outOfScope)}` : ''}`);
      add('cap', 'Capacity estimates', block(kb.capacity), { c: '#13968a' });
      add('api', 'APIs', block(kb.apis), { c: '#c47d1e', wide: true });
      add('schema', 'Database schema', block({ ...kb.schema, t: 'MongoDB collections' }), { c: '#8f4fc4', wide: true });
      add('arch', 'Final architecture', `<p class="muted">What you built over stages 1–${k}.</p><div class="g-mini"><svg id="mini" viewBox="0 0 1100 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Final architecture"></svg></div>`, { c: '#5b5bd6', wide: true });
      const rows = ids.filter(id => !ids.includes(prog.component(id).extends)).map(id => {
        const names = [id, ...ids.filter(o => prog.component(o).extends === id)].map(o => a.nodes[o].label);
        return `<tr><td><b>${prog.component(id).icon} ${esc(names.join(' / '))}</b><br><span class="muted">${esc(a.nodes[id].sub ?? '')}</span></td><td>${list(prog.component(id).responsibilities ?? [])}</td></tr>`;
      });
      add('resp', 'Component responsibilities', `<table class="g-tbl"><tbody>${rows.join('')}</tbody></table>`, { c: '#13968a', wide: true });
      kb.flows.forEach((f, j) => {
        const fl = prog.flow(f.flow), st = fl.variants ? fl.variants[f.variant ?? Object.keys(fl.variants)[0]].steps : fl.steps;
        const at = stages.findIndex(x => x.flows?.includes(f.flow));
        add(`flow${j}`, f.h, `${list(st.map(x => x.t), 'ol')}<button class="g-watch" data-watch="${f.flow}" data-k="${at}">▶ Watch it in stage ${at + 1}</button>`, { c: ['#348747', '#2f6fe0', '#8f4fc4'][j % 3] });
      });
      add('cache', 'Caching strategy', list(kb.caching), { c: '#d9822b' });
      add('scale', 'Scaling strategy', list(kb.scaling), { c: '#2f6fe0' });
      const byStage = key => stages.map((st, j) => st[key]?.length ? `<h4>Stage ${j + 1} · ${esc(st.nav ?? st.title)}</h4>${list(st[key])}` : '').join('');
      add('fail', 'Failure scenarios', byStage('failures'), { c: '#ce3434', wide: true });
      add('trade', 'Trade-offs', `${kb.decisions ? block(kb.decisions) : ''}${byStage('tradeoffs')}`, { c: '#c47d1e', wide: true });
      add('fu', 'Follow-up questions', `<div class="fu-list">${kb.followups.map((f, j) => `<details style="--c:#c2417a" ${j ? '' : 'open'}><summary><span class="fu-q">${rich(f.q)}</span></summary><div class="fu-body"><div class="say"><b>🎤 Say this</b><p>${rich(f.a)}</p></div></div></details>`).join('')}</div>`, { c: '#c2417a', wide: true });
      add('plan', 'The 45-minute explanation', `<div class="g-plan">${kb.plan.map((p, j) => `<div><span class="g-min">${p.min} min</span><b>${j + 1}. ${esc(p.t)}</b>${list(p.say)}</div>`).join('')}</div>`, { c: '#348747', wide: true });

      const doc = $('doc');
      doc.innerHTML = `<div class="doc-pad">
        <div class="doc-sticky"><div class="doc-head"><div><span class="eyebrow">Stage ${k + 1} · Interview ready</span><h2>The complete answer, built from your journey</h2>
          <p class="muted">Everything below comes from the stages you just went through: the same components, flows, failures and trade-offs.</p></div></div>
          <nav class="jump" id="jump" aria-label="Jump to a section"><button data-jump="g-pitch">⏱ 60-second answer</button>${secs.map(x => `<button data-jump="g-${x.id}">${esc(x.h)}</button>`).join('')}</nav></div>
        <section class="pitch" id="g-pitch"><div class="pitch-head"><b>⏱ The 60-second answer</b><button id="copy-pitch">⧉ Copy</button></div><p>${rich(kb.summary)}</p></section>
        <div class="ans-grid">${secs.map((x, j) => `<section class="ans${x.wide ? ' wide' : ''}" id="g-${x.id}" style="--c:${x.c}"><h3>${j + 1} · ${esc(x.h)}</h3>${x.html}</section>`).join('')}</div>
      </div>`;
      // The final architecture, drawn with the same scene helpers (own marker id, so its arrows render).
      const mini = new Stage($('mini'));
      drawArch(mini, k, {});
      const mk = mini.svg.querySelector('marker');
      mk.id = 'sd-arrow-mini';
      mini.svg.querySelectorAll('[marker-end]').forEach(l => l.setAttribute('marker-end', 'url(#sd-arrow-mini)'));
      $('copy-pitch').addEventListener('click', () => navigator.clipboard?.writeText(kb.summary.replace(/\*\*|`/g, '')).then(() => toast('Copied the 60-second answer'), () => toast('Copy failed')));
      doc.querySelectorAll('[data-watch]').forEach(b => b.addEventListener('click', () => go(+b.dataset.k, { flowId: b.dataset.watch })));
      const jumps = [...$('jump').children], offset = () => doc.querySelector('.doc-sticky').offsetHeight + 12;
      const top = id => $(id).getBoundingClientRect().top - doc.getBoundingClientRect().top + doc.scrollTop;
      for (const b of jumps) b.addEventListener('click', () => doc.scrollHeight > doc.clientHeight + 1 ? doc.scrollTo({ top: top(b.dataset.jump) - offset(), behavior: 'smooth' }) : $(b.dataset.jump).scrollIntoView({ behavior: 'smooth' }));
      const mark = () => {
        let cur = jumps[0];
        for (const b of jumps) if (top(b.dataset.jump) - offset() <= doc.scrollTop + 8) cur = b;
        if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4) cur = jumps.at(-1);
        for (const b of jumps) b.classList.toggle('on', b === cur);
      };
      doc.onscroll = mark; doc.scrollTop = 0; mark();
    }

    // ---------- keys, toast, start ----------
    let toastTimer;
    function toast(msg) {
      const t = $('toast'); t.textContent = msg; t.classList.add('show');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
    }
    addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select')) return;
      if (e.key === 'Escape') { if (pinned) hidePop(true); else if (flow) stopFlow(); return; }
      if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return; }
      if ((e.key === 'm' || e.key === 'M') && stages[k]?.kind !== 'summary') { toggleMin(); return; }
      if (!flow) return;
      if (e.key === ' ' && !e.target.closest('button, summary')) { e.preventDefault(); if (!e.repeat) togglePlay(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); }
    });
    addEventListener('hashchange', () => {
      const r = LAB.route.parse(), j = stages.findIndex(x => x.id === r.stage);
      if (j >= 0 && j <= state.reached && (j !== k || (r.flow ?? null) !== (flow?.id ?? null))) go(j, { flowId: r.flow });
    });
    const r = LAB.route.parse(), want = stages.findIndex(x => x.id === r.stage);
    go(want >= 0 && want <= state.reached ? want : Math.min(state.reached, stages.length - 1), { flowId: r.flow });
  };
})();
