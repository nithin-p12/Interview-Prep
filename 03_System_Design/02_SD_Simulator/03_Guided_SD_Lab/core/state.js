// Learning progress (per system, in localStorage) and the URL hash route: #<stageId> or #<stageId>/<flowId>.
// Storage can be unavailable (private windows, blocked site data), so every access is guarded.
(function () {
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* progress just isn't remembered */ } };

  LAB.State = class {
    constructor(systemId) {
      this.key = `glab:${systemId}`;
      const s = read(this.key, {});
      this.reached = s.reached ?? 0;   // furthest stage index unlocked
      this.done = new Set(s.done ?? []); // stage ids the learner continued past
    }
    persist() { save(this.key, { reached: this.reached, done: [...this.done] }); }
    unlock(i) { if (i > this.reached) { this.reached = i; this.persist(); } }
    complete(id) { this.done.add(id); this.persist(); }
    reset() { this.reached = 0; this.done.clear(); this.persist(); }
  };

  LAB.prefs = {
    get: (k, d) => read(`glab:pref:${k}`, d),
    set: (k, v) => save(`glab:pref:${k}`, v),
  };

  LAB.route = {
    parse() { const [stage, flow] = decodeURIComponent(location.hash.slice(1)).split('/'); return { stage: stage || null, flow: flow || null }; },
    set(stage, flow) {
      const h = `#${stage}${flow ? `/${flow}` : ''}`;
      if (location.hash !== h) history.replaceState(null, '', h);
    },
  };
})();
