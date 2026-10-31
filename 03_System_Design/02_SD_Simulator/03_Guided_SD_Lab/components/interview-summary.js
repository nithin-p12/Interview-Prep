// Interview-ready view, assembled from the journey itself: the final architecture, component responsibilities,
// request flows (their step captions), and every stage's trade-offs and failure scenarios. Only the material that
// is not part of the stages (estimates, APIs, schema, follow-ups, the 45-minute plan) comes from knowledge-base.js.
(function () {
  const { esc, rich } = LAB;
  const ul = (xs, tag = 'ul') => `<${tag}>${xs.map(x => `<li>${rich(x)}</li>`).join('')}</${tag}>`;

  LAB.renderInterview = (host, { sys, prog, k, onInspect, onWatch }) => {
    const kb = sys.kb, arch = prog.arch(k);
    const finalIds = Object.keys(arch.nodes);
    const sec = [];
    // Sections are numbered in the order they are added (the 60-second answer stays unnumbered).
    const add = (id, h, html, wide = false) => sec.push({ id, h: id === 'pitch' ? h : `${sec.length} · ${h}`, html, wide });

    add('pitch', '⏱ 60-second answer', `<p class="lead">${rich(kb.summary)}</p>`, true);
    add('problem', 'Problem statement', `<p>${rich(kb.problem)}</p>`, true);
    add('req', 'Requirements', `<h4>Functional</h4>${ul(kb.requirements.functional)}<h4>Non-functional</h4>${ul(kb.requirements.nonFunctional)}${kb.requirements.outOfScope ? `<h4>Out of scope (say so)</h4>${ul(kb.requirements.outOfScope)}` : ''}`);
    add('cap', 'Capacity estimates', LAB.block(kb.capacity));
    add('api', 'APIs', LAB.block(kb.apis));
    add('schema', 'Database schema', LAB.block(kb.schema));
    add('arch', 'Final architecture', `<p class="muted">The architecture built over stages 1–${k}. Click a component to inspect it.</p><div class="mini-wrap"><svg class="mini" id="mini-arch" role="img" aria-label="Final architecture"></svg></div>`, true);
    // Copies of a component (Service B extends Service A) share one row: "Service A / Service B".
    const rows = finalIds.filter(id => !finalIds.includes(prog.component(id).extends)).map(id => {
      const names = [id, ...finalIds.filter(o => prog.component(o).extends === id)].map(o => arch.nodes[o].label);
      return { c: prog.component(id), name: names.join(' / '), sub: arch.nodes[id].sub };
    });
    add('resp', 'Component responsibilities', `<table class="tbl"><tbody>${rows.map(({ c, name, sub }) => `<tr><td><b>${c.icon} ${esc(name)}</b><br><span class="muted">${esc(sub ?? '')}</span></td><td>${ul(c.responsibilities ?? [])}</td></tr>`).join('')}</tbody></table>`, true);
    kb.flows.forEach((f, i) => {
      const flow = prog.flow(f.flow), steps = flow.variants ? flow.variants[f.variant ?? Object.keys(flow.variants)[0]].steps : flow.steps;
      const at = prog.stages.findIndex(s => s.flows?.includes(f.flow));
      add(`flow${i}`, esc(f.h), `${ul(steps.map(s => s.t), 'ol')}<button class="watch" data-watch="${f.flow}" data-k="${at}">▶ Watch it in stage ${at + 1}</button>`);
    });
    add('cache', 'Caching strategy', ul(kb.caching));
    add('scale', 'Scaling strategy', ul(kb.scaling));
    const byStage = key => prog.stages.map((s, i) => s[key]?.length ? `<h4>Stage ${i + 1} · ${esc(s.nav ?? s.title)}</h4>${ul(s[key])}` : '').join('');
    add('fail', 'Failure scenarios', byStage('failures'), true);
    add('trade', 'Trade-offs', `${kb.decisions ? LAB.block(kb.decisions) : ''}${byStage('tradeoffs')}`, true);
    add('fu', 'Follow-up questions', kb.followups.map((f, i) => `<details class="fu" ${i ? '' : 'open'}><summary>${rich(f.q)}</summary><p>${rich(f.a)}</p></details>`).join(''), true);
    add('plan', 'The 45-minute explanation', `<div class="plan">${kb.plan.map((p, i) => `<div class="pl"><span class="pm">${p.min} min</span><b>${i + 1}. ${esc(p.t)}</b>${ul(p.say)}</div>`).join('')}</div>`, true);

    host.innerHTML = `
      <div class="d-head"><span class="eyebrow">Stage ${k + 1} · Interview ready</span><h2>${esc(sys.config.title)}: the complete answer</h2>
        <button class="ghost-btn" id="d-copy" title="Copy the 60-second answer">⧉ Copy 60-second answer</button></div>
      <nav class="d-jump" id="d-jump" aria-label="Jump to a section">${sec.map(s => `<button data-jump="${s.id}">${esc(s.h.replace(/^\d+ · /, ''))}</button>`).join('')}</nav>
      <div class="d-scroll" id="d-scroll"><div class="d-grid">${sec.map(s => `<section class="d-sec${s.wide ? ' wide' : ''}" id="d-${s.id}"><h3>${s.h}</h3>${s.html}</section>`).join('')}</div></div>`;

    const mini = new LAB.Canvas(LAB.$('mini-arch'), { onSelect: onInspect });
    mini.render(arch);
    const scroll = LAB.$('d-scroll'), jumps = [...host.querySelectorAll('[data-jump]')];
    const top = id => LAB.$(`d-${id}`).offsetTop - scroll.querySelector('.d-grid').offsetTop;
    host.onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.jump) scroll.scrollTo({ top: top(b.dataset.jump), behavior: LAB.reducedMotion() ? 'auto' : 'smooth' });
      else if (b.dataset.watch) onWatch(+b.dataset.k, b.dataset.watch);
      else if (b.id === 'd-copy') navigator.clipboard?.writeText(kb.summary.replace(/\*\*|`/g, '')).then(() => LAB.toast('Copied the 60-second answer'), () => LAB.toast('Copy failed'));
    };
    // Scroll-spy: mark the section at the top of the pane.
    scroll.onscroll = () => {
      let cur = jumps[0];
      for (const b of jumps) if (top(b.dataset.jump) <= scroll.scrollTop + 24) cur = b;
      if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 4) cur = jumps.at(-1);
      for (const b of jumps) b.classList.toggle('on', b === cur);
    };
    scroll.onscroll();
  };
})();
