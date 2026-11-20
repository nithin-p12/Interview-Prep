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
| System Design | `core-components` | Core Components (watch first) | v2.3 | `03_System_Design/02_SD_Simulator/00_Core_Components.html` |
| System Design | `fireflink-sd` | FireFlink System Design | v1.0 | `03_System_Design/FireFlink_System_Design.html` |
| System Design | `fireflink-platform` | FireFlink Platform Architecture | archived v1 | `_archive/03_System_Design/01_FireFlink_Platform_Architecture_v1.html` |
| System Design | `sd-simulator` | SD Interview Simulator (home) | v3.10 | `03_System_Design/02_SD_Interview_Simulator.html` |
| System Design | `sd-url-shortener` | URL Shortener (TinyURL) | v6.0 | `03_System_Design/02_SD_Simulator/01_URL_Shortener.html` |
| System Design | `sd-rate-limiter` | Rate Limiter | v3.0 | `03_System_Design/02_SD_Simulator/02_Rate_Limiter.html` |
| System Design | `sd-notification` | Notification System | v3.0 | `03_System_Design/02_SD_Simulator/04_Notification_System.html` |
| System Design | `sd-ecommerce` | E-commerce Order System | v2.0 | `03_System_Design/02_SD_Simulator/05_Ecommerce_Order.html` |
| System Design | `sd-chat` | Chat System | v3.0 | `03_System_Design/02_SD_Simulator/07_Chat_System.html` |
| System Design | `sd-ticket-booking` | Ticket Booking | v2.3 | `03_System_Design/02_SD_Simulator/03_Ticket_Booking.html` |
| System Design | `sd-file-upload` | File Upload & Storage | v3.0 | `03_System_Design/02_SD_Simulator/06_File_Upload.html` |
| System Design | `sd-job-scheduler` | Distributed Job Scheduler | v2.0 | `03_System_Design/02_SD_Simulator/08_Job_Scheduler.html` |
| System Design | `sd-news-feed` | News Feed | v3.0 | `03_System_Design/02_SD_Simulator/09_News_Feed.html` |
| System Design | `sd-search` | Search System | v3.0 | `03_System_Design/02_SD_Simulator/10_Search_System.html` |
| System Design | `sd-video` | Video Streaming | v2.0 | `03_System_Design/02_SD_Simulator/11_Video_Streaming.html` |
| System Design | `sd-distributed-cache` | Distributed Cache | v2.0 | `03_System_Design/02_SD_Simulator/12_Distributed_Cache.html` |
| System Design | `sd-support` | Customer Support Ticketing | v2.0 | `03_System_Design/02_SD_Simulator/13_Support_Ticketing.html` |
| System Design | `sd-git` | Git | v1.0 | `03_System_Design/02_SD_Simulator/14_Git.html` |
| System Design | `sd-parking` | Parking Lot | v1.0 | `03_System_Design/02_SD_Simulator/15_Parking_Lot.html` |
| Interview Extras | `code-hub` | Coding Practice hub (22 problems) | v1.1 | `07_Interview/01_Coding/00_Coding_Practice.html` |
| Interview Extras | `question-bank` | Interview Question Bank (concept-wise, company filter) | v1.0 | `07_Interview/02_Questions/00_Question_Bank.html` |
| Interview Extras | `code-structures` | Data structures gallery (watch first) | v1.1 | `07_Interview/01_Coding/00_Structures_Gallery.html` |
| Interview Extras | `code-longest-substring` | 8. Longest Substring Without Repeating Characters | v2.1 | `07_Interview/01_Coding/08_Longest_Substring_No_Repeat.html` |
| Interview Extras | `code-viz-lab` | Visualization styles lab (A Story · B Debugger · C Dry-run table) | v1.0 | `07_Interview/01_Coding/99_Viz_Styles_Lab.html` |
| Interview Extras | `code-two-sum` | 1. Two Sum | v2.1 | `07_Interview/01_Coding/01_Two_Sum.html` |
| Interview Extras | `code-stock` | 2. Best Time to Buy & Sell Stock | v2.1 | `07_Interview/01_Coding/02_Best_Time_Buy_Sell_Stock.html` |
| Interview Extras | `code-contains-duplicate` | 3. Contains Duplicate | v1.0 | `07_Interview/01_Coding/03_Contains_Duplicate.html` |
| Interview Extras | `code-product-except-self` | 4. Product of Array Except Self | v1.0 | `07_Interview/01_Coding/04_Product_Except_Self.html` |
| Interview Extras | `code-max-subarray` | 5. Maximum Subarray (Kadane’s) | v1.0 | `07_Interview/01_Coding/05_Maximum_Subarray.html` |
| Interview Extras | `code-valid-anagram` | 6. Valid Anagram | v1.0 | `07_Interview/01_Coding/06_Valid_Anagram.html` |
| Interview Extras | `code-first-unique-char` | 7. First Non-Repeating Character | v1.0 | `07_Interview/01_Coding/07_First_Non_Repeating_Char.html` |
| Interview Extras | `code-group-anagrams` | 9. Group Anagrams | v1.0 | `07_Interview/01_Coding/09_Group_Anagrams.html` |
| Interview Extras | `code-move-zeroes` | 10. Move Zeroes | v1.0 | `07_Interview/01_Coding/10_Move_Zeroes.html` |
| Interview Extras | `code-3sum` | 11. 3Sum | v1.0 | `07_Interview/01_Coding/11_3Sum.html` |
| Interview Extras | `code-container-water` | 12. Container With Most Water | v1.0 | `07_Interview/01_Coding/12_Container_Most_Water.html` |
| Interview Extras | `code-binary-search` | 13. Binary Search | v1.0 | `07_Interview/01_Coding/13_Binary_Search.html` |
| Interview Extras | `code-search-rotated` | 14. Search in Rotated Sorted Array | v1.0 | `07_Interview/01_Coding/14_Search_Rotated_Array.html` |
| Interview Extras | `code-merge-intervals` | 15. Merge Intervals | v1.0 | `07_Interview/01_Coding/15_Merge_Intervals.html` |
| Interview Extras | `code-valid-parentheses` | 16. Valid Parentheses | v1.0 | `07_Interview/01_Coding/16_Valid_Parentheses.html` |
| Interview Extras | `code-next-greater` | 17. Next Greater Element | v1.0 | `07_Interview/01_Coding/17_Next_Greater_Element.html` |
| Interview Extras | `code-reverse-list` | 18. Reverse a Linked List | v1.0 | `07_Interview/01_Coding/18_Reverse_Linked_List.html` |
| Interview Extras | `code-max-depth` | 19. Maximum Depth of Binary Tree | v1.0 | `07_Interview/01_Coding/19_Max_Depth_Binary_Tree.html` |
| Interview Extras | `code-islands` | 20. Number of Islands | v1.0 | `07_Interview/01_Coding/20_Number_of_Islands.html` |
| Interview Extras | `code-word-search` | 21. Word Search | v1.0 | `07_Interview/01_Coding/21_Word_Search.html` |
| Interview Extras | `code-climbing-stairs` | 22. Climbing Stairs | v1.0 | `07_Interview/01_Coding/22_Climbing_Stairs.html` |
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
| v2.3 | 2026-11-12 | + API Gateway · Rate Limiting: services exposed directly (bot floods the order service) vs gateway with per-key limit (429); JWT auth, 401 at the edge, token bucket in Redis, aggregation; alternatives (LB, BFF, service mesh, in-service limits), interview answer + Q&A; cheat sheet and quiz. | current file · tag `core-components/v2.3` |
| v2.2 | 2026-11-12 | + DB scaling: one DB overloaded vs primary + read replicas; replica lag, read-your-writes, hash sharding, scatter-gather; SQL vs NoSQL in alternatives; interview answer + Q&A; quiz. + CDN: one far origin (latency per region, origin overload) vs edges near users (95% hit ratio); hit, miss, TTL revalidate (304), deploy with versioned names; pros & cons, alternatives (Redis, browser cache, multi-region, S3 direct), interview answer + Q&A; cheat sheet and quiz entries. | git tag `core-components/v2.2` |
| v2.1 | 2026-11-03 | In the interview: each answer rewritten as 1–2 minute spoken paragraphs (no forced headings) with Spring Boot / Kafka / MongoDB examples. | git tag `core-components/v2.1` |
| v2.0 | 2026-11-02 | + Object Storage (S3): local disks → 404s and full disks vs one shared bucket; presigned upload, multipart, presigned download, ObjectCreated events; pros & cons, alternatives (block, file, BLOB, CDN), interview answer + Q&A; cheat sheet and quiz entries. | git tag `core-components/v2.0` |
| v1.1 | 2026-11-02 | In the interview: one interview-ready answer per component (in one breath + What · Why · How · Where · Trade-offs · When / not), then follow-up Q&A. | git tag `core-components/v1.1` |
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
| v3.10 | 2026-11-19 | + 15 · Parking Lot card (catalog entry). | current file · tag `sd-simulator/v3.10` |
| v3.9 | 2026-11-19 | + 14 · Git card (catalog entry). | git tag `sd-simulator/v3.9` |
| v3.8 | 2026-11-19 | + 13 · Customer Support Ticketing card (catalog entry; the "12 designs" chip text is unchanged). | git tag `sd-simulator/v3.8` |
| v3.7 | 2026-11-12 | All 12 design cards open their own pages (Rate Limiter, Notification, E-commerce, Chat, Job Scheduler, News Feed, Search, Video Streaming, Distributed Cache rebuilt). | git tag `sd-simulator/v3.7` |
| v3.6 | 2026-11-12 | Core Components card lists API gateway. | git tag `sd-simulator/v3.6` |
| v3.5 | 2026-11-12 | Core Components card lists CDN and DB scaling. | git tag `sd-simulator/v3.5` |
| v3.4 | 2026-11-02 | Core Components card lists Storage · S3. | git tag `sd-simulator/v3.4` |
| v3.3 | 2026-11-02 | 0 · Core Components as the full-width "★ Watch first" card; URL Shortener card opens the classic page. | git tag `sd-simulator/v3.3` |
| v3.2 | 2026-11-02 | Keyboard-shortcut hint row removed. | git tag `sd-simulator/v3.2` |
| v3.1 | 2026-11-02 | URL Shortener as full-width "★ Must read first" card with its 🎓 lessons + classic link. | git tag `sd-simulator/v3.1` |
| v3.0 | 2026-10-30 | Hub of one-page-per-design cards; rebuilt designs open, others link the v2 file. | git tag `sd-simulator/v3.0` |
| v2.0 | 2026-10-23 | All 12 designs in one file. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html` · tag `sd-simulator/v2.0` |
| v1.0 | 2026-10-23 | One app (sidebar · canvas · state panel): Ticket Booking only. | git tag `sd-simulator/v1.0` |

**URL Shortener (TinyURL)** · `sd-url-shortener`

| Version | Date | What it has | Where |
|---|---|---|---|
| v6.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page (zones by role: Client · Entry · App services · Data · Async analytics; logo cards, flowing edges, glowing packets, speed/pause, details drawer with Core Components links) + Explain, Answer and Follow-ups tabs ported from v2.2 (▶ Watch flow on follow-ups). 7 scenarios: Create, Cache hit, Cache miss, Alias race, Viral stampede, Crash gaps & expiry, Live mix. No longer uses the shared engine. | current file · tag `sd-url-shortener/v6.0` |
| v5.2 | 2026-11-02 | Learn page: full-screen fix (removed 2026-11-02; its lessons moved to Core Components v1.0). | git tag `sd-url-shortener/v5.2` |
| v5.1 | 2026-11-01 | + 🎓 Why Kafka? and 🎓 Why a load balancer? (instances, crash, N+1). | git tag `sd-url-shortener/v5.1` |
| v5.0 | 2026-11-01 | v2 + "learn" flows with live traffic: 🎓 Why a cache? (MongoDB DOWN → Redis, ON/OFF switch). | git tag `sd-url-shortener/v5.0` |
| v4.0 | 2026-11-01 | Guided page in the existing look: stages as tabs, mentor card, evolve animation, compare (removed 2026-11-02). | git tag `sd-url-shortener/v4.0` |
| v3.0 | 2026-10-31 | Guided SD Lab: separate dark-themed app, 8 mentor-led stages (removed 2026-11-02). | git tag `sd-url-shortener/v3.0` |
| v2.2 | 2026-11-02 | The classic page (v2 + full-screen fix). Building blocks are taught in Core Components. | git tag `sd-url-shortener/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, no duplicate stage bar, compact doc headers. | git tag `sd-url-shortener/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs: Overview, Components, Flows, How to explain, Interview answer, Follow-ups. | git tag `sd-url-shortener/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#url/1` · tag `sd-url-shortener/v1` |

