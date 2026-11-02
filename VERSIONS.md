# Versions

Every study page has an **id** and a **version**. Ask for one by id and version, e.g. "URL Shortener: use the latest" or "URL Shortener: redesign from v4".

- **vMAJOR.MINOR**: MAJOR = a redesign or a new capability; MINOR = fixes and small tweaks. Archived pages from before git keep plain `vN`.
- Each page carries `<meta name="doc-id">` + `<meta name="doc-version">`, and the version is shown in the browser tab title.
- Every version made in git has a tag `<id>/<version>` (e.g. `sd-url-shortener/v4.0`).
- Get an old version: `git show sd-url-shortener/v4.0:03_System_Design/02_SD_Simulator/01_URL_Shortener_Guided.html > old.html`,
  or look at the whole folder as it was: `git worktree add ../concepts-v4 sd-url-shortener/v4.0`.

## Current versions

| Area | Id | Page | Version | File |
|---|---|---|---|---|
| Hubs | `index` | Interview Prep index | v3.0 | `00_Index.html` |
| Hubs | `java-hub` | Java Core hub | v1.0 | `01_Java_Core/00_Java_Core.html` |
| Hubs | `patterns-hub` | Design Patterns hub | v1.0 | `02_Design_Patterns/00_Design_Patterns.html` |
| Hubs | `sd-hub` | System Design hub | v1.0 | `03_System_Design/00_System_Design.html` |
| Hubs | `spring-hub` | Spring hub | v1.0 | `04_Spring/00_Spring.html` |
| Hubs | `data-hub` | Data hub | v1.0 | `05_Data/00_Data.html` |
| Hubs | `messaging-hub` | Messaging hub | v1.0 | `06_Messaging/00_Messaging.html` |
| Hubs | `interview-hub` | Interview Extras hub | v1.0 | `07_Interview/00_Interview.html` |
| Java Core | `java-essentials` | Core Java Essentials | v1.0 | `01_Java_Core/01_Core_Java_Essentials.html` |
| Java Core | `java-oop-solid` | OOP & SOLID | v1.0 | `01_Java_Core/02_OOP_SOLID.html` |
| Java Core | `java-exceptions` | Exception Handling | v1.0 | `01_Java_Core/03_Exception_Handling.html` |
| Java Core | `java-collections` | Collections Framework | v1.0 | `01_Java_Core/04_Collections_Framework.html` |
| Java Core | `java-hashmap` | HashMap & ConcurrentHashMap | v3.0 | `01_Java_Core/05_HashMap_ConcurrentHashMap.html` |
| Java Core | `java-lambdas-streams` | Lambdas, Streams & Optional | v1.0 | `01_Java_Core/06_Lambdas_Streams_Optional.html` |
| Java Core | `java-modern` | Modern Java 8 → 25 | v1.0 | `01_Java_Core/07_Modern_Java_8_to_25.html` |
| Java Core | `java-multithreading` | Multithreading & JMM | v1.0 | `01_Java_Core/08_Multithreading_JMM.html` |
| Java Core | `java-executors` | Executors, Locks & Atomics | v1.0 | `01_Java_Core/09_Executors_Locks_Atomics.html` |
| Java Core | `java-jvm-memory` | JVM Memory & Architecture | v4.0 | `01_Java_Core/12_JVM_Memory_Architecture.html` |
| Java Core | `java-interview-line` | Java Backend Interview Line | archived v1 | `_archive/01_Java_Core/Java_Backend_Interview_Line.html` |
| Design Patterns | `patterns-roadmap` | Design Patterns Roadmap | archived v1 | `_archive/02_Design_Patterns/01_Design_Patterns_Roadmap_v1.html` |
| Design Patterns | `patterns-interview` | Design Patterns Interview Guide | archived v2 | `_archive/02_Design_Patterns/02_Design_Patterns_Interview_v2.html` |
| System Design | `core-components` | Core Components (watch first) | v1.1 | `03_System_Design/02_SD_Simulator/00_Core_Components.html` |
| System Design | `fireflink-sd` | FireFlink System Design | v1.0 | `03_System_Design/FireFlink_System_Design.html` |
| System Design | `fireflink-platform` | FireFlink Platform Architecture | archived v1 | `_archive/03_System_Design/01_FireFlink_Platform_Architecture_v1.html` |
| System Design | `sd-simulator` | SD Interview Simulator (home) | v3.3 | `03_System_Design/02_SD_Interview_Simulator.html` |
| System Design | `sd-url-shortener` | URL Shortener (TinyURL) | v2.2 | `03_System_Design/02_SD_Simulator/01_URL_Shortener.html` |
| System Design | `sd-ticket-booking` | Ticket Booking | v2.2 | `03_System_Design/02_SD_Simulator/03_Ticket_Booking.html` |
| System Design | `sd-file-upload` | File Upload & Storage | v2.2 | `03_System_Design/02_SD_Simulator/06_File_Upload.html` |
| System Design | `sd-rate-limiter` | Rate Limiter | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#rate/1` |
| System Design | `sd-notification` | Notification System | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#notify/1` |
| System Design | `sd-ecommerce` | E-commerce Order System | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#shop/1` |
| System Design | `sd-chat` | Chat System | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#chat/1` |
| System Design | `sd-job-scheduler` | Distributed Job Scheduler | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#jobs/1` |
| System Design | `sd-news-feed` | News Feed | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#feed/1` |
| System Design | `sd-search` | Search System | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#search/1` |
| System Design | `sd-video` | Video Streaming | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#video/1` |
| System Design | `sd-distributed-cache` | Distributed Cache | archived v1 | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#cache/1` |
| Spring | `spring-startup` | Spring Boot Startup Flow | v2.0 | `04_Spring/01_Spring_Boot_Startup_Flow.html` |
| Design system & templates | `design-system` | Design System | v1.0 | `_design_system/00_Design_System.html` |
| Design system & templates | `tpl-capabilities` | Capabilities template | v1.0 | `_templates/Capabilities.html` |
| Design system & templates | `tpl-map-explorer` | T4 Map Explorer template | v1.0 | `_templates/T4_Map_Explorer.html` |
| Design system & templates | `tpl-archived` | T1 Bento · T2 Scroll Story · T3 Recall Cards · T5 Interview Simulator | archived v1 | `_archive/_templates/` |

