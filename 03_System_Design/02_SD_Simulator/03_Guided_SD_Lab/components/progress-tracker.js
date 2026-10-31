// Left panel: system name, overall progress and the one stage list (completed ✓ / current ● / upcoming ○ / locked).
(function () {
  const { esc } = LAB;
  LAB.renderNav = (host, { sys, k, state, onPick, onUnlockAll, onReset, onTheme, theme }) => {
    const stages = sys.stages, doneCount = stages.filter(s => state.done.has(s.id)).length;
    const pct = Math.round(doneCount / stages.length * 100);
    host.innerHTML = `
      <div class="n-top">
        <a class="home" href="${esc(sys.config.home)}" title="All system designs"><i>SD</i><span>System Design</span></a>
        <button class="icon-btn" data-n="collapse" title="Collapse the stage list" aria-label="Collapse the stage list">⟨</button>
      </div>
      <div class="n-sys">
        <span class="eyebrow">Guided lab</span>
        <h1>${esc(sys.config.title)}</h1>
        <div class="n-prog" title="${doneCount} of ${stages.length} stages completed"><span style="width:${pct}%"></span></div>
        <small class="muted">${doneCount} of ${stages.length} completed</small>
      </div>
      <ol class="n-list">${stages.map((s, i) => {
        const status = i === k ? 'cur' : state.done.has(s.id) ? 'done' : i <= state.reached ? 'open' : 'locked';
        const mark = { cur: '●', done: '✓', open: '○', locked: '🔒' }[status];
        return `<li><button data-k="${i}" class="st-${status}" ${status === 'locked' ? 'aria-disabled="true"' : ''} title="${esc(s.title)}${status === 'locked' ? ' (locked: continue through the earlier stages)' : ''}">
          <span class="sn">${String(i + 1).padStart(2, '0')}</span><span class="st">${esc(s.nav ?? s.title)}</span><span class="sm" aria-hidden="true">${mark}</span></button></li>`;
      }).join('')}</ol>
      <div class="n-foot">
        <button class="link" data-n="theme" title="Switch light / dark theme">${theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>
        ${state.reached < stages.length - 1 ? '<button class="link" data-n="unlock" title="Open every stage (useful for revision)">Unlock all</button>' : ''}
        <button class="link" data-n="reset" title="Forget progress for this system">Reset</button>
      </div>`;
    host.onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.k != null) onPick(+b.dataset.k);
      else if (b.dataset.n === 'collapse') document.body.classList.toggle('nav-min');
      else if (b.dataset.n === 'unlock') onUnlockAll();
      else if (b.dataset.n === 'reset') onReset();
      else if (b.dataset.n === 'theme') onTheme();
    };
  };
})();
