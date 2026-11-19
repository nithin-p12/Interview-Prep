# Prompt: Interactive Animated Flow Diagram (AKS-traffic-flow style)

> Transcribed from a friend's prompt file (photos, 2026-11-19). Fill the TOPIC block, then follow the spec exactly.

Build a **single self-contained HTML file** (inline CSS + vanilla JS, no libraries, no external URLs) that teaches the topic below as an **interactive, animated flow diagram**. Follow this spec exactly.

## TOPIC
- Subject: `<e.g. "How an HTTPS request travels from a user to a pod on AKS">`
- Components (nodes): `<list them, e.g. User, DNS, Azure Front Door, CDN, Load Balancer, Ingress, Service, Pods, Kafka, Worker>`
- Groupings (zones / nested boxes): `<e.g. Internet › Azure Edge › Azure Region › AKS Cluster › namespaces>`
- Scenarios to animate: `<e.g. "API call + Kafka event", "Cache miss", "Cache hit", "Live mixed traffic">`

## 1. Page layout (fill the whole screen)
- `html,body{height:100%;overflow:hidden}`, font `"Segoe UI",system-ui`, page bg `#f4f6fb`.
- **Header** 64px, white, bottom border `#e5e7eb`: a small logo and title/subtitle on the left; on the right, segmented controls for **Scenario** and **Speed**, then **⏸ Pause** and **↻ Replay** buttons.
- **Main** `height:calc(100vh - 64px - 78px)` holds one `<svg viewBox="0 0 1600 860" preserveAspectRatio="xMidYMid meet" width=100% height=100%>`. The diagram must use the full canvas, so spread the nodes across the whole width.
- **Footer** 78px, white: a blue step badge (`3/17`, turns green and reads `LIVE` in mixed mode), the step title plus a protocol pill, a one-line explanation (ellipsis on overflow), progress dots (18x4px bars, `#0b5cff` when reached), and on the right stat tiles (Requests / Cache hits / Events / Responses).
- Bottom-left hint: "Click any component for details · Space pause · 1 2 3 speed · R replay".
- SVG background: dotted grid pattern (24px cells, 1px dots `#e2e8f0`).

## 2. Segmented controls
- Container `background:#f1f5f9;border-radius:10px;padding:3px`. Small uppercase grey label ("SCENARIO", "SPEED").
- Buttons are transparent, 12.5px, weight 600, colour `#475569`. Active button: white bg, colour `#0b5cff`, `box-shadow:0 1px 3px rgba(0,0,0,.14)`.
- Speed options: **0.5x, 1x (default), 2x**.

## 3. Zones (containers), each with a different light background
Rounded rects drawn first, so they sit behind everything. Big zones: `rx=18`, 1.6px solid stroke, label uppercase 13px weight 800 letter-spacing 1.2px `#334155` at the top-left. Inner zones (namespaces / sub-groups): `rx=12`, 1.2px **dashed (7 5)** stroke, label in 11px monospace `#64748b`.

| Zone type | fill | stroke |
|---|---|---|
| Internet / client | `#f8fafc` | `#cbd5e1` |
| Global edge | `#eaf4ff` | `#9cc7f5` |
| Cloud region / VNet | `#effaf2` | `#9adbb0` |
| Cluster (dashed, with logo next to label) | `#fffdf3` | `#f2cf5b` |
| Infra namespace | `#f4fbf6` | `#a7dcb6` |
| App namespace | `#fffef8` | `#e8d68a` |
| Messaging namespace | `#fff7ee` | `#f5c27d` |
| Worker namespace | `#fff5fa` | `#f3a8cb` |

## 4. Nodes (component cards)
- Card 150x112, `rx=14`, fill = light colour, stroke = a stronger shade of the same hue, 1.6px.
- Inside: a 52x52 white rounded tile (opacity .85) at the top centre, holding a **48x48 inline-SVG logo** (scale .92); then the label (14px, weight 700, `#0f172a`, centred, y=78) and a sub-label (11px `#64748b`, y=95).
- Workload nodes show **replica dots**: small green circles (`#22c55e`, white 1.5px stroke) at y=104, one per replica.
- Hover: `drop-shadow(0 4px 10px rgba(15,23,42,.18))`. Active (a packet just arrived): `stroke-width:3.5; drop-shadow(0 0 14px rgba(11,92,255,.55))`, plus an **expanding ripple rect** in the node's stroke colour that grows about 14px and fades out over about 0.5s.
- Palette (bg / stroke). Pick by role and give every component type its own colour:
  - user `#eef0ff/#818cf8` · dns `#f5f0ff/#a78bfa` · gateway/front door `#e3f1ff/#3b8fe8` · cdn/cache `#e0f7fc/#22b5e6`
  - load balancer `#efe8ff/#9b7bff` · ingress/proxy `#e6f6ea/#34a853` · service `#e3f4f2/#2fa89a`
  - pods/compute `#fff9db/#e0b400` · queue/stream `#fff0e0/#f59e0b` · worker/consumer `#fde9f2/#ec4899`