## History

### Hubs

**Interview Prep index** · `index`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-10-20 | Category cards → 7 subject hubs, topics-completed counters (prep.js), design-system link. | current file · tag `index/v3.0` |
| v2 | 2026-10-20 | "Interview Prep — NITHIN P": sticky nav, full table of contents with status. | `_archive/00_Index/00_Index_v2_toc.html` |
| v1 | 2026-10-20 | Simple list of topics. | `_archive/00_Index/00_Index_v1_simple.html` |

**Java Core hub** · `java-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | 13 topics in lanes A → E. | current file · tag `java-hub/v1.0` |

**Design Patterns hub** · `patterns-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Links the archived roadmap and interview guide. | current file · tag `patterns-hub/v1.0` |

**System Design hub** · `sd-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | System design topics and the simulator. | current file · tag `sd-hub/v1.0` |

**Spring hub** · `spring-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Spring topics. | current file · tag `spring-hub/v1.0` |

**Data hub** · `data-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Placeholder hub (topics TODO). | current file · tag `data-hub/v1.0` |

**Messaging hub** · `messaging-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Placeholder hub (topics TODO). | current file · tag `messaging-hub/v1.0` |

**Interview Extras hub** · `interview-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Placeholder hub (topics TODO). | current file · tag `interview-hub/v1.0` |

### Java Core

**Core Java Essentials** · `java-essentials`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | 11 slides: pass-by-value, Integer cache, String pool, equals/hashCode, immutability, 6 predict-output, 17 Q&A. | current file · tag `java-essentials/v1.0` |

**OOP & SOLID** · `java-oop-solid`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | 10 slides: pillars, dispatch, abstract vs interface quiz, SOLID refactor, 4 predict-output, 15 Q&A. | current file · tag `java-oop-solid/v1.0` |

**Exception Handling** · `java-exceptions`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | 10 slides: hierarchy, try/finally stepper, try-with-resources, @Transactional rollback, 15 Q&A. | current file · tag `java-exceptions/v1.0` |

**Collections Framework** · `java-collections`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | Family tree, ArrayList vs LinkedList, Deque/PQ, sort builder, immutable vs unmodifiable, 17 Q&A. | current file · tag `java-collections/v1.0` |

**HashMap & ConcurrentHashMap** · `java-hashmap`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-10-21 | Slide mode: hash calculator, playground, CHM putVal cases, lost-update bug, 16 Q&A. | current file · tag `java-hashmap/v3.0` |
| v2 | 2026-10-20 | Simplified version with playground + lock simulator. | `_archive/01_Java_Core/03_HashMap_Internals_Interview_v2_simple.html` |
| v1 | 2026-10-20 | Detailed HashMap internals page. | `_archive/01_Java_Core/03_HashMap_Internals_Interview_v1_detailed.html` |

**Lambdas, Streams & Optional** · `java-lambdas-streams`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | Lazy-stream stepper, collectors playground, Optional fix-it, 16 Q&A. | current file · tag `java-lambdas-streams/v1.0` |

**Modern Java 8 → 25** · `java-modern`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | LTS comparison, var, records, sealed, pattern switch, sequenced collections, 17 Q&A. | current file · tag `java-modern/v1.0` |

**Multithreading & JMM** · `java-multithreading`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | Lifecycle state machine, volatile, happens-before, deadlock sim, ThreadLocal, 17 Q&A. | current file · tag `java-multithreading/v1.0` |

**Executors, Locks & Atomics** · `java-executors`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | ThreadPoolExecutor sim, ReentrantLock/ReadWrite, CAS, latches/semaphores, 17 Q&A. | current file · tag `java-executors/v1.0` |

**JVM Memory & Architecture** · `java-jvm-memory`

| Version | Date | What it has | Where |
|---|---|---|---|
| v4.0 | 2026-10-21 | Page-flow pilot: animated big picture + camera zoom per part, 15 slides, 5 simulators, 17 Q&A, 4 prod incidents. | current file · tag `java-jvm-memory/v4.0` |
| v3 | 2026-10-20 | Slide deck: 21 slides, 12 interactive, live-JVM finale, 35 Q&A. | `_archive/01_Java_Core/12_JVM_Memory_Architecture_v3_deck.html` |
| v2 | 2026-10-20 | +3 simulators. | `_archive/01_Java_Core/01_JVM_Memory_Architecture_v2_simulators.html` |
| v1 | 2026-10-20 | Static page (posters: _archive/01_Java_Core/images/01_JVM_Memory_v0_old.png, _v1_Java25_G1.png). | `_archive/01_Java_Core/01_JVM_Memory_Architecture_v1_static.html` |

**Java Backend Interview Line** · `java-interview-line`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-20 | Old one-page interview line (archived). | `_archive/01_Java_Core/Java_Backend_Interview_Line.html` |

### Design Patterns

**Design Patterns Roadmap** · `patterns-roadmap`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-20 | All 59 patterns, search/filter/progress (+ posters in images/roadmap_v1). Rebuild pending. | `_archive/02_Design_Patterns/01_Design_Patterns_Roadmap_v1.html` |

**Design Patterns Interview Guide** · `patterns-interview`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2 | 2026-10-20 | 20 must-know, without vs with code (+ posters in images/interview_v2). v1 not kept. Rebuild pending. | `_archive/02_Design_Patterns/02_Design_Patterns_Interview_v2.html` |

### System Design

**Core Components (watch first)** · `core-components`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.1 | 2026-11-02 | In the interview: one interview-ready answer per component (in one breath + What · Why · How · Where · Trade-offs · When / not), then follow-up Q&A. | current file · tag `core-components/v1.1` |
| v1.0 | 2026-11-02 | Load balancer, Cache (Redis), Queue (Kafka): What · Without vs With (live traffic + switch) · How it works (variants) · Pros & cons · When to choose (+ alternatives) · Interview lines + Q&A; When to use what: cheat sheet + 7-question quiz. | git tag `core-components/v1.0` |

**FireFlink System Design** · `fireflink-sd`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-23 | FireFlink system design page. | current file · tag `fireflink-sd/v1.0` |

**FireFlink Platform Architecture** · `fireflink-platform`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-20 | Tech stack, diagrams, flows, talking points (+ PNG poster). Rebuild pending. | `_archive/03_System_Design/01_FireFlink_Platform_Architecture_v1.html` |

**SD Interview Simulator (home)** · `sd-simulator`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.3 | 2026-11-02 | 0 · Core Components as the full-width "★ Watch first" card; URL Shortener card opens the classic page. | current file · tag `sd-simulator/v3.3` |
| v3.2 | 2026-11-02 | Keyboard-shortcut hint row removed. | git tag `sd-simulator/v3.2` |
| v3.1 | 2026-11-02 | URL Shortener as full-width "★ Must read first" card with its 🎓 lessons + classic link. | git tag `sd-simulator/v3.1` |
| v3.0 | 2026-10-30 | Hub of one-page-per-design cards; rebuilt designs open, others link the v2 file. | git tag `sd-simulator/v3.0` |
| v2.0 | 2026-10-23 | All 12 designs in one file. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html` · tag `sd-simulator/v2.0` |
| v1.0 | 2026-10-23 | One app (sidebar · canvas · state panel): Ticket Booking only. | git tag `sd-simulator/v1.0` |

