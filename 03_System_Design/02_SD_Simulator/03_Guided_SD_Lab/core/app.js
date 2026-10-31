// Wires the engine together for one system: loads its definition files, then drives
// navigation (left), the canvas + flows (centre) and the mentor / inspector (right).
(function () {
  const $ = LAB.$;

  // System files are plain scripts, loaded in order (works from file:// as well as from a web server).
  const load = src => new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error(`Could not load ${src}`));
    document.head.append(s);
  });

  let toastTimer;
  LAB.toast = msg => {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  };

  async function start() {
    const want = new URLSearchParams(location.search).get('system');
    const entry = LAB.catalog.find(s => s.id === want) ?? LAB.catalog[0];
    for (const f of entry.files) await load(`systems/${entry.id}/${f}.js`);
    run(LAB.systems[entry.id]);
  }

  function run(sys) {
    const prog = new LAB.Progression(sys), state = new LAB.State(sys.id), stages = sys.stages;
    const canvas = new LAB.Canvas($('canvas'), { onSelect: id => inspect(id) });
    const player = new LAB.FlowPlayer(canvas, $('flow-bar'));
    let k = -1, view = 'after', flowId = null, inspecting = null;
    let theme = LAB.prefs.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const applyTheme = () => { document.documentElement.dataset.theme = theme; };
    applyTheme();
    document.title = `${sys.config.title} · Guided System Design Lab`;

    const nav = () => LAB.renderNav($('nav'), {
      sys, k, state, theme,
      onPick: i => i <= state.reached ? show(i, { animate: i === k + 1 }) : LAB.toast(`Continue through stage ${state.reached + 1} first (or use “Unlock all”)`),
      onUnlockAll: () => { state.unlock(stages.length - 1); nav(); },
      onReset: () => { if (confirm('Forget your progress for this system?')) { state.reset(); show(0); } },
      onTheme: () => { theme = theme === 'dark' ? 'light' : 'dark'; LAB.prefs.set('theme', theme); applyTheme(); nav(); },
    });

    function show(i, { animate = false, flow = null } = {}) {
      const changed = i !== k;
      k = i; view = 'after'; inspecting = null;
      state.unlock(i);
      player.stop();
      const st = stages[k], summary = st.kind === 'summary';
      document.body.classList.toggle('summary', summary);
      $('work').hidden = summary; $('doc').hidden = !summary;
      nav();
      closeInspector();
      if (summary) {
        flowId = null;
        LAB.route.set(st.id);
        LAB.renderInterview($('doc'), { sys, prog, k, onInspect: inspect, onWatch: (s, f) => show(s, { flow: f }) });
        return;
      }
      $('stage-name').innerHTML = `<span class="sn">${String(k + 1).padStart(2, '0')}</span>${LAB.esc(st.title)}`;
      paintView();
      if (changed || !canvas.arch) draw(animate);
      const flows = prog.flows(k);
      flowId = flow && flows.some(f => f.id === flow) ? flow : null;
      picker();
      if (flowId) player.load(prog.flow(flowId));
      LAB.route.set(st.id, flowId);
    }
    // The diagram for the current stage. "Before" shows the previous stage with what this stage removes marked.
    function draw(animate) {
      const d = prog.diff(k);
      if (view === 'before' && k) canvas.render(prog.arch(k - 1), { going: [...d.removedEdges, ...d.removedNodes] });
      else canvas.render(prog.arch(k), { prev: animate && k ? prog.arch(k - 1) : null, fresh: k ? d : null });
      const added = d.addedNodes.map(id => prog.component(id).label);
      $('stage-delta').textContent = k && added.length ? `+ ${added.join(', ')}` : '';
    }
    function picker() {
      LAB.renderFlowPicker($('flow-pick'), prog.flows(k), flowId, id => {
        if (view !== 'after') { view = 'after'; paintView(); draw(false); }
        flowId = id; picker();
        player.load(prog.flow(id));
        LAB.route.set(stages[k].id, id);
      });
    }
    function paintView() {
      for (const b of $('view-seg').children) { b.classList.toggle('on', b.dataset.view === view); b.disabled = !k; }
    }
    $('view-seg').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (!b || b.dataset.view === view) return;
      view = b.dataset.view; player.stop(); flowId = null; picker(); paintView(); draw(false);
    });
    $('replay-build').addEventListener('click', () => {
      if (!k) return;
      view = 'after'; paintView(); player.stop(); flowId = null; picker();
      canvas.render(prog.arch(k - 1));
      requestAnimationFrame(() => draw(true));
    });
    $('zoom-in').addEventListener('click', () => canvas.zoom(1 / 1.2));
    $('zoom-out').addEventListener('click', () => canvas.zoom(1.2));
    $('zoom-fit').addEventListener('click', () => canvas.fit());

    function mentor() {
      LAB.renderMentor($('mentor'), {
        stage: stages[k], k, total: stages.length, next: stages[k + 1], prog,
        onContinue: () => { state.complete(stages[k].id); show(k + 1, { animate: true }); },
        onBack: () => show(k - 1),
        onInspect: inspect,
      });
    }
    function inspect(id) {
      inspecting = id;
      canvas.select(id);
      const arch = stages[k].kind === 'summary' ? prog.arch(k) : view === 'before' && k ? prog.arch(k - 1) : prog.arch(k);
      LAB.renderInspector($('inspector'), { id, prog, arch, onClose: closeInspector, onStage: i => show(i), closeLabel: stages[k].kind === 'summary' ? '✕ Close' : '‹ Mentor' });
      $('mentor').hidden = true; $('inspector').hidden = false;
      document.body.classList.add('inspecting');
      $('inspector').querySelector('button')?.focus({ preventScroll: true });
    }
    function closeInspector() {
      inspecting = null;
      canvas.select(null);
      $('inspector').hidden = true; $('mentor').hidden = false;
      document.body.classList.remove('inspecting');
      if (stages[k].kind !== 'summary') mentor();
    }

    addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select')) return;
      if (e.key === 'Escape' && inspecting) { closeInspector(); return; }
      if (!player.flow) return;
      if (e.key === ' ' && !e.target.closest('button, summary')) { e.preventDefault(); player.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); player.step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); player.step(-1); }
    });
    addEventListener('hashchange', () => {
      const r = LAB.route.parse(), i = stages.findIndex(s => s.id === r.stage);
      if (i >= 0 && i <= state.reached && (i !== k || r.flow !== flowId)) show(i, { flow: r.flow });
    });

    const r = LAB.route.parse(), want = stages.findIndex(s => s.id === r.stage);
    show(want >= 0 && want <= state.reached ? want : Math.min(state.reached, stages.length - 1), { flow: r.flow });
  }

  start().catch(e => { document.body.innerHTML = `<p class="fatal">${LAB.esc(e.message)}</p>`; throw e; });
})();