- **Logos**: draw simplified brand-style marks as inline SVG in a 48x48 box (no external images). Examples: Front Door = blue gradient rounded square with a white door; CDN = blue cloud with three connected dots; LB = purple diamond with branching arrows; NGINX = green hexagon with a white "N"; Kubernetes = blue heptagon with a white wheel; Pod = blue isometric cube; Kafka = dark node graph (5 circles); User = indigo person silhouette.

## 5. Edges: dashed lines that flow continuously
- Path between node edges as a **cubic Bézier**: if |dx| ≥ |dy|, leave from the right or left side with horizontal control points at the midpoint; otherwise leave from the top or bottom with vertical control points.
- Idle style: `fill:none; stroke:#a8b4c6; stroke-width:2; stroke-dasharray:6 7`.
- **Continuous flow**: every frame, `dashOffset -= 40 * dt * speed` and set `style.strokeDashoffset` on every idle edge, so the dashes always crawl in the flow direction and respect the speed setting.
- **Hot edge** (a packet is on it): solid line, 3px, stroked in the packet's colour; it goes back to idle when the last packet leaves (keep a `hot` counter per edge).
- Protocol label at the path midpoint (`getPointAtLength(len/2)`): 11px weight 600 `#64748b`, with a white halo (`paint-order:stroke; stroke:#fff; stroke-width:4px`). Place it above horizontal edges and to the right of vertical ones.

## 6. Packets: smooth movement
- A packet = a head circle (r 7.5, fill = kind colour, 2px white stroke, Gaussian-blur glow filter) + a **trail of 6 circles** (radius 6→2, opacity .35→.10) placed at positions 3, 6, 9… frames back in a 24-entry position history.
- Kind colours: request `#2563eb`, response `#16a34a`, event `#f97316`, dns `#8b5cf6`.
- Movement: `dist += 260 px/s * dt * speed`; `t = dist/len`; position = `getPointAtLength(easeInOutQuad(t) * len)`.
- Reverse hops (responses) travel the same path backwards. Offset outbound and return packets about ±6px along the path normal so they sit in separate "lanes".
- When a packet arrives: remove it, cool the edge, flash and ripple the target node, then run the next step.

## 7. Engine and scenarios
- One `requestAnimationFrame` loop with `dt = min(0.05, elapsed)`. Everything (packets, dash flow, ripples, timers) uses `dt * speed`, so **0.5x / 1x / 2x and Pause affect everything**, including waits.
- Use its own timer queue (`wait(sec, cb)`), not `setTimeout`.
- A scenario is an array of steps:
  - `{type:'hop', from, to, kind, title, proto, text, count?}`
  - `{type:'node', id, title, proto, text, dur}`: highlights a node and explains what happens there (WAF check, routing, cache decision…)
  - `{type:'fork', steps:[…]}`: starts a parallel branch (e.g. the async consumer) while the main flow continues
- Each step updates the footer (badge n/total, title, proto pill, text, dots). A finished scenario shows "✓ Journey complete", waits 2.5s and loops.
- A generation counter (`GEN++` on scenario change or replay) cancels old callbacks; reset clears packets, timers, ripples and hot/active states.
- **Live mixed mode**: about every 0.55–1.15s, spawn a random scenario in quiet mode (no footer text, shorter node pauses) so many packets run at once; the counters keep updating.

## 8. Details drawer
- Clicking a node opens a 380px panel that slides in from the right (`transform` transition .35s, radius 16, large soft shadow). Its header uses the node's light colour, the logo, the title and a tagline. The body has a description, a "Key points" list and an "Example" code block (dark `#0f172a` bg, monospace 11.5px).
- The selected node gets a dashed outline. Clicking empty canvas or pressing Esc closes the panel.

## 9. Content quality
- Explain every hop in one specific, technically accurate sentence (ports, protocols, headers, config names).
- 12–18 steps per main scenario. Include at least one "decision" node (e.g. cache HIT vs MISS) and one async branch where it makes sense.

## 10. Keyboard
`Space` pause/play · `1`/`2`/`3` = 0.5x/1x/2x · `R` replay · `Esc` close drawer.

Return the full HTML file. Do not use any external CSS/JS/fonts/images.