**URL Shortener (TinyURL)** · `sd-url-shortener`

| Version | Date | What it has | Where |
|---|---|---|---|
| v5.2 | 2026-11-02 | Learn page: full-screen fix (removed 2026-11-02; its lessons moved to Core Components v1.0). | git tag `sd-url-shortener/v5.2` |
| v5.1 | 2026-11-01 | + 🎓 Why Kafka? and 🎓 Why a load balancer? (instances, crash, N+1). | git tag `sd-url-shortener/v5.1` |
| v5.0 | 2026-11-01 | v2 + "learn" flows with live traffic: 🎓 Why a cache? (MongoDB DOWN → Redis, ON/OFF switch). | git tag `sd-url-shortener/v5.0` |
| v4.0 | 2026-11-01 | Guided page in the existing look: stages as tabs, mentor card, evolve animation, compare (removed 2026-11-02). | git tag `sd-url-shortener/v4.0` |
| v3.0 | 2026-10-31 | Guided SD Lab: separate dark-themed app, 8 mentor-led stages (removed 2026-11-02). | git tag `sd-url-shortener/v3.0` |
| v2.2 | 2026-11-02 | CURRENT: the classic page (v2 + full-screen fix). Building blocks are taught in Core Components. | current file · tag `sd-url-shortener/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, no duplicate stage bar, compact doc headers. | git tag `sd-url-shortener/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs: Overview, Components, Flows, How to explain, Interview answer, Follow-ups. | git tag `sd-url-shortener/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#url/1` · tag `sd-url-shortener/v1` |

