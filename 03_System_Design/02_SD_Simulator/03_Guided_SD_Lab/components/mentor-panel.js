// Mentor panel: the senior engineer explains WHY this stage changes the design.
// A stage may carry: challenge {label, text}, problem, introduce {text, components}, why, how [], extra [],
// without, tradeoffs [], failures [], faq [{q, a}], takeaway. Missing fields are simply skipped.
(function () {
  const { esc, rich } = LAB;
  const list = (items, tag = 'ul') => `<${tag}>${items.map(x => `<li>${rich(x)}</li>`).join('')}</${tag}>`;

  // One "extra" block: text, list, ordered list, code or table.
  LAB.block = b => [
    b.text ? `<p>${rich(b.text)}</p>` : '',
    b.list ? list(b.list) : '',
    b.ol ? list(b.ol, 'ol') : '',
    b.table ? `<table class="tbl">${b.table.head ? `<thead><tr>${b.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${b.table.rows.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '',
    b.code ? `<pre class="code"><code>${esc(b.code)}</code></pre>` : '',
    b.after ? `<p class="muted">${rich(b.after)}</p>` : '',
  ].join('');

  const section = (cls, title, body, open) => `<details class="ms ${cls}" ${open ? 'open' : ''}><summary>${title}</summary><div class="ms-body">${body}</div></details>`;

  LAB.renderMentor = (host, { stage, k, total, next, prog, onContinue, onBack, onInspect }) => {
    const s = stage;
    const comps = (s.introduce?.components ?? []).map(id => prog.component(id));
    host.innerHTML = `
      <div class="m-head">
        <span class="avatar" aria-hidden="true">👩‍💻</span>
        <div><span class="eyebrow">Senior engineer · stage ${k + 1} of ${total}</span><h2>${esc(s.title)}</h2></div>
      </div>
      <div class="m-scroll">
        ${s.challenge ? `<div class="challenge c-${s.challenge.type ?? 'requirement'}"><b>${esc(s.challenge.label)}</b><p>${rich(s.challenge.text)}</p></div>` : ''}
        ${s.problem ? section('s-problem', 'Why the current design falls short', `<p>${rich(s.problem)}</p>`, true) : ''}
        ${s.introduce ? section('s-intro', 'What we introduce', `${comps.length ? `<div class="comp-chips">${comps.map(c => `<button class="cchip cat-${c.category}" data-inspect="${c.id}" title="Inspect ${esc(c.label)}"><i>${c.icon}</i>${esc(c.label)}</button>`).join('')}</div>` : ''}<p>${rich(s.introduce.text)}</p>`, true) : ''}
        ${s.why ? section('s-why', 'Why it is necessary', `<p>${rich(s.why)}</p>`, true) : ''}
        ${s.how ? section('s-how', 'How it works', list(s.how, 'ol'), true) : ''}
        ${(s.extra ?? []).map(b => section('s-extra', esc(b.t), LAB.block(b), b.open)).join('')}
        ${s.without ? section('s-without', 'What happens without it', `<p>${rich(s.without)}</p>`) : ''}
        ${s.tradeoffs ? section('s-trade', `Trade-offs <small>${s.tradeoffs.length}</small>`, list(s.tradeoffs)) : ''}
        ${s.failures ? section('s-fail', `Failure scenarios <small>${s.failures.length}</small>`, list(s.failures)) : ''}
        ${s.faq ? section('s-faq', `Common questions <small>${s.faq.length}</small>`, s.faq.map(f => `<div class="faq"><b>${rich(f.q)}</b><p>${rich(f.a)}</p></div>`).join('')) : ''}
        ${s.takeaway ? `<p class="takeaway"><b>Takeaway</b> ${rich(s.takeaway)}</p>` : ''}
      </div>
      <div class="m-foot">
        <button class="ghost-btn" data-m="back" ${k ? '' : 'disabled'}>‹ Back</button>
        ${next ? `<button class="primary" data-m="continue">Continue: ${esc(next.nav ?? next.title)} ›</button>` : ''}
      </div>`;
    host.onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.inspect) onInspect(b.dataset.inspect);
      else if (b.dataset.m === 'continue') onContinue();
      else if (b.dataset.m === 'back') onBack();
    };
  };
})();