**Rate Limiter** · `sd-rate-limiter`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Entry · Data · Async replication · App services; 9 logo cards incl. 2 gateway pods with fan-out/fan-in race hops, Redis primary + replica, Limit Rules, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (8 ▶ Watch flow buttons). 6 scenarios: Allowed (one bucket, any pod), Burst (429 + Retry-After), Race on the last token, Fixed vs sliding window, Redis failover (fail open / closed), Live mix. No longer uses the shared engine. | current file · tag `sd-rate-limiter/v3.0` |
| v2.0 | 2026-11-12 | Own page, 6 tabs: overview loop, 9 components (links to Core Components for LB, gateway, Redis), 5 flows (shared bucket, burst → 429, last-token race, fixed vs sliding window, Redis down: fail open/closed + failover), how to explain, interview answer (Lua, Spring Cloud Gateway config), 16 follow-ups. | git tag `sd-rate-limiter/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#rate/1` · tag `sd-rate-limiter/v1` |

**Notification System** · `sd-notification`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Producers · Intake · Async queue · Data · Workers · Providers & recipients; 14 logo cards incl. Retry / DLQ topics, Preferences with Redis cache and FCM / APNs, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (9 ▶ Watch flow buttons). 6 scenarios: Order shipped: email A, Producer retries, Provider throttles, Worker crash: duplicate?, Campaign vs OTP, Live mix. No longer uses the shared engine. | current file · tag `sd-notification/v3.0` |
| v2.0 | 2026-11-12 | Own page, 6 tabs: overview loop, 13 components (links to Core Components for Kafka, Redis), 5 flows (happy path, producer retry + dedupe, throttling → retry topics → DLQ, worker crash duplicate, campaign vs OTP priority), how to explain, spoken interview answer, @RetryableTopic code, 14 follow-ups. | git tag `sd-notification/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#notify/1` · tag `sd-notification/v1` |

