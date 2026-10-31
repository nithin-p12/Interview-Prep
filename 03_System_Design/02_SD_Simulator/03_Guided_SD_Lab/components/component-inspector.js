// Component inspector: HOW the selected component works inside. Same structure for every component;
// the content comes from the system's components.js, connections come from the current architecture.
(function () {
  const { esc, rich } = LAB;
  const SECTIONS = [
    ['purpose', 'Purpose', 'text'],
    ['whyIntroduced', 'Why it was introduced', 'text'],
    ['without', 'Without it', 'text'],
    ['with', 'With it', 'text'],
    ['responsibilities', 'Responsibilities', 'list'],
    ['internalFlow', 'Internal flow', 'ol'],
    ['failures', 'When it fails', 'list'],
    ['tradeoffs', 'Trade-offs', 'list'],
  ];

  LAB.renderInspector = (host, { id, prog, arch, onClose, onStage, closeLabel = '‹ Mentor' }) => {
    // Name and role as drawn in this stage (Spring Boot app becomes "Service A" once there are two).
    const n = arch.nodes[id], c = { ...prog.component(id), ...(n && { label: n.label, sub: n.sub }) };
    const at = prog.introducedAt(id), st = prog.stages[at];
    const links = Object.values(arch.edges).filter(e => e.from === id || e.to === id).map(e => {
      const out = e.from === id, other = arch.nodes[out ? e.to : e.from];
      return `<li><span class="dir">${out ? '→' : '←'}</span> <b>${esc(other.label)}</b> <span class="k k-${e.kind}">${e.kind === 'async' ? 'async' : 'sync'}</span>${e.label ? ` <span class="muted">${esc(e.label)}</span>` : ''}</li>`;
    });
    const body = SECTIONS.filter(([key]) => c[key]?.length).map(([key, title, kind]) => `<section class="is is-${key}"><h3>${title}</h3>${kind === 'text' ? `<p>${rich(c[key])}</p>` : `<${kind === 'ol' ? 'ol' : 'ul'}>${c[key].map(x => `<li>${rich(x)}</li>`).join('')}</${kind === 'ol' ? 'ol' : 'ul'}>`}</section>`);
    if (links.length) body.splice(4, 0, `<section class="is"><h3>Connections in this stage</h3><ul class="links">${links.join('')}</ul></section>`);
    host.innerHTML = `
      <div class="i-head">
        <button class="ghost-btn" data-i="close" title="Close the inspector (Esc)">${closeLabel}</button>
        <span class="eyebrow">Component inspector</span>
      </div>
      <div class="i-title cat-${c.category}">
        <span class="ic">${c.icon}</span>
        <div><h2>${esc(c.label)}</h2><span class="muted">${esc(c.sub ?? '')}</span></div>
      </div>
      ${st ? `<button class="i-since" data-i="stage" data-k="${at}">Introduced in stage ${at + 1} · ${esc(st.nav ?? st.title)}</button>` : ''}
      <div class="i-scroll">${body.join('')}</div>`;
    host.onclick = e => {
      const b = e.target.closest('button');
      if (b?.dataset.i === 'close') onClose();
      else if (b?.dataset.i === 'stage') onStage(+b.dataset.k);
    };
  };
})();