**Ticket Booking** · `sd-ticket-booking`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.2 | 2026-11-02 | Full-screen fix. | current file · tag `sd-ticket-booking/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, compact doc headers. | git tag `sd-ticket-booking/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs. | git tag `sd-ticket-booking/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#ticket/1` · tag `sd-ticket-booking/v1` |

**File Upload & Storage** · `sd-file-upload`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.2 | 2026-11-02 | Full-screen fix. Next: 🎓 Why S3?, 🎓 Why a CDN? | current file · tag `sd-file-upload/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, compact doc headers. | git tag `sd-file-upload/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs. | git tag `sd-file-upload/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#files/1` · tag `sd-file-upload/v1` |

**Rate Limiter** · `sd-rate-limiter`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#rate/1` · tag `sd-rate-limiter/v1` |

**Notification System** · `sd-notification`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#notify/1` · tag `sd-notification/v1` |

**E-commerce Order System** · `sd-ecommerce`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#shop/1` · tag `sd-ecommerce/v1` |

**Chat System** · `sd-chat`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#chat/1` · tag `sd-chat/v1` |

**Distributed Job Scheduler** · `sd-job-scheduler`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#jobs/1` · tag `sd-job-scheduler/v1` |

**News Feed** · `sd-news-feed`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#feed/1` · tag `sd-news-feed/v1` |

**Search System** · `sd-search`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#search/1` · tag `sd-search/v1` |

**Video Streaming** · `sd-video`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#video/1` · tag `sd-video/v1` |

**Distributed Cache** · `sd-distributed-cache`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-23 | Section of the all-in-one simulator; not rebuilt yet. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#cache/1` · tag `sd-distributed-cache/v1` |

### Spring

**Spring Boot Startup Flow** · `spring-startup`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-10-20 | 19 slides: coloured sections, steppers, command builder, 33 Q&A. | current file · tag `spring-startup/v2.0` |
| v1 | 2026-10-20 | First slide-mode page (not kept). | not kept |

### Design system & templates

**Design System** · `design-system`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-21 | Tokens + visual guide (+ 00_Design_System.png). | current file · tag `design-system/v1.0` |

**Capabilities template** · `tpl-capabilities`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Looping animations, simulators, diagrams. | current file · tag `tpl-capabilities/v1.0` |

**T4 Map Explorer template** · `tpl-map-explorer`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-10-20 | Map-style architecture explorer (preferred idea). | current file · tag `tpl-map-explorer/v1.0` |

**T1 Bento · T2 Scroll Story · T3 Recall Cards · T5 Interview Simulator** · `tpl-archived`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1 | 2026-10-20 | Rejected templates (archived). | `_archive/_templates/` |