**E-commerce Order System** · `sd-ecommerce`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-11-12 | Own page, 6 tabs: overview loop, 12 components (links to Core Components for gateway, Kafka, DB), 5 flows (saga happy path with outbox, last-unit race: read-then-write vs conditional decrement, payment declined → compensation, late payment after hold expiry → refund, client retry + Kafka down + redelivered command), how to explain, spoken interview answer, Spring/Stripe code, 16 follow-ups. | current file · tag `sd-ecommerce/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#shop/1` · tag `sd-ecommerce/v1` |

**Chat System** · `sd-chat`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Realtime entry · App services · Data · Async delivery; 12 logo cards incl. 2 WebSocket gateways, Redis presence and a Push Worker, fan-out hops to several gateways and devices, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (10 ▶ Watch flow buttons). 7 scenarios: Why WebSockets?, A → B: "Hi", Group: who spoke first?, Lost ack → resend, B is offline, Gateway 2 crashes, Live mix. WebSockets still taught here. No longer uses the shared engine. | current file · tag `sd-chat/v3.0` |
| v2.0 | 2026-11-12 | Own page, 6 tabs: overview loop, 11 components (links to Core Components for LB, Redis, Kafka, DB), 6 flows (why WebSockets: polling vs upgrade + heartbeats, A → B with seq and receipts, group order: clocks vs server seq, lost ack → clientMsgId dedupe, offline: push hint + sync, gateway crash: stale presence, jittered reconnect, sync), how to explain, spoken interview answer, Spring WebSocket code, 16 follow-ups. | git tag `sd-chat/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#chat/1` · tag `sd-chat/v1` |

