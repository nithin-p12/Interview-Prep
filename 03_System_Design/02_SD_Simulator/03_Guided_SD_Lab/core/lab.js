// Guided SD Lab: shared namespace, system registry, a pausable animation clock and small text helpers.
// Classic script (no modules) so index.html also works when opened straight from disk (file://).
(function () {
  const systems = {};
  class Cancelled extends Error {}
  const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

  // Speed-aware, pausable tweens. cancel() rejects every running tween with Cancelled.
  class Clock {
    constructor() { this.speed = 1; this.paused = false; this.token = 0; }
    cancel() { this.token++; }
    tween(ms, fn = () => {}, linear = false) {
      const token = this.token;
      return new Promise((resolve, reject) => {
        let elapsed = 0, last = performance.now();
        const frame = now => {
          if (token !== this.token) return reject(new Cancelled());
          if (!this.paused) elapsed += (now - last) * this.speed;
          last = now;
          const t = Math.min(1, elapsed / ms);
          fn(linear ? t : ease(t));
          t < 1 ? requestAnimationFrame(frame) : resolve();
        };
        requestAnimationFrame(frame);
      });
    }
    wait(ms) { return this.tween(ms); }
  }

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.LAB = {
    systems, Clock, Cancelled, esc,
    // A system is split over several files; each calls LAB.define(systemId, part, data).
    define(id, part, data) { (systems[id] ??= { id })[part] = data; return data; },
    // Content strings support **bold** and `code` (escaped first, so content stays plain text).
    rich: s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>'),
    $: id => document.getElementById(id),
    reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})();
