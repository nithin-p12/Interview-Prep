// Page shell for one design (window.DESIGN): six tabs, one full-width animated stage for the first three.
//   Overview (looping data flow) › Components (hover a box: why it exists) › Flows (guide card beside the action)
//   › How to explain › Interview answer › Follow-ups
(function () {
  const D = window.DESIGN, CAT = window.SD_CATALOG ?? [], { Stage, Player, Cancelled } = window.SD;
  const [VW, VH] = D.viewBox;
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const esc = str => String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // **bold** and `code` in plain-text content.
  const rich = str => esc(str).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');

  const TABS = [
    { id: 'overview', n: 1, title: 'Overview', tone: 't-overview' },
    { id: 'components', n: 2, title: 'Components', tone: 't-components' },
    { id: 'flows', n: 3, title: 'Flows', tone: 't-flows' },
    { id: 'explain', n: 4, title: 'How to explain', tone: 't-explain' },
    { id: 'answer', n: 5, title: 'Interview answer', tone: 't-answer' },
    { id: 'followups', n: 6, title: 'Follow-ups', tone: 't-followups' },
  ];
  const me = CAT.find(c => c.id === D.id) ?? { n: D.n ?? '', title: D.title };
  const live = CAT.filter(c => c.file), at = live.indexOf(me);

  // ---------- page skeleton ----------
  document.body.innerHTML = `
  <main class="sd" id="sd">
    <header class="sd-head">
      <div class="sd-id">
        <a class="home" href="../02_SD_Interview_Simulator.html" title="All designs"><i>SD</i> System Design</a>
        <span class="head-divider" aria-hidden="true"></span>
        <a id="prev-design" class="topic-arrow" aria-label="Previous design">‹</a>
        <h1><span class="num">${esc(me.n)}</span>${esc(D.title)}</h1>
        <a id="next-design" class="topic-arrow" aria-label="Next design">›</a>
        <span class="tagline">${esc(D.tagline)}</span>
      </div>
      <nav class="tabs" id="tabs" aria-label="Sections">${TABS.map((t, i) => `${i ? '<span class="sep" aria-hidden="true">›</span>' : ''}<button data-tab="${t.id}" class="${t.tone}" title="${esc(t.title)} (${t.n})"><span class="tn">${t.n}</span>${esc(t.title)}</button>`).join('')}</nav>
    </header>
    <section class="card" id="card">
      <div class="stage-col" id="stage-col">
        <div class="ov-top" id="ov-top" hidden></div>
        <div class="flow-pick" id="flow-pick" hidden></div>
        <div class="stage-wrap" id="stage-wrap">
          <svg id="stage" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(D.title)} architecture"></svg>
          <svg id="ghost" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"></svg>
          <p class="cap" id="cap" hidden></p>
          <div class="stage-hint" id="comp-hint" hidden>💡 <span><b>Hover</b> a component or a layer title to see why it's needed · <b>click</b> to pin it</span><button id="tour-btn">▶ Tour all</button></div>
          <div class="view-tools">
            <button id="loop-btn" class="tool" hidden>⏸ Pause</button
            ><button id="full-btn" class="tool" title="Full screen (F)">⛶ Full screen</button>
          </div>
          <div id="guide" class="guide-card" hidden aria-live="polite">
            <span class="gc-read" aria-hidden="true"><span id="gc-read-bar"></span></span>
            <div class="gc-head"><span class="eyebrow" id="step-count"></span><button id="gc-go" class="gc-go" style="visibility:hidden">▶ Start now</button><button id="gc-min" class="gc-min" title="Minimise the guide (M)">–</button></div>
            <h2 id="step-title"></h2>
            <div class="gc-body">
              <p id="step-text"></p>
              <p class="gc-watch"><b>👀 Watch for</b> <span id="g-observe"></span></p>
              <p class="gc-say" id="gc-say"><b>🎤 Say it</b> <span id="g-say"></span></p>
              <p class="gc-next">Next: <span id="g-next"></span></p>
            </div>
            <div class="gc-done" id="gc-done" hidden></div>
          </div>
          <div id="pop" class="pop" hidden></div>
        </div>
        <div class="ov-strip" id="ov-strip" hidden></div>
        <div id="player-ui" class="player-ui" hidden>
          <div class="hold" title="Time left on this step"><span id="hold-bar"></span></div>
          <div class="controls">
            <button id="prev-step" title="Previous step (←)">⏮ Prev</button
            ><button id="play" class="primary" title="Pause / play (Space)">⏸ Pause</button
            ><button id="next-step" title="Next step (→)">Next ⏭</button
            ><button id="restart" title="Start this flow again">↻ Restart</button>
            <div id="dots" class="dots"></div>
            <div id="speed" class="segmented speed" role="group" aria-label="Animation speed">
              <button data-speed=".5">0.5×</button><button data-speed="1">1×</button><button data-speed="1.5">1.5×</button><button data-speed="2">2×</button>
            </div>
          </div>
        </div>
      </div>
      <div class="doc" id="doc" hidden></div>
    </section>
  </main>
  <div id="toast" class="toast"></div>`;
  document.title = `${D.title} · System Design`;

  const arrow = (a, d, dir) => {
    a.classList.toggle('disabled', !d);
    a.href = d ? d.file : '#';
    a.title = d ? `${dir}: ${d.n} · ${d.title}` : `No ${dir.toLowerCase()} design rebuilt yet`;
  };
  arrow($('prev-design'), live[at - 1], 'Previous');
  arrow($('next-design'), live[at + 1], 'Next');

  const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); };

  // ---------- the shared stage ----------
  const stage = new Stage($('stage'));
  // An invisible twin of the stage: each flow step is run there instantly first, so the guide card can be placed
  // against the step's final picture (and its spotlight) before the step plays, and then stay put.
  const ghost = new Stage($('ghost'));
  const layerOf = id => D.layers.find(l => l.id === D.nodes[id].layer);
  // The architecture every stage tab starts from: layer bands (with a hoverable title), components, wires.
  function buildArch(s) {
    const v = { n: {}, bands: {} };
    for (const L of D.layers) {
      const g = s.g(0, 0, s.back, { class: 'band', 'data-layer': L.id });
      SD.el('rect', { class: 'band-bg', x: L.x0 + 4, y: 4, width: L.x1 - L.x0 - 8, height: VH - 8, rx: 14, fill: L.soft, stroke: L.line, 'stroke-dasharray': '4 5' }, g);
      const head = s.g((L.x0 + L.x1) / 2, 20, g, { class: 'band-head', 'data-layer': L.id });
      const w = L.title.length * 8.2 + 26;
      SD.el('rect', { x: -w / 2, y: -10, width: w, height: 20, rx: 10, fill: L.chip }, head);
      s.text(head, 0, .5, L.title.toUpperCase(), { 'font-size': 10.5, 'font-weight': 700, fill: L.color, 'letter-spacing': '.08em' });
      v.bands[L.id] = g;
    }
    for (const [id, spec] of Object.entries(D.nodes)) {
      const L = layerOf(id);
      v.n[id] = s.node(id, { ...spec, color: L.color, soft: L.chip });
    }
    for (const [a, b] of D.wires) s.wire(a, b);
    return v;
  }
  const setPausedLook = on => $('stage').classList.toggle('paused', on);

  // ---------- tabs ----------
  let tab = null, loopPaused = false;
  function setTab(id, arg) {
    if (!TABS.some(t => t.id === id)) id = 'overview';
    const changed = id !== tab;
    tab = id;
    for (const b of $('tabs').querySelectorAll('[data-tab]')) b.classList.toggle('selected', b.dataset.tab === id);
    const onStage = ['overview', 'components', 'flows'].includes(id);
    $('stage-col').hidden = !onStage;
    $('doc').hidden = onStage;
    for (const [el, on] of [['player-ui', 'flows'], ['flow-pick', 'flows'], ['loop-btn', 'overview'], ['cap', 'overview'], ['ov-top', 'overview'], ['ov-strip', 'overview'], ['comp-hint', 'components']]) $(el).hidden = id !== on;
    $('guide').hidden = true;
    hidePop(true);
    $('card').className = `card ${TABS.find(t => t.id === id).tone}`;
    stopTour();
    if (id !== 'flows') { player.stop(); dimForReading(false); }
    stage.clock.paused = false; setPausedLook(false);
    stage.clearSpotlight();
    const visited = read(`sd-visited-${D.id}`, []);
    if (!visited.includes(id)) save(`sd-visited-${D.id}`, [...visited, id]);
    markVisited();
    if (id === 'overview') openOverview();
    else if (id === 'components') openComponents(arg);
    else if (id === 'flows') openFlow(arg);
    else { stage.reset(); renderDoc(id); if (changed) $('doc').scrollTop = 0; }
    const hash = `#${id}${arg && id !== 'overview' ? `/${arg}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }
  function markVisited() {
    const visited = read(`sd-visited-${D.id}`, []);
    for (const b of $('tabs').querySelectorAll('[data-tab]')) b.classList.toggle('visited', visited.includes(b.dataset.tab));
  }
  for (const b of $('tabs').querySelectorAll('[data-tab]')) b.addEventListener('click', () => setTab(b.dataset.tab));

  // ---------- 1 · overview: the whole system, looping ----------
  function openOverview() {
    const I = D.intro;
    $('ov-top').innerHTML = `<div class="ov-title"><span class="eyebrow">How it works</span><b>${esc(I.headline)}</b></div>
      <div class="ov-stats">${I.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>`;
    $('ov-strip').innerHTML = `<ol class="how-strip" id="how-list">${I.points.map((p, k) => `<li data-k="${k}" style="--c:${p.color}"><span class="hn">${k + 1}</span><div><b>${esc(p.t)}</b><span>${rich(p.d)}</span></div></li>`).join('')}</ol>
      <div class="ov-cta"><button class="cta" data-go="components">2 · Why each component →</button><button class="cta ghost" data-go="flows">3 · Step-by-step flows</button></div>`;
    for (const b of $('ov-strip').querySelectorAll('[data-go]')) b.addEventListener('click', () => setTab(b.dataset.go));
    stage.reset();
    const v = buildArch(stage);
    for (const w of Object.values(stage.links)) w.classList.add('ambient');
    loopPaused = false; renderLoopBtn();
    const ui = {
      say(k) { for (const li of $('how-list').children) li.classList.toggle('on', +li.dataset.k === k); },
      cap(str) { $('cap').innerHTML = str ? rich(str) : ''; $('cap').style.visibility = str ? 'visible' : 'hidden'; },
    };
    ui.cap('');
    (async () => {
      try { for (;;) await D.overview(stage, v, ui); }
      catch (e) { if (!(e instanceof Cancelled)) throw e; }
    })();
  }
  function renderLoopBtn() {
    $('loop-btn').textContent = loopPaused ? '▶ Play' : '⏸ Pause';
    $('loop-btn').classList.toggle('selected', loopPaused);
  }
  function toggleLoop() {
    loopPaused = !loopPaused;
    stage.clock.paused = loopPaused; setPausedLook(loopPaused);
    renderLoopBtn();
  }
  $('loop-btn').addEventListener('click', toggleLoop);

  // ---------- 2 · components: hover (or click to pin) a box to see why it exists ----------
  const ORDER = D.layers.flatMap(L => Object.keys(D.nodes).filter(id => D.nodes[id].layer === L.id));
  let compV = null, pinned = null, shown = null, tourTimer = null, leaveTimer = null;
  function openComponents(sel) {
    stage.reset();
    compV = buildArch(stage);
    pinned = shown = null;
    if (sel && (D.nodes[sel] || D.layers.some(l => l.id === sel))) requestAnimationFrame(() => showComp(sel, true));
  }
  // Dim what is not part of the selection and animate the wires it uses (null = everything normal).
  function focusComp(sel) {
    const s = stage, isNode = !!D.nodes[sel], L = sel ? (isNode ? layerOf(sel) : D.layers.find(l => l.id === sel)) : null;
    const inSel = id => !sel || (isNode ? id === sel || touches(sel, id) : D.nodes[id].layer === sel);
    for (const [id, n] of Object.entries(compV.n)) n.setAttribute('opacity', inSel(id) ? 1 : .25);
    for (const [k, w] of Object.entries(s.links)) {
      const [a, b] = k.split('>'), on = !!sel && (isNode ? a === sel || b === sel : D.nodes[a].layer === sel || D.nodes[b].layer === sel);
      w.classList.toggle('flow', on); w.classList.remove('rev');
      if (on) w.style.setProperty('--c', (isNode ? L : layerOf(a)).color); else w.style.removeProperty('--c');
      w.setAttribute('opacity', !sel || on ? 1 : .22);
    }
    for (const [id, b] of Object.entries(compV.bands)) b.setAttribute('opacity', !sel || L?.id === id ? 1 : .4);
    if (isNode) s.spotlight([compV.n[sel]]); else s.clearSpotlight();
  }
  const touches = (a, b) => D.wires.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  function showComp(sel, pin = false) {
    clearTimeout(leaveTimer);
    if (pin) pinned = sel;
    if (shown === sel && !pin) return;
    shown = sel;
    focusComp(sel);
    const p = $('pop');
    p.innerHTML = popHtml(sel);
    p.classList.toggle('pinned', pinned === sel);
    p.hidden = false;
    $('pop-close')?.addEventListener('click', () => { stopTour(); pinned = null; hidePop(true); });
    for (const b of p.querySelectorAll('[data-sel]')) b.addEventListener('click', () => { stopTour(); showComp(b.dataset.sel, true); });
    placePop(D.nodes[sel] ? compV.n[sel] : compV.bands[sel].querySelector('.band-head'));
    if (pin) history.replaceState(null, '', `#components/${sel}`);
  }
  function hidePop(force = false) {
    clearTimeout(leaveTimer);
    if (!force && pinned) { showComp(pinned); return; }
    shown = null;
    $('pop').hidden = true;
    if (compV && tab === 'components') { focusComp(null); stage.clearSpotlight(); }
  }
  function popHtml(sel) {
    const close = `<button id="pop-close" class="pop-close" title="Unpin (Esc)">✕</button>`;
    const pinTag = `<span class="pin-tag">${pinned === sel ? '📌 Pinned' : 'Click to pin'}</span>`;
    if (!D.nodes[sel]) {
      const L = D.layers.find(l => l.id === sel);
      return `<div class="pop-in" style="--c:${L.color};--s:${L.chip}">
        <div class="pop-head"><span class="layer-chip">Layer</span><h3>${esc(L.title)}</h3>${pinTag}${close}</div>
        <div class="why"><b>✅ Why this layer exists</b><p>${rich(L.why)}</p></div>
        ${L.detail ? `<p class="comp-what">${rich(L.detail)}</p>` : ''}
        <div class="pop-list">${ORDER.filter(id => D.nodes[id].layer === L.id).map(id => `<button data-sel="${id}"><b>${D.nodes[id].icon} ${esc(D.nodes[id].label)}</b><span>${rich(D.components[id].why)}</span></button>`).join('')}</div>
      </div>`;
    }
    const c = D.components[sel], N = D.nodes[sel], L = layerOf(sel), k = ORDER.indexOf(sel);
    return `<div class="pop-in" style="--c:${L.color};--s:${L.chip}">
      <div class="pop-head"><span class="ic">${N.icon}</span><div><h3>${esc(c.name ?? N.label)}</h3><span class="layer-chip">${esc(L.title)} · ${k + 1} / ${ORDER.length}</span></div>${pinTag}${close}</div>
      <p class="comp-what">${rich(c.what)}</p>
      <div class="why"><b>✅ Why it's required</b><p>${rich(c.why)}</p></div>
      <div class="without"><b>❌ Without it</b><p>${rich(c.without)}</p></div>
      <dl class="facts"><dt>Tech</dt><dd>${rich(c.tech)}</dd><dt>Scales by</dt><dd>${rich(c.scale)}</dd><dt>If it fails</dt><dd>${rich(c.fails)}</dd></dl>
    </div>`;
  }
  // Beside the component, on the side that hides the least of what it connects to (the lit-up neighbours count
  // most, other components a little). Left wins ties: data flows left → right, so the next hops are usually right.
  function placePop(anchor) {
    const p = $('pop');
    if (getComputedStyle(p).position === 'static') return;
    const wrap = $('stage-wrap').getBoundingClientRect(), b = anchor.getBoundingClientRect(), W = wrap.width, H = wrap.height, m = 10, gap = 16;
    const w = p.offsetWidth, h = p.offsetHeight, clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
    const l = b.left - wrap.left, r = b.right - wrap.left, t = b.top - wrap.top, bt = b.bottom - wrap.top, cy = t + b.height / 2 - h / 2, cx = l + b.width / 2 - w / 2;
    const related = id => D.nodes[shown] ? touches(shown, id) : D.nodes[id].layer === shown;
    const boxes = Object.entries(compV.n).filter(([id]) => id !== shown).map(([id, n]) => {
      const q = n.getBoundingClientRect();
      return { l: q.left - wrap.left, t: q.top - wrap.top, r: q.right - wrap.left, b: q.bottom - wrap.top, k: related(id) ? 25 : 2 };
    });
    const hidden = (x, y) => boxes.reduce((sum, a) => sum + Math.max(0, Math.min(x + w, a.r) - Math.max(x, a.l)) * Math.max(0, Math.min(y + h, a.b) - Math.max(y, a.t)) * a.k, 0);
    // Candidates in order of preference; a side that does not fit pays for being pushed back over the anchor.
    const options = [[l - gap - w, cy], [r + gap, cy], [cx, bt + gap], [cx, t - gap - h]].map(([x, y], k) => {
      const at = [clamp(x, m, W - w - m), clamp(y, m, H - h - m)];
      const overAnchor = Math.max(0, Math.min(at[0] + w, r) - Math.max(at[0], l)) * Math.max(0, Math.min(at[1] + h, bt) - Math.max(at[1], t));
      return { at, cost: hidden(...at) + overAnchor * 200 + k * 500 };
    });
    const best = options.reduce((a, o) => o.cost < a.cost ? o : a);
    p.style.left = `${best.at[0]}px`;
    p.style.top = `${best.at[1]}px`;
  }
  const hoverKey = e => { const n = e.target.closest?.('.sd-node'), h = e.target.closest?.('.band-head'); return n ? n.dataset.id : h ? h.dataset.layer : null; };
  $('stage').addEventListener('pointerover', e => {
    if (tab !== 'components' || tourTimer) return;
    const k = hoverKey(e);
    if (k) showComp(k);
  });
  $('stage').addEventListener('pointerout', e => {
    if (tab !== 'components' || tourTimer || !hoverKey(e) || hoverKey({ target: e.relatedTarget ?? document.body }) === shown) return;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => hidePop(), 220);
  });
  $('pop').addEventListener('pointerenter', () => clearTimeout(leaveTimer));
  $('pop').addEventListener('pointerleave', () => { if (tab === 'components' && !tourTimer) leaveTimer = setTimeout(() => hidePop(), 220); });
  $('stage').addEventListener('click', e => {
    if (tab !== 'components') return;
    stopTour();
    const k = hoverKey(e);
    if (k) showComp(k, true);
    else { pinned = null; hidePop(true); history.replaceState(null, '', '#components'); }
  });
  function stepComp(d) {
    const k = ORDER.indexOf(pinned ?? shown), next = ORDER[k < 0 ? (d > 0 ? 0 : ORDER.length - 1) : k + d];
    if (next) showComp(next, true);
    return !!next;
  }
  function startTour() {
    pinned = null;
    showComp(ORDER[0], true);
    tourTimer = setInterval(() => { if (!stepComp(1)) stopTour(); }, 7000);
    $('tour-btn').textContent = '⏸ Stop tour'; $('tour-btn').classList.add('selected');
  }
  function stopTour() {
    if (!tourTimer) return;
    clearInterval(tourTimer); tourTimer = null;
    $('tour-btn').textContent = '▶ Tour all'; $('tour-btn').classList.remove('selected');
  }
  $('tour-btn').addEventListener('click', e => { e.stopPropagation(); tourTimer ? stopTour() : startTour(); });

  // ---------- 3 · flows: the guide card floats next to whatever the step is about ----------
  let flow = null;
  const player = new Player(stage, {
    step(i, step) { renderStep(i, step); },
    async started(i) {
      const run = ++previewRun, preview = await previewStep(i);
      if (run === previewRun && player.i === i && tab === 'flows') { lastPreview = preview; placeGuide({ keep: true }); }
    },
    settled(i, step, v) { if (step.focus) { stage.spotlight(step.focus(v)); if (!lastPreview) placeGuide({ keep: true }); } },
    hold(t) { $('hold-bar').style.width = `${t * 100}%`; },
    read(t) { $('gc-read-bar').style.width = `${t * 100}%`; },
    state: renderPlayState,
    done() { renderDone(); },
  });
  function openFlow(arg) {
    const [id, step] = String(arg ?? '').split('/');
    flow = D.flows.find(f => f.id === id) ?? flow ?? D.flows[0];
    $('flow-pick').innerHTML = `<span class="fp-label">Flow</span>${D.flows.map((f, k) => `<button data-flow="${f.id}" class="${f === flow ? 'selected' : ''}" style="--c:${f.color}"><i></i>${k + 1}. ${esc(f.title)}<small>${esc(f.sub)}</small></button>`).join('')}`;
    for (const b of $('flow-pick').querySelectorAll('[data-flow]')) b.addEventListener('click', () => setTab('flows', b.dataset.flow));
    $('dots').innerHTML = flow.steps.map((st, k) => `<button class="dot" data-step="${k}" title="${k + 1}. ${esc(st.title)}" aria-label="Step ${k + 1}: ${esc(st.title)}"></button>`).join('');
    for (const d of $('dots').querySelectorAll('[data-step]')) d.addEventListener('click', () => player.seek(+d.dataset.step));
    guidePos = null;
    const f = flow;
    player.load({ build: s => { const v = buildArch(s); f.build?.(s, v); return v; }, steps: f.steps }, Math.max(0, (+step || 1) - 1));
  }
  function renderStep(i, step) {
    const steps = flow.steps;
    lastPreview = null; guideFullStep = false;
    stage.clearSpotlight();
    const c = $('guide');
    c.hidden = false; c.classList.remove('is-done');
    c.style.setProperty('--fc', flow.color);
    $('gc-done').hidden = true;
    $('step-count').textContent = `${flow.title} · ${i + 1} / ${steps.length}`;
    $('step-title').textContent = step.title;
    $('step-text').innerHTML = rich(step.text);
    $('g-observe').textContent = step.observe ?? '';
    $('gc-say').hidden = !step.say;
    $('g-say').textContent = step.say ? `“${step.say}”` : '';
    $('g-next').textContent = steps[i + 1] ? steps[i + 1].title : 'Flow complete';
    $('hold-bar').style.width = '0';
    $('dots').querySelectorAll('[data-step]').forEach((d, k) => { d.classList.toggle('current', k === i); d.classList.toggle('seen', k < i); });
    $('prev-step').disabled = i === 0;
    $('next-step').disabled = i === steps.length - 1;
    history.replaceState(null, '', `#flows/${flow.id}/${i + 1}`);
    renderPlayState();
    placeGuide({ keep: true });
  }
  function renderDone() {
    const k = D.flows.indexOf(flow), next = D.flows[k + 1];
    $('dots').querySelectorAll('[data-step]').forEach(d => { d.classList.remove('current'); d.classList.add('seen'); });
    stage.clearSpotlight();
    const c = $('guide');
    c.classList.add('is-done');
    $('step-count').textContent = `${flow.title} · done`;
    $('step-title').textContent = '✓ Flow complete';
    const box = $('gc-done');
    box.hidden = false;
    box.innerHTML = `<p>${rich(flow.takeaway ?? '')}</p>
      <div class="cta-row">${next ? `<button class="cta" id="next-flow">Next: ${esc(next.title)} →</button>` : `<button class="cta" id="to-explain">4 · How to explain it →</button>`}<button class="cta ghost" id="again">↻ Replay</button></div>`;
    $('next-flow')?.addEventListener('click', () => setTab('flows', next.id));
    $('to-explain')?.addEventListener('click', () => setTab('explain'));
    $('again').addEventListener('click', () => player.seek(0));
    lastPreview = null;
    placeGuide();
  }

  // Guide card placement (from the Kafka lessons): try card shapes at every spot on a grid and keep the one that hides
  // the least of the scene, never the spotlight, staying close to it. If even the best spot would hide text, fall back
  // to a shorter card (no "Next", then no "Say it", then no "Watch for", then just the title).
  let guidePos = null, lastPreview = null, previewRun = 0, guideMinOn = read('sd-guide-min', false), guideFullStep = false;
  const visible = n => +(n.closest('[opacity]')?.getAttribute('opacity') ?? 1) > .2;
  const weight = n => n.tagName === 'text' ? 10 : n.tagName === 'rect' && !/^(#fff|#ffffff|none|white)$/i.test(n.getAttribute('fill') ?? 'none') ? 3 : 1;
  const sceneRects = svg => [...svg.querySelectorAll('text, rect, line')].filter(n => !n.closest('defs, .sd-fx') && !n.classList.contains('band-bg') && visible(n))
    .map(n => { const b = n.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, k: weight(n), box: n.tagName === 'rect' }; });
  async function previewStep(i) {
    const track = player.track;
    try {
      ghost.reset();
      ghost.clock.instant = true;
      const v = track.build(ghost);
      for (let k = 0; k <= i; k++) await track.steps[k].run(ghost, v);
      const g = $('ghost').getBoundingClientRect(), pad = 14 * Math.min(g.width / VW, g.height / VH);
      const focus = (track.steps[i].focus?.(v) ?? []).filter(n => n?.isConnected && n.ownerSVGElement === $('ghost'))
        .map(n => n.getBoundingClientRect()).map(b => ({ left: b.left - pad, top: b.top - pad, right: b.right + pad, bottom: b.bottom + pad }));
      return { content: sceneRects($('ghost')), focus };
    } catch (e) { return null; }
  }
  function placeGuide({ keep = false } = {}) {
    const c = $('guide');
    if (c.hidden || tab !== 'flows' || getComputedStyle(c).position === 'static') return;
    const wrap = $('stage-wrap').getBoundingClientRect(), W = wrap.width, H = wrap.height, m = 10, top = 44;
    const local = b => ({ l: b.left - wrap.left, t: b.top - wrap.top, r: b.right - wrap.left, b: b.bottom - wrap.top });
    const boxes = lastPreview ? lastPreview.focus : [...stage.fx.children].map(b => b.getBoundingClientRect());
    const r = boxes.length ? local({ left: Math.min(...boxes.map(b => b.left)), top: Math.min(...boxes.map(b => b.top)), right: Math.max(...boxes.map(b => b.right)), bottom: Math.max(...boxes.map(b => b.bottom)) }) : null;
    const content = [...sceneRects($('stage')), ...(lastPreview?.content ?? [])].map(a => ({ ...local(a), k: a.k, box: a.box }));
    for (const b of boxes) content.push({ ...local(b), k: 1000 });
    const done = c.classList.contains('is-done');
    const variants = done ? [[]] : guideMinOn ? [['v-title']] : guideFullStep ? [[]]
      : [[], ['v-nonext'], ['v-nonext', 'v-nosay'], ['v-nonext', 'v-nosay', 'v-nowatch'], ['v-title']];
    const ALL = ['v-nonext', 'v-nosay', 'v-nowatch', 'v-title'];
    let pick = null;
    for (const variant of variants) {
      c.classList.remove(...ALL); c.classList.add(...variant);
      const titleOnly = variant.includes('v-title');
      const widths = titleOnly ? [null] : [...new Set([300, 350, 420, 520].map(x => Math.round(Math.min(x, W - 2 * m))))];
      let free = null, any = null, stayed = null;
      for (const width of widths) {
        c.style.width = width ? `${width}px` : '';
        const w = c.offsetWidth, h = c.offsetHeight;
        if (h > H - top - m) continue;
        const clamp = ([x, y]) => [Math.max(m, Math.min(x, W - w - m)), Math.max(top, Math.min(y, H - h - m))];
        const overlap = (x, y, a) => Math.max(0, Math.min(x + w, a.r) - Math.max(x, a.l)) * Math.max(0, Math.min(y + h, a.b) - Math.max(y, a.t));
        const crosses = (x, y, a) => a.box && overlap(x, y, a) > 0 && !(x >= a.l && x + w <= a.r && y >= a.t && y + h <= a.b) ? 4000 : 0;
        const near = (x, y) => r ? Math.hypot(Math.max(0, r.l - (x + w), x - r.r), Math.max(0, r.t - (y + h), y - r.b)) * 60
          : Math.min(x - m, W - w - m - x, y - top, H - h - m - y) * 20;
        const cost = ([x, y]) => content.reduce((sum, a) => sum + overlap(x, y, a) * a.k + crosses(x, y, a), 0) + near(x, y) + (width ?? 0) * 4;
        const serious = ([x, y]) => content.reduce((sum, a) => sum + (a.k >= 10 ? overlap(x, y, a) : 0), 0) > 40;
        const consider = (at, k) => {
          if (!any || k < any.cost) any = { variant, width, at, cost: k };
          if (!serious(at) && (!free || k < free.cost)) free = { variant, width, at, cost: k };
        };
        const stay = keep && guidePos?.width === width && guidePos.variant.join() === variant.join() ? clamp(guidePos.at) : null;
        for (let y = top; y <= H - h - m + 1; y += 20) for (let x = m; x <= W - w - m + 1; x += 20) consider([x, y], cost([x, y]));
        consider(clamp([W - w - m, top]), cost(clamp([W - w - m, top])));
        if (stay && !serious(stay)) stayed = { variant, width, at: stay, cost: cost(stay) };
      }
      if (stayed && free && stayed.cost <= free.cost * 1.1 + 300) free = stayed;
      pick = free ?? pick ?? any;
      if (free) break;
      if (variant === variants.at(-1)) pick = any ?? pick;
    }
    pick ??= { variant: ['v-title'], width: null, at: [m, top] };
    c.classList.remove(...ALL); c.classList.add(...pick.variant);
    c.style.width = pick.width ? `${pick.width}px` : '';
    guidePos = pick;
    c.style.left = `${pick.at[0]}px`; c.style.top = `${pick.at[1]}px`;
    const reduced = pick.variant.length > 0;
    $('gc-min').textContent = reduced ? '+' : '–';
    $('gc-min').title = reduced ? 'Show the whole guide (M)' : 'Minimise the guide (M)';
  }
  new ResizeObserver(async () => {
    if (tab === 'components' && shown) placePop(D.nodes[shown] ? compV.n[shown] : compV.bands[shown].querySelector('.band-head'));
    if (tab !== 'flows') return;
    if (lastPreview && player.track) {
      const run = ++previewRun, i = player.i, preview = await previewStep(i);
      if (run !== previewRun || player.i !== i) return;
      lastPreview = preview;
    }
    placeGuide({ keep: true });
  }).observe($('stage-wrap'));
  // + shows everything (undoing a minimise or an automatic shortening); – minimises.
  function toggleGuideCard() {
    if (guideMinOn) { guideMinOn = false; save('sd-guide-min', false); }
    else if (guidePos?.variant.length) guideFullStep = true;
    else { guideMinOn = true; save('sd-guide-min', true); }
    placeGuide({ keep: true });
  }
  $('gc-min').addEventListener('click', toggleGuideCard);

  function renderPlayState() {
    if (tab !== 'flows') return;
    const b = $('play'), p = player.phase;
    b.textContent = p === 'done' ? '↻ Replay' : p === 'waiting' ? '▶ Continue' : p === 'reading' && player.userPaused ? '▶ Start' : player.userPaused ? '▶ Play' : '⏸ Pause';
    const go = $('gc-go'), reading = p === 'reading', played = ['holding', 'waiting'].includes(p);
    go.style.visibility = reading || played ? 'visible' : 'hidden';
    go.textContent = reading ? '▶ Start now' : '↻ Replay step';
    go.classList.toggle('primary', reading);
    $('guide').classList.toggle('reading', reading && !player.userPaused);
    setPausedLook(player.userPaused && p !== 'done');
    dimForReading(reading);
  }
  // While the step is being read, the scene fades back so the eye goes to the guide card; whatever the step is
  // about (its focus, when it already exists) stays bright. The scene comes back as soon as the animation starts.
  function dimForReading(on) {
    for (const n of $('stage').querySelectorAll('.keep')) n.classList.remove('keep');
    if (on && player.v) {
      const focus = player.track?.steps[player.i]?.focus?.(player.v) ?? [];
      // Mark the top-level item that holds each focus node (a store row keeps its whole store bright).
      for (let n of focus) if (n?.isConnected && n.ownerSVGElement === $('stage')) {
        while (n.parentNode?.parentNode && n.parentNode.parentNode !== $('stage')) n = n.parentNode;
        n.classList.add('keep');
      }
    }
    $('stage').classList.toggle('dim', on);
    $('guide').classList.toggle('lit', on);
  }
  $('gc-go').addEventListener('click', () => player.phase === 'reading' ? player.startNow() : player.replay());
  $('play').addEventListener('click', () => player.toggle());
  $('prev-step').addEventListener('click', () => player.prev());
  $('next-step').addEventListener('click', () => player.next());
  $('restart').addEventListener('click', () => player.seek(0));
  function setSpeed(x) {
    stage.clock.speed = x; save('sd-speed', x);
    for (const b of $('speed').children) b.classList.toggle('selected', +b.dataset.speed === x);
  }
  for (const b of $('speed').children) b.addEventListener('click', () => setSpeed(+b.dataset.speed));
  setSpeed(read('sd-speed', 1));

  // Java-ish syntax colours (VS Code Dark+): keywords, types, methods, fields/variables, constants, strings, numbers, comments.
  const KEYWORDS = new Set('abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void volatile while var true false'.split(' '));
  const CONTROL = new Set('if else for while do switch case return throw try catch finally break continue new'.split(' '));
  function highlight(code) {
    const re = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\b\d[\d_.]*[LlFfDd]?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"/]+|\/)/g;
    let out = '', m, prev = '';
    while ((m = re.exec(code))) {
      const [tok, comment, str, num, word] = m;
      const span = cls => `<span class="${cls}">${esc(tok)}</span>`;
      if (comment) out += span('c-com');
      else if (str) out += span('c-str');
      else if (num) out += span('c-num');
      else if (word) {
        const next = code.slice(re.lastIndex).match(/^\s*(\S)/)?.[1];
        if (CONTROL.has(word)) out += span('c-ctl');
        else if (KEYWORDS.has(word)) out += span('c-kw');
        else if (/^[A-Z][A-Z\d_]+$/.test(word)) out += span('c-const');
        else if (next === '(' && prev !== 'new' && !/^[A-Z]/.test(word)) out += span('c-fn');
        else if (/^[A-Z]/.test(word)) out += span('c-type');
        else out += span('c-var');
        prev = word;
      } else out += esc(tok);
    }
    return out;
  }

  // ---------- 4–6 · documents ----------
  function renderDoc(id) {
    $('doc').className = `doc doc-${id}`;
    $('doc').onscroll = null;
    if (id === 'explain') renderExplain();
    else if (id === 'answer') renderAnswer();
    else renderFollowups();
  }
  let explainAt = 0, practice = read('sd-practice', false);
  function renderExplain() {
    const E = D.explain, total = E.reduce((a, s) => a + s.min, 0);
    const who = { I: ['Interviewer', 'iv'], C: ['You', 'you'], P: ['Tip', 'tip'] };
    const s = E[explainAt];
    $('doc').innerHTML = `<div class="doc-pad">
      <div class="doc-sticky"><div class="doc-head">
        <div><span class="eyebrow">How to explain it</span><h2>Drive the ${total}-minute interview, stage by stage</h2>
        <p class="muted">Interviewers grade the <b>structure</b> as much as the design. Follow the stages in order and say out loud which stage you are in.</p></div>
        <label class="switch" title="Blur your own lines so you can practise saying them first"><input type="checkbox" id="practice" ${practice ? 'checked' : ''}> Practice mode</label>
      </div>
      <div class="timebar">${E.map((st, k) => `<button data-k="${k}" class="${k === explainAt ? 'on' : ''}" style="flex:${st.min}"><b>${k + 1}. ${esc(st.t)}</b><span>${st.min} min</span></button>`).join('')}</div></div>
      <div class="explain">
        <ol class="ex-steps">${E.map((st, k) => `<li><button data-k="${k}" class="${k === explainAt ? 'on' : ''}"><span class="sn">${k + 1}</span><span><b>${esc(st.t)}</b><small>${esc(st.goal)}</small></span></button></li>`).join('')}</ol>
        <div class="chat-card">
          <div class="chat-head"><span class="eyebrow">Stage ${explainAt + 1} of ${E.length} · ~${s.min} min</span><h3>${esc(s.t)}</h3><p class="muted">${rich(s.goal)}</p></div>
          <div class="chat ${practice ? 'practice' : ''}">${s.lines.map(([w, t]) => `<div class="msg ${who[w][1]}"><span class="who">${who[w][0]}</span><p>${rich(t)}</p></div>`).join('')}</div>
          ${s.avoid ? `<p class="avoid"><b>⚠ Avoid</b> ${rich(s.avoid)}</p>` : ''}
          <div class="chat-nav">
            <button id="ex-prev" ${explainAt ? '' : 'disabled'}>‹ Previous stage</button>
            ${explainAt < E.length - 1 ? `<button id="ex-next" class="primary">Next: ${esc(E[explainAt + 1].t)} ›</button>` : `<button id="ex-next" class="primary">5 · Interview answer ›</button>`}
          </div>
        </div>
      </div></div>`;
    for (const b of $('doc').querySelectorAll('[data-k]')) b.addEventListener('click', () => { explainAt = +b.dataset.k; renderExplain(); });
    $('practice').addEventListener('change', e => { practice = e.target.checked; save('sd-practice', practice); renderExplain(); });
    for (const m of $('doc').querySelectorAll('.practice .msg.you')) m.addEventListener('click', () => m.classList.add('shown'));
    $('ex-prev').addEventListener('click', () => { explainAt--; renderExplain(); });
    $('ex-next').addEventListener('click', () => { if (explainAt < E.length - 1) { explainAt++; renderExplain(); } else setTab('answer'); });
  }
  function renderAnswer() {
    const A = D.answer;
    $('doc').innerHTML = `<div class="doc-pad">
      <div class="doc-sticky"><div class="doc-head"><div><span class="eyebrow">Interview-ready answer</span><h2>What to actually say</h2>
      <p class="muted">Start with the 60-second version, then expand any section the interviewer picks.</p></div></div>
      <nav class="jump" id="jump" aria-label="Jump to a section">${[['a-pitch', '⏱ 60-second answer'], ...A.sections.map((sec, k) => [`a-sec${k}`, sec.h]), ['a-dec', '⚖ Trade-offs'], ['a-code', '{ } Code']].map(([id, t]) => `<button data-jump="${id}">${esc(t)}</button>`).join('')}</nav></div>
      <section class="pitch" id="a-pitch">
        <div class="pitch-head"><b>⏱ The 60-second answer</b><button id="copy-pitch">⧉ Copy</button></div>
        <p>${rich(A.summary)}</p>
      </section>
      <div class="ans-grid">${A.sections.map((sec, k) => `<section class="ans" id="a-sec${k}" style="--c:${sec.color ?? '#2f6fe0'}"><h3>${esc(sec.h)}</h3>${sec.html}</section>`).join('')}</div>
      <section class="ans wide" id="a-dec" style="--c:#8f4fc4"><h3>⚖ Key decisions & trade-offs</h3>
        <table class="dec"><thead><tr><th>Decision</th><th>Why</th><th>Trade-off</th></tr></thead><tbody>${A.decisions.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      </section>
      <div class="code-grid" id="a-code">${A.code.map((c, k) => `<section class="code">
        <div class="code-head"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-title">${esc(c.t)}</span><button class="code-copy" data-code="${k}" title="Copy code">⧉ Copy</button></div>
        <pre><code>${highlight(c.code).split('\n').map(line => `<span class="ln">${line || ' '}</span>`).join('')}</code></pre></section>`).join('')}</div>
      <div class="cta-row end"><button class="cta" id="to-follow">6 · Practise the follow-ups →</button></div>
    </div>`;
    $('copy-pitch').addEventListener('click', () => navigator.clipboard?.writeText(A.summary.replace(/\*\*|`/g, '')).then(() => toast('Copied the 60-second answer'), () => toast('Copy failed')));
    $('to-follow').addEventListener('click', () => setTab('followups'));
    for (const b of $('doc').querySelectorAll('[data-code]')) b.addEventListener('click', () => navigator.clipboard?.writeText(A.code[+b.dataset.code].code).then(() => toast('Code copied'), () => toast('Copy failed')));
    // Jump bar: scroll inside the pane, and mark the section currently under the frozen header.
    const doc = $('doc'), jumps = [...$('jump').children], offset = () => doc.querySelector('.doc-sticky').offsetHeight + 12;
    const top = id => $(id).getBoundingClientRect().top - doc.getBoundingClientRect().top + doc.scrollTop;
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    // On narrow screens the pane does not scroll by itself (the page does), so scroll the page there instead.
    for (const b of jumps) b.addEventListener('click', () => doc.scrollHeight > doc.clientHeight + 1
      ? doc.scrollTo({ top: top(b.dataset.jump) - offset(), behavior }) : $(b.dataset.jump).scrollIntoView({ behavior }));
    const mark = () => {
      let cur = jumps[0];
      for (const b of jumps) if (top(b.dataset.jump) - offset() <= doc.scrollTop + 8) cur = b;
      if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4) cur = jumps.at(-1);
      for (const b of jumps) b.classList.toggle('on', b === cur);
    };
    doc.onscroll = mark; mark();
  }
  let fuGroup = 'all', fuOpen = 0;
  function renderFollowups() {
    const G = D.followGroups, list = D.followups.filter(f => fuGroup === 'all' || f.g === fuGroup);
    $('doc').innerHTML = `<div class="doc-pad">
      <div class="doc-sticky"><div class="doc-head"><div><span class="eyebrow">Follow-up questions</span><h2>What they ask next, and what to answer</h2>
      <p class="muted">Each answer has the same shape: <b>what happens</b> → <b>why</b> → <b>how you handle it</b> → <b>the trade-off</b>. Saying the trade-off unprompted is what separates senior answers.</p></div></div>
      <div class="fu-filter"><button data-g="all" class="${fuGroup === 'all' ? 'selected' : ''}">All <small>${D.followups.length}</small></button>${Object.entries(G).map(([k, g]) => `<button data-g="${k}" class="${fuGroup === k ? 'selected' : ''}" style="--c:${g.color}">${esc(g.name)} <small>${D.followups.filter(f => f.g === k).length}</small></button>`).join('')}</div></div>
      <div class="fu-list">${list.map((f, k) => `<details ${k === fuOpen ? 'open' : ''} style="--c:${G[f.g].color}">
        <summary><span class="fu-g">${esc(G[f.g].name)}</span><span class="fu-q">${esc(f.q)}</span></summary>
        <div class="fu-body">
          <div><b>What happens</b><p>${rich(f.what)}</p></div>
          <div><b>Why</b><p>${rich(f.why)}</p></div>
          <div class="say"><b>🎤 Say this</b><p>${rich(f.how)}</p></div>
          <div><b>Trade-off</b><p>${rich(f.trade)}</p></div>
          ${f.flow ? `<button class="watch" data-flow="${f.flow}">▶ Watch it in Flows: ${esc(D.flows.find(x => x.id === f.flow).title)}</button>` : ''}
        </div></details>`).join('')}</div>
    </div>`;
    for (const b of $('doc').querySelectorAll('[data-g]')) b.addEventListener('click', () => { fuGroup = b.dataset.g; fuOpen = 0; renderFollowups(); });
    const items = [...$('doc').querySelectorAll('.fu-list details')];
    items.forEach((d, k) => d.addEventListener('toggle', () => { if (d.open) { fuOpen = k; for (const o of items) if (o !== d) o.open = false; } }));
    for (const b of $('doc').querySelectorAll('[data-flow]')) b.addEventListener('click', () => setTab('flows', b.dataset.flow));
    // An open question's heading sticks just below the frozen title + filters.
    $('doc').style.setProperty('--fu-top', `${$('doc').querySelector('.doc-sticky').offsetHeight}px`);
  }

  // ---------- full screen, keys, routing ----------
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else $('sd').requestFullscreen?.().catch(() => {});
  }
  $('full-btn').addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    const on = !!document.fullscreenElement;
    document.body.classList.toggle('focus', on);
    $('full-btn').textContent = on ? '✕ Exit full screen' : '⛶ Full screen';
  });
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select')) return;
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (e.key >= '1' && e.key <= '6') { setTab(TABS[+e.key - 1].id); return; }
    if (e.key === ' ' && ['flows', 'overview'].includes(tab)) {
      e.preventDefault();
      if (!e.repeat) tab === 'flows' ? player.toggle() : toggleLoop();
      return;
    }
    if (dir) {
      if (tab === 'flows') { e.preventDefault(); dir < 0 ? player.prev() : player.next(); }
      else if (tab === 'components') { e.preventDefault(); stopTour(); stepComp(dir); }
      return;
    }
    if (e.key === 'Escape' && tab === 'components') { stopTour(); pinned = null; hidePop(true); return; }
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'f') toggleFullscreen();
    else if (k === 'm' && tab === 'flows') toggleGuideCard();
  });
  function route() {
    const [id, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
    setTab(id || 'overview', rest.join('/') || undefined);
  }
  addEventListener('hashchange', route);
  route();
  window.sdPage = { stage, player, setTab, get tab() { return tab; } };
})();