**Ticket Booking** · `sd-ticket-booking`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.3 | 2026-11-13 | Components link to Core Components (gateway, Redis, DB, Kafka); interview answer as 4 spoken paragraphs. | current file · tag `sd-ticket-booking/v2.3` |
| v2.2 | 2026-11-02 | Full-screen fix. | git tag `sd-ticket-booking/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, compact doc headers. | git tag `sd-ticket-booking/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs. | git tag `sd-ticket-booking/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#ticket/1` · tag `sd-ticket-booking/v1` |

**File Upload & Storage** · `sd-file-upload`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Entry · App services · Storage · Async scanning; 12 logo cards incl. Viewer B, Uploader A, Attacker C, CloudFront CDN, S3 bucket, S3 events (SQS), Virus Scanner, DLQ and Cleanup Job, two-leg hops through the gateway, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (8 ▶ Watch flow buttons). 7 scenarios: Upload & scan, Download via CDN, Large file: multipart, Virus scan result, Leaked upload URL, Duplicates & abandoned uploads, Live mix. No longer uses the shared engine. | current file · tag `sd-file-upload/v3.0` |
| v2.3 | 2026-11-13 | Components link to Core Components (gateway, DB, S3, queue); interview answer as 4 spoken paragraphs. | git tag `sd-file-upload/v2.3` |
| v2.2 | 2026-11-02 | Full-screen fix. | git tag `sd-file-upload/v2.2` |
| v2.1 | 2026-10-31 | Icon-only stage controls, compact doc headers. | git tag `sd-file-upload/v2.1` |
| v2.0 | 2026-10-30 | Own page, 6 tabs. | git tag `sd-file-upload/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#files/1` · tag `sd-file-upload/v1` |

