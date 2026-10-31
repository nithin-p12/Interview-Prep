// The progression engine. Each stage only declares what changes in the architecture:
//   arch: { nodes: { id: { x, y, label?, sub?, ghost? } },   add a node, or move / relabel an existing one
//           edges: [{ from, to, kind: 'sync'|'async', label, bend?, id? }], add (or replace, by id) a connection
//           remove: ['edgeId' | 'nodeId'] }                    drop connections or nodes
// The architecture at stage k is the fold of stages 0..k, so the diagram evolves instead of being redrawn per slide.
(function () {
  const edgeId = e => e.id ?? `${e.from}-${e.to}`;

  LAB.Progression = class {
    constructor(sys) {
      this.sys = sys;
      this.stages = sys.stages;
      this.cache = [];
      let nodes = {}, edges = {};
      for (const st of this.stages) {
        const a = st.arch ?? {};
        nodes = { ...nodes };
        edges = { ...edges };
        for (const id of a.remove ?? []) {
          delete edges[id];
          if (nodes[id]) { delete nodes[id]; for (const [k, e] of Object.entries(edges)) if (e.from === id || e.to === id) delete edges[k]; }
        }
        for (const [id, n] of Object.entries(a.nodes ?? {})) nodes[id] = { ...this.component(id), ...nodes[id], ...n, id };
        for (const e of a.edges ?? []) edges[edgeId(e)] = { kind: 'sync', ...e, id: edgeId(e) };
        this.cache.push({ nodes, edges });
      }
    }
    // Component definition with `extends` resolved (Service B reuses Service A's write-up, for example).
    component(id) {
      const c = this.sys.components[id];
      if (!c) throw new Error(`Unknown component "${id}"`);
      const base = c.extends ? this.component(c.extends) : {};
      return { ...base, ...c, id, label: c.name ?? base.name, sub: c.tech ?? base.tech };
    }
    index(id) { return Math.max(0, this.stages.findIndex(s => s.id === id)); }
    arch(k) { return this.cache[k]; }
    // What changed between stage k-1 and stage k (drives the "new" badges and the build animation).
    diff(k) {
      const a = k ? this.cache[k - 1] : { nodes: {}, edges: {} }, b = this.cache[k];
      const sameNode = (x, y) => x.label === y.label && x.sub === y.sub && !!x.ghost === !!y.ghost;
      const sameEdge = (x, y) => x.from === y.from && x.to === y.to && x.label === y.label && x.kind === y.kind;
      return {
        addedNodes: Object.keys(b.nodes).filter(id => !a.nodes[id]),
        removedNodes: Object.keys(a.nodes).filter(id => !b.nodes[id]),
        changedNodes: Object.keys(b.nodes).filter(id => a.nodes[id] && !sameNode(a.nodes[id], b.nodes[id])),
        addedEdges: Object.keys(b.edges).filter(id => !a.edges[id] || !sameEdge(a.edges[id], b.edges[id])),
        removedEdges: Object.keys(a.edges).filter(id => !b.edges[id]),
      };
    }
    // The first stage where a component appears.
    introducedAt(id) { return this.cache.findIndex(a => a.nodes[id]); }
    flows(k) { return (this.stages[k].flows ?? []).map(id => this.flow(id)); }
    flow(id) {
      const f = this.sys.flows[id];
      if (!f) throw new Error(`Unknown flow "${id}"`);
      return { ...f, id };
    }
  };
})();
