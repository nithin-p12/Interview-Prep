// Core Components page (window.CORE): one pill per building block, the same six slides for each, one full-width stage.
//   What is it › Without vs With (live traffic + switch) › How it works (pick a variant) › Pros & cons
//   › When to choose (+ alternatives) › In the interview. A "When to use what" pill holds a cheat sheet and a quiz.
// Uses scene.js (Stage) and stream.js (loop / dot / meter); a component's visual slides are build(stage) functions
// that may return { set(value) } for the switch or the variant buttons.
(function () {
  const P = window.CORE, { Stage } = window.SD;
  const [VW, VH] = P.viewBox ?? [1100, 400];
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const esc = str => String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rich = str => esc(str ?? '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');

  const SLIDES = [
    { id: 'what', title: 'What is it', stage: true },
    { id: 'why', title: 'Without vs With', stage: true },
    { id: 'how', title: 'How it works', stage: true },
    { id: 'pros', title: 'Pros & cons' },
    { id: 'when', title: 'When to choose' },
    { id: 'say', title: 'In the interview' },
  ];
  const SHEET = [{ id: 'sheet', title: 'Cheat sheet' }, { id: 'quiz', title: 'Quiz' }];
  const slidesOf = c => c.sheet ? SHEET : SLIDES;
  const docVersion = document.querySelector('meta[name="doc-version"]')?.content;
  document.title = `${P.title} · System Design${docVersion ? ` · ${docVersion}` : ''}`;

  document.body.innerHTML = `
  <main class="sd cc" id="sd">
    <header class="sd-head">
      <div class="sd-id">
        <a class="home" href="../02_SD_Interview_Simulator.html" title="All designs"><i>SD</i> System Design</a>
        <span class="head-divider" aria-hidden="true"></span>
        <h1><span class="num">★</span>${esc(P.title)}</h1>
        <span class="tagline">${esc(P.tagline)}</span>
      </div>
      <nav class="cc-pills" id="pills" aria-label="Components">${P.components.map(c => `<button data-c="${c.id}" style="--c:${c.color}" title="${esc(c.title)}"><span class="ci">${c.icon}</span>${esc(c.short ?? c.title)}</button>`).join('')}</nav>
    </header>
    <section class="card" id="card">
      <div class="cc-bar">
        <nav class="cc-slides" id="slides" aria-label="Slides"></nav>
        <span class="cc-nav"><button id="prev" title="Previous (←)" aria-label="Previous">‹</button><button id="next" title="Next (→)" aria-label="Next">›</button></span>
      </div>
      <div class="cc-note" id="note"></div>
      <div class="stage-wrap" id="stage-wrap">
        <svg id="stage" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img"></svg>
        <div class="view-tools"><button id="full-btn" class="tool icon" title="Full screen (F)" aria-label="Full screen">⛶</button></div>
      </div>
      <div class="cc-doc" id="doc" hidden></div>
    </section>
  </main>`;

  const stage = new Stage($('stage'));
  let cur = null;
  const comp = id => P.components.find(c => c.id === id);

  function show(cid, sid) {
    const c = comp(cid) ?? P.components[0], list = slidesOf(c), sl = list.find(s => s.id === sid) ?? list[0];
    cur = { c, sl };
    history.replaceState(null, '', `#${c.id}/${sl.id}`);
    save('cc-last', [c.id, sl.id]);
    $('card').style.setProperty('--m', c.color);
    for (const b of $('pills').children) b.classList.toggle('selected', b.dataset.c === c.id);
    $('slides').innerHTML = list.map((s, i) => `<button data-s="${s.id}" class="${s.id === sl.id ? 'selected' : ''}"><span class="tn">${i + 1}</span>${esc(s.title)}</button>`).join('');
    stage.reset();
    const onStage = !!sl.stage;
    $('note').hidden = $('stage-wrap').hidden = !onStage;
    $('doc').hidden = onStage;
    if (onStage) renderStage(c, sl, c[sl.id]);
    else { $('doc').innerHTML = DOCS[sl.id](c, c[sl.id] ?? {}); $('doc').scrollTop = 0; }
    const flat = order(), k = flat.findIndex(([a, b]) => a === c.id && b === sl.id);
    $('prev').disabled = k <= 0; $('next').disabled = k >= flat.length - 1;
  }
  const order = () => P.components.flatMap(c => slidesOf(c).map(s => [c.id, s.id]));
  function step(dir) {
    const flat = order(), k = flat.findIndex(([a, b]) => a === cur.c.id && b === cur.sl.id), to = flat[k + dir];
    if (to) show(...to);
  }

  // ---------- visual slides: a short note on top, the diagram takes the rest ----------
  function renderStage(c, sl, d) {
    const why = sl.id === 'why';
    const opts = why ? [d.without ?? `Without ${c.short ?? c.title}`, d.with ?? `With ${c.short ?? c.title}`] : d.options;
    $('note').innerHTML = `<div class="cc-text"><span class="eyebrow">${c.icon} ${esc(c.title)} · ${esc(sl.title)}</span>
        <h2>${rich(d.title)}</h2><p>${rich(d.text)}</p>${d.explain ? '<p class="cc-opt" id="opt-text"></p>' : ''}</div>
      ${opts ? `<div class="cc-ctl"><div class="segmented cc-seg${why ? ' ww' : ''}" role="group">${opts.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('')}</div>${d.hint ? `<small>${rich(d.hint)}</small>` : ''}</div>` : ''}`;
    const sim = d.build(stage) ?? {};
    if (!opts) return;
    let at = d.start ?? 0;
    const ctl = $('note').querySelector('.cc-ctl');
    const pick = i => {
      at = i;
      ctl.querySelectorAll('button').forEach(b => b.classList.toggle('selected', +b.dataset.i === at));
      if (d.explain) $('opt-text').innerHTML = rich(d.explain[at]);
      sim.set?.(why ? !!at : at);
    };
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) pick(+b.dataset.i); });
    pick(at);
  }

  // ---------- text slides ----------
  const items = list => list.map(x => Array.isArray(x) ? `<li><b>${rich(x[0])}</b> ${rich(x[1])}</li>` : `<li>${rich(x)}</li>`).join('');
  const table = (head, rows, hl) => `<table class="cc-tbl"><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr class="${r[0] === hl ? 'me' : ''}">${r.map(v => `<td>${rich(v)}</td>`).join('')}</tr>`).join('')}</table>`;
  const DOCS = {
    pros: (c, d) => `<div class="cc-grid two">
        <section class="cc-box good"><h3>✅ Pros</h3><ul>${items(d.pros)}</ul></section>
        <section class="cc-box bad"><h3>⚠️ Cons &amp; costs</h3><ul>${items(d.cons)}</ul></section></div>
      <p class="cc-bottom"><b>Bottom line</b> ${rich(d.bottom)}</p>`,
    when: (c, d) => `<div class="cc-grid two">
        <section class="cc-box good"><h3>✅ Choose it when</h3><ul>${items(d.choose)}</ul></section>
        <section class="cc-box bad"><h3>⛔ Skip it when</h3><ul>${items(d.avoid)}</ul></section></div>
      <section class="cc-box"><h3>🔀 Alternatives</h3>${table(d.alt.head, d.alt.rows, d.alt.me)}</section>`,
    say: (c, d) => `<div class="cc-grid say">
        <section class="cc-box"><h3>🎤 Say it like this</h3><ol>${items(d.lines)}</ol>
          <div class="cc-used"><b>Used in</b>${d.used.map(([t, f]) => f ? `<a href="${f}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join('')}</div></section>
        <section class="cc-box cc-qa"><h3>❓ Follow-up questions</h3>${d.qa.map(([q, a]) => `<details><summary>${rich(q)}</summary><p>${rich(a)}</p></details>`).join('')}</section></div>`,
    sheet: c => `<section class="cc-box"><h3>🧭 You see this problem → reach for this component</h3>
        ${table(['You see / need', 'Reach for', 'Why it fixes it'], c.rows.map(r => [r[0], `[[${r[1]}]]`, r[2]]))
          .replace(/\[\[(\w+)\]\]/g, (m, id) => { const x = comp(id); return x ? `<button class="cc-go" data-go="${id}" style="--c:${x.color}">${x.icon} ${esc(x.short ?? x.title)}</button>` : m; })}</section>
      <p class="cc-bottom"><b>Rule of thumb</b> ${rich(c.rule)}</p>`,
    quiz: c => `<section class="cc-box cc-quiz" id="quiz"></section>`,
  };

  // quiz: one scenario at a time, pick the component, see why
  let qi = 0, score = 0, answered = false;
  function renderQuiz() {
    const c = comp('pick'), q = c.quiz[qi], box = $('quiz');
    if (!box) return;
    if (!q) {
      box.innerHTML = `<h3>🏁 Done: ${score} / ${c.quiz.length}</h3><p>${score === c.quiz.length ? 'Perfect. You know when to use what.' : 'Open the components you missed and replay their <b>Without vs With</b> slide.'}</p><button class="primary" data-q="again">↻ Try again</button>`;
      return;
    }
    box.innerHTML = `<div class="q-head"><span class="eyebrow">Question ${qi + 1} / ${c.quiz.length}</span><span class="q-score">score ${score}</span></div>
      <h3 class="q-text">${rich(q.q)}</h3>
      <div class="q-opts">${c.choices.map(id => { const x = comp(id); return `<button data-a="${id}" style="--c:${x.color}">${x.icon} ${esc(x.short ?? x.title)}</button>`; }).join('')}</div>
      <p class="q-why" id="q-why" hidden></p>`;
    answered = false;
  }
  $('doc').addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) return show(go.dataset.go, 'why');
    const a = e.target.closest('[data-a]'), c = comp('pick');
    if (a && !answered) {
      const q = c.quiz[qi], ok = a.dataset.a === q.a;
      answered = true; if (ok) score++;
      $('quiz').querySelectorAll('[data-a]').forEach(b => { b.disabled = true; b.classList.toggle('right', b.dataset.a === q.a); b.classList.toggle('wrong', b === a && !ok); });
      const why = $('q-why'); why.hidden = false;
      why.innerHTML = `<b>${ok ? '✅ Right.' : '❌ Not quite.'}</b> ${rich(q.why)} <button class="primary" data-q="next">Next ›</button>`;
      $('quiz').querySelector('.q-score').textContent = `score ${score}`;
      return;
    }
    const nav = e.target.closest('[data-q]');
    if (nav) { if (nav.dataset.q === 'again') { qi = 0; score = 0; } else qi++; renderQuiz(); }
  });
  const showRaw = show;
  show = (cid, sid) => { showRaw(cid, sid); if (cur.sl.id === 'quiz') { qi = 0; score = 0; renderQuiz(); } };

  // ---------- wiring ----------
  $('pills').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) show(b.dataset.c, cur.c.id === b.dataset.c ? cur.sl.id : null); });
  $('slides').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) show(cur.c.id, b.dataset.s); });
  $('prev').onclick = () => step(-1);
  $('next').onclick = () => step(1);
  $('full-btn').onclick = () => document.fullscreenElement ? document.exitFullscreen() : $('sd').requestFullscreen?.().catch(() => {});
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'f' || e.key === 'F') $('full-btn').click();
    else if (/^[1-6]$/.test(e.key)) { const s = slidesOf(cur.c)[+e.key - 1]; if (s) show(cur.c.id, s.id); }
  });
  const fromHash = () => location.hash.replace(/^#\/?/, '').split('/');
  addEventListener('hashchange', () => { const [a, b] = fromHash(); if (a && (a !== cur.c.id || b !== cur.sl.id)) show(a, b); });
  const [h1, h2] = fromHash();
  if (h1 && comp(h1)) show(h1, h2); else show(...read('cc-last', [P.components[0].id, 'what']));
  save('sd-visited-core', 1);
})();