**Distributed Job Scheduler** · `sd-job-scheduler`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-11-13 | Own page, 6 tabs: overview loop, 7 components (links to Core Components for DB), 6 flows (atomic claim + lease + fence happy path, read-then-update race vs findOneAndUpdate, worker crash → lease expiry → run key, zombie worker → fencing token, heartbeat + retries with backoff → FAILED, misfire policy after downtime), how to explain, spoken interview answer, Spring/MongoDB code, 17 follow-ups. | current file · tag `sd-job-scheduler/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#jobs/1` · tag `sd-job-scheduler/v1` |

**News Feed** · `sd-news-feed`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Entry · App services · Data · Async fan-out; 12 logo cards incl. 3 clients (poster, reader, celebrity), Post / Feed / Ranking services, MongoDB Post DB, Redis timeline cache, follow graph, Kafka and fan-out workers, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (10 ▶ Watch flow buttons). 7 scenarios: A posts → B's feed, Celebrity posts, Scroll to page 2, A deletes a post, Back after 60 days, Fan-out worker crashes, Live mix. No longer uses the shared engine. | current file · tag `sd-news-feed/v3.0` |
| v2.0 | 2026-11-13 | Own page, 6 tabs: overview loop, 12 components (links to Core Components for gateway, Redis, Kafka, DB), 6 flows (post + fan-out on write, celebrity: hybrid pull, offset vs cursor pagination, delete via hydration, rebuild expired timeline, fan-out worker crash + idempotent ZADD), how to explain, spoken interview answer, Spring/Kafka/Redis code, 17 follow-ups. | git tag `sd-news-feed/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#feed/1` · tag `sd-news-feed/v1` |

**Search System** · `sd-search`

| Version | Date | What it has | Where |
|---|---|---|---|
| v3.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Entry · App services · Data · Async indexing; 15 logo cards incl. Change Stream CDC publisher, 3 shards with scatter/gather hops, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (9 ▶ Watch flow buttons). 7 scenarios: Why Elasticsearch, Search with filters, Seller changes a price, Dual write vs CDC, Out-of-order updates, Zero-downtime reindex, Live mix. No longer uses the shared engine. | current file · tag `sd-search/v3.0` |
| v2.0 | 2026-11-13 | Own page, 6 tabs: overview loop, 14 components (links to Core Components for gateway, Redis, Kafka, DB), 6 flows (why Elasticsearch: regex scan vs inverted index, analyzers, BM25, shards; bool query must/filter + query cache; DB → CDC → Kafka → bulk index; dual write vs CDC; out-of-order updates vs external version; zero-downtime reindex with alias swap), how to explain, spoken interview answer, Java client/change stream code, 16 follow-ups. | git tag `sd-search/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#search/1` · tag `sd-search/v1` |

**Video Streaming** · `sd-video`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-11-13 | Own page, 6 tabs: overview loop, 11 components (links to Core Components for gateway, CDN, S3, Kafka, DB), 6 flows (upload → chunked transcode → READY, sequential vs parallel chunks, worker crash + deterministic keys + $addToSet, adaptive bitrate playback, viral video: request collapsing + origin shield, publish low renditions first), how to explain, spoken interview answer, Spring/Kafka/ffmpeg/CloudFront code, 17 follow-ups. | current file · tag `sd-video/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#video/1` · tag `sd-video/v1` |

**Distributed Cache** · `sd-distributed-cache`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-11-13 | Own page, 6 tabs: overview loop, 12 components (links to Core Components for Redis, DB), 6 flows (why consistent hashing: mod N vs hash ring + virtual nodes, cache-aside read + delete-on-write, stale-set race vs versioned values, eviction LRU/LFU + TTL jitter, node failure + replica promotion, hot key + stampede: single-flight, L1, key copies), how to explain, spoken interview answer, Java ring/Redis Lua code, 18 follow-ups. | current file · tag `sd-distributed-cache/v2.0` |
| v1 | 2026-10-23 | Section of the all-in-one simulator. | `_archive/03_System_Design/02_SD_Interview_Simulator_v1.html#cache/1` · tag `sd-distributed-cache/v1` |

**Customer Support Ticketing** · `sd-support`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.0 | 2026-11-20 | CURRENT: self-contained animated data-flow page in the URL Shortener v6.0 style (zones by role: Client · Entry · App services · Data · Async events & timers; 13 logo cards incl. API Gateway with WebSocket routing and Kafka → Push Gateway via a channel below the cards, details drawers with Core Components links) + Explain, Answer and Follow-ups tabs ported verbatim (15 ▶ Watch flow buttons). 7 scenarios: Email becomes a ticket, Two agents one ticket, Ticket lifecycle, SLA breach, Live updates, Many tenants, Live mix. No longer uses the shared engine. | current file · tag `sd-support/v2.0` |
| v1.0 | 2026-11-19 | New page, 6 tabs: overview loop, 12 components (links to Core Components for gateway, Redis, DB, Kafka, S3; to 4 Notification, 7 Chat, 8 Job Scheduler, 10 Search in the answer), 6 flows (email webhook → idempotent intake + transactional outbox + threading, two agents claim: read-then-write vs CAS on version, lifecycle state machine NEW → OPEN → PENDING → RESOLVED → CLOSED with reopen + follow-up, SLA timer: warn, breach → escalate, PENDING pause, check on fire, live updates: outbox → Kafka → WebSocket, versions, resync, offline email, multi-tenancy: tenant from JWT, search leak vs filtered alias, noisy tenant rate limits), how to explain, 4-paragraph spoken answer, Spring/Mongo/Kafka code, 18 follow-ups. | git tag `sd-support/v1.0` |

**Git** · `sd-git`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-19 | New page, 6 tabs: overview loop, 11 components + drawn commit graph (links to Core Components for gateway, DB, S3, Kafka; to 4 Notification, 10 Search in the answer), 6 flows (objects and hashes: blob/tree/commit, branch = pointer, dedup, integrity; branch and merge: merge base, 3-way merge, two-parent commit, fast-forward vs rebase; push and fetch: ref advertisement, packfile, index-pack + connectivity, want/have; two pushes one branch: blind write vs ref CAS, non-fast-forward, rebase and retry; hosted shards and replicas: repo sharding, object pools, quorum ref vote, stale replica repair, reads from replicas; big files and PR events: LFS pointer + presigned S3, push event after commit, signed webhook, merge button = server merge + CAS), how to explain, 4-paragraph spoken answer, Java/JGit/Kafka code, 18 follow-ups. | current file · tag `sd-git/v1.0` |

**Parking Lot** · `sd-parking`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-19 | New page (LLD + HLD), 6 tabs: overview loop, 12 components (links to Core Components for gateway, Redis, Kafka, DB scaling; to 2 Rate Limiter, 3 Ticket Booking, 4 Notification, 5 E-commerce in the answer), 6 flows (a car enters: ANPR, open-ticket check, nearest-fit strategy via Redis ZPOPMIN, spot CAS + ticket, boards, truck refused; two gates one spot: find-then-save vs CAS on state, atomic pop, why not synchronized, leaked spot + reconciler; exit and payment: PricingStrategy, idempotency key = ticket id, lost reply retry, conditional close + free, provider down → circuit breaker + pay later; live availability: Redis counters, LAN boards, lot events with seq to Kafka, band pushes, eventual consistency, dedupe + snapshot; reserve a spot: quota CAS, HELD with hold TTL, expiry, RESERVED spot, plate match, no-show timer; many lots offline edge: shard by lotId, local journal while the WAN is down, payments offline, stale lot, ordered resync, standby lot server), how to explain (incl. LLD stage), 4-paragraph spoken answer, Java/Spring/Mongo/Redis code (class model + Strategy, thread-safe allocate, Redis pop + Mongo CAS, idempotent exit), 7 trade-offs, 18 follow-ups. | current file · tag `sd-parking/v1.0` |

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

### Interview Extras

**Interview Question Bank** · `question-bank`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-16 | Real interview questions deduped into concept groups; collapsed cards → spoken answer on click; category pills (multi-select), 🏢 company labels + company filter, ⊕/⊖ expand all, search. Answers in `data/*.js`. | current file |

**Coding Practice hub** · `code-hub`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.1 | 2026-11-17 | All 22 problem pages linked (READY); intro describes the 2 screens (Run it · Remember it). | current file |
| v1.0 | 2026-11-16 | 22 problems in 8 groups, built/completed status. Shared trace engine in `07_Interview/01_Coding/engine/`. | tag `code-hub/v1.0` |

**1. Two Sum** · `code-two-sum`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.1 | 2026-11-17 | Engine update (player.js / ds.js / ds.css): return value shown in the Visualize header (no more wrapping toolbar), code font auto-fits code + inline values, chunk badges are numbers, input box grows with its text, stack top label no longer overflows. | current file |
| v2.0 | 2026-11-16 | Rebuilt as 2 screens: Run it (problem strip + Code · Visualize · Data structures · Variables, Debug/Auto) and Remember it (4-chunk shortcut, declaration lines, chunked code, traps, time & space, follow-ups). | tag `code-two-sum/v2.0` |
| v1.0 | 2026-11-16 | Looping overview (array + HashMap live), step-by-step on the minimum loop with own input + Java line highlight, vars/approach/D·L·C·S chunks, Big-O race + follow-ups. | `_archive/07_Interview/01_Coding/01_Two_Sum_v1.html` |

**2. Best Time to Buy & Sell Stock** · `code-stock`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.1 | 2026-11-17 | Engine update (player.js / ds.js / ds.css): return value shown in the Visualize header (no more wrapping toolbar), code font auto-fits code + inline values, chunk badges are numbers, input box grows with its text, stack top label no longer overflows. Shorter inline value on the maxProfit line. | current file |
| v2.0 | 2026-11-16 | Rebuilt as 2 screens: Run it (problem strip + Code · Visualize · Data structures · Variables, Debug/Auto) and Remember it (4-chunk shortcut, declaration lines, chunked code, traps, time & space, follow-ups). | tag `code-stock/v2.0` |
| v1.0 | 2026-11-16 | Price bar chart with buy/day pointers, step-by-step 4-day minimum loop, D·L·B·S chunks, Big-O race + follow-ups. | `_archive/07_Interview/01_Coding/02_Best_Time_Buy_Sell_Stock_v1.html` |

**Data structures gallery** · `code-structures`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.1 | 2026-11-17 | + Intervals (number line, sort + merge demo). Engine additions used by the new problem pages: intervals view, Visualize rows (extra views below / beside), array index labels + no-pointer rows, small stack, map column widths, ArrayList item width. | current file |
| v1.0 | 2026-11-16 | 11 structures (Array, ArrayList, LinkedList, Queue, Stack, HashMap, HashSet, TreeMap, TreeSet, binary tree, 2D grid) with clickable operations, Big-O and demos. Engine `engine/ds.js`. | tag `code-structures/v1.0` |

**8. Longest Substring Without Repeating Characters** · `code-longest-substring`

| Version | Date | What it has | Where |
|---|---|---|---|
| v2.1 | 2026-11-17 | Engine update (player.js / ds.js / ds.css): return value shown in the Visualize header (no more wrapping toolbar), code font auto-fits code + inline values, chunk badges are numbers, input box grows with its text, stack top label no longer overflows. | current file |
| v2.0 | 2026-11-16 | Added screen 2 · Remember it; compact variables (scope label left); problem strip. | tag `code-longest-substring/v2.0` |
| v1.0 | 2026-11-16 | First page on the 4-block player (Code · Visualize · Data structures · Variables), 🐞 Debug / ▶ Auto modes, inline values on code lines, own input + presets. | this conversation, superseded |

**3. Contains Duplicate** · `code-contains-duplicate`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (array + live HashSet, Debug/Auto, own input + 4 presets) and Remember it (D·L·C·A chunks, declarations, traps, time & space, follow-ups). | current file |

**4. Product of Array Except Self** · `code-product-except-self`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (nums with left/right window, int[] answer filled in two passes, Debug/Auto, own input + 4 presets) and Remember it (D·L·R·R chunks, declarations, traps, time & space, follow-ups). | current file |

**5. Maximum Subarray (Kadane’s)** · `code-max-subarray`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (current-run window + best cells, two ints as the whole state, Debug/Auto, own input + 4 presets) and Remember it (S·L·E·B chunks, declarations, traps, time & space, follow-ups). | current file |

**6. Valid Anagram** · `code-valid-anagram`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (s and t as two rows, int[26] count with letter labels, +1/−1 then zero-check, Debug/Auto, own input + 4 presets) and Remember it (L·C·B·Z chunks, declarations, traps, time & space, follow-ups). | current file |

**7. First Non-Repeating Character** · `code-first-unique-char`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (s with pass-1 / pass-2 pointers, int[26] count with letter labels, Debug/Auto, own input + 4 presets) and Remember it (D·C·S·N chunks, declarations, traps, time & space, follow-ups). | current file |

**9. Group Anagrams** · `code-group-anagrams`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (strs + the current word’s char[] before/after sort, live HashMap (sorted key → words), Debug/Auto, own input + 4 presets) and Remember it (D·L·K·A chunks, declarations, traps, time & space, follow-ups). | current file |

**10. Move Zeroes** · `code-move-zeroes`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (read / write pointers swapping in place, settled non-zeros window, Debug/Auto, own input + 4 presets) and Remember it (W·R·C·S chunks, declarations, traps, time & space, follow-ups). | current file |

**11. 3Sum** · `code-3sum`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (sorted nums with i / lo / hi pointers, result list of triplets, duplicate skips, Debug/Auto, own input + 4 presets) and Remember it (S·F·P·D chunks, declarations, traps, time & space, follow-ups). | current file |

**12. Container With Most Water** · `code-container-water`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (heights as walls, container window between left / right, move-the-shorter-wall steps, Debug/Auto, own input + 4 presets) and Remember it (E·A·B·M chunks, declarations, traps, time & space, follow-ups). | current file |

**13. Binary Search** · `code-binary-search`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (lo / mid / hi pointers, search-space window shrinking by half, Debug/Auto, own input + 4 presets) and Remember it (B·M·C·N chunks, declarations, traps, time & space, follow-ups). | current file |

**14. Search in Rotated Sorted Array** · `code-search-rotated`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (rotated array as bars, lo / mid / hi with the sorted half lit up, Debug/Auto, own input + 4 presets) and Remember it (B·M·S·K chunks, declarations, traps, time & space, follow-ups). | current file |

**15. Merge Intervals** · `code-merge-intervals`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (new intervals view: one row per interval on a number line, sort then grow the last; List of merged int[], Debug/Auto, own input + 4 presets) and Remember it (S·L·N·G chunks, declarations, traps, time & space, follow-ups). | current file |

**16. Valid Parentheses** · `code-valid-parentheses`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (s with matched pairs in green, ArrayDeque stack of expected closers drawn as a stack, Debug/Auto, own input + 4 presets) and Remember it (D·L·P·C chunks, declarations, traps, time & space, follow-ups). | current file |

**17. Next Greater Element** · `code-next-greater`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (nums + answer rows, monotonic Deque of waiting indices drawn as a stack, Debug/Auto, own input + 4 presets) and Remember it (D·L·P·W chunks, declarations, traps, time & space, follow-ups). | current file |

**18. Reverse a Linked List** · `code-reverse-list`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (nodes with next arrows flipping in place, prev / curr / next pointers, Debug/Auto, own input + 4 presets) and Remember it (P·S·F·M chunks, declarations, traps, time & space, follow-ups). | current file |

**19. Maximum Depth of Binary Tree** · `code-max-depth`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (recursive DFS: tree with current / waiting / done nodes and each node’s depth, call stack of maxDepth frames beside it, Debug/Auto, own level-order input + 4 presets) and Remember it (B·L·R·C chunks, declarations, traps, time & space, follow-ups). | current file |

**20. Number of Islands** · `code-islands`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (grid DFS that sinks each island in place, call stack of sink(r, c) frames beside the grid, Debug/Auto, own grid input + 4 presets) and Remember it (S·C·B·D chunks, declarations, traps, time & space, follow-ups). | current file |

**21. Word Search** · `code-word-search`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (board grid with the current path marked #, wrong letters in red, restore on backtrack; call stack of dfs(r, c, k) beside it; word with matched letters, Debug/Auto, own input + 4 presets) and Remember it (S·B·M·U chunks, declarations, traps, time & space, follow-ups). | current file |

**22. Climbing Stairs** · `code-climbing-stairs`

| Version | Date | What it has | Where |
|---|---|---|---|
| v1.0 | 2026-11-17 | 2 screens on the shared player: Run it (bottom-up DP: int[] ways as growing bars, the two added values boxed, Debug/Auto, own n + 4 presets) and Remember it (B·T·S·R chunks, declarations, traps, time & space with the O(1) two-variable version, follow-ups). | current file |
