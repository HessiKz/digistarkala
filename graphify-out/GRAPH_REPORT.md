# Graph Report - digistarkala  (2026-07-16)

## Corpus Check
- 88 files · ~146,977 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 875 nodes · 1151 edges · 61 communities (60 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2fd9fbc7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `fetch()` - 18 edges
3. `Motion Design Skill` - 15 edges
4. `Disney's 12 Principles — UI Adapted` - 14 edges
5. `useThemeStore` - 13 edges
6. `Button()` - 12 edges
7. `Timing & Easing Tables` - 12 edges
8. `formatCount()` - 11 edges
9. `useCartStore` - 11 edges
10. `scripts` - 11 edges

## Surprising Connections (you probably didn't know these)
- `loadJson()` --calls--> `fetch()`  [INFERRED]
  apps/storefront/src/api/catalog.ts → research/option-a/worker/src/index.js
- `loadContent()` --calls--> `fetch()`  [INFERRED]
  apps/storefront/src/api/content.ts → research/option-a/worker/src/index.js
- `api()` --calls--> `fetch()`  [INFERRED]
  scripts/scrape-fast.mjs → research/option-a/worker/src/index.js
- `collectProductIds()` --calls--> `fetch()`  [INFERRED]
  scripts/scrape-fast.mjs → research/option-a/worker/src/index.js
- `main()` --calls--> `fetch()`  [INFERRED]
  scripts/scrape-fast.mjs → research/option-a/worker/src/index.js

## Import Cycles
- None detected.

## Communities (61 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (44): getBrand(), getCategories(), getHome(), getHomeData(), getInit(), getProduct(), getProducts(), getProductsByIds() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): 1. Reachability, 2. Endpoint inventory, 3. Options A / B / C, 4. Recommendation, 5. Next-step implementation sketch (recommended: A + light C), 6. Artifact index, 7. Bottom line, A1. Plain Node `fetch` (this machine) (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (23): Button Press, Checkmark Success, Confirmation Badge, Corporate, Disabled / Enabled, Error Shake, Error State, Focus States (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (40): categoriesSample, elapsedMs, elapsedSec, errorCount, errorRate, errors, bytes, contentType (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (31): ENDPOINTS, headerMap(), main(), out, probeOne(), checkImageHotlink(), __dirname, fetchText() (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): contacts, address, email, mobile, phone, postalcode, currency, footerAbout (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (23): author, dependencies, playwright-core, sharp, description, keywords, license, main (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.23
Nodes (6): CookieJar, __dirname, ENDPOINTS, fetchWithTiming(), looksLikeChallenge(), main()

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (9): browserConsole, capturedAt, pageOrigin, results, target, verdict, anyAcaoAllowsForeign, anySuccessRead (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (6): __dirname, endpoints, HAR, OUT, PAGES, RAW_DIR

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (25): dependencies, gsap, @phosphor-icons/react, react, react-dom, react-router-dom, @tanstack/react-query, zustand (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): capturedAt, endpointCount, endpoints, har, origin, pages, userAgent

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): cap, count, generatedAt, note, products, source

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): capturedAt, host, results, runner

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): capturedAt, remote, results, runner

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): capturedAt, remote, results, runner

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): __dirname, mime, server

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (56): getBlogPost(), getBlogPosts(), getCmsPage(), getContent(), getMenus(), getStaticPage(), isExternal(), loadContent() (+48 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (13): CAP, collectAllProductUrls(), __dirname, fetchText(), leaf(), main(), normalizeProduct(), outDir (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (19): articles, banners, brands, categoryHighlights, categorySections, featuredProductIds, generatedAt, guarantees (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (9): categories, elapsedSec, errorCount, mode, note, scraped, withImages, withPrice (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (10): Build for GitHub Pages, DigiStarKala Premium Static Storefront, Enable Pages, Full catalog scrape, Quick start, Research, Routes, Routes (parity with digistarkala.ir) (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.32
Nodes (7): __dirname, leaf(), main(), outDir, root, samplePath, slugify()

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (4): count, generatedAt, products, source

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): categories, count, flat, generatedAt

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): __dirname, dist, fallback, index

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (21): Button Press (Playful), Card Entrance (Premium), Choreography Essentials, Common Patterns, CRITICAL — never break, Duration Table, Easing Selection, Emotion-to-Motion Map (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (33): body, path, slug, title, body, contacts, path, slug (+25 more)

### Community 34 - "Community 34"
Cohesion: 0.23
Nodes (14): absUrl(), api(), CMS_SLUGS, cookieHeader(), __dirname, jar, main(), mapMenuItems() (+6 more)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): generatedAt, menus, footer, top, name, pages, source

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (8): دیجی-استار-کالا, description, schema_type, body, path, seo, slug, title

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (6): روش-های-پرداخت, body, path, seo, slug, title

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (6): طرح-ارزش-آفرین, body, path, seo, slug, title

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (6): طرح-جایگزینی, body, path, seo, slug, title

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (6): طرح-پذیرش-ایده-های-نوین-اقتصادی-و-مشارکت, body, path, seo, slug, title

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (6): فروش-اقساطی, body, path, seo, slug, title

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (6): واردات-عمده-کالا, body, path, seo, slug, title

### Community 43 - "Community 43"
Cohesion: 0.50
Nodes (4): blog, categories, posts, top

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (19): api(), CAP, collectProductIds(), cookieHeader(), __dirname, leaf(), main(), MAX_RETRIES (+11 more)

### Community 45 - "Community 45"
Cohesion: 0.11
Nodes (17): 1. Direct Entrance (Slide In), 1. Direct Exit (Slide Out), 2. Dissolve Exit (Fade Out), 2. Emergent Entrance (Scale In), 3. Collapse Exit (Shrink Out), 3. Reveal Entrance (Clip/Mask), 4. Assembled Entrance (Multi-Part), 4. Transfer Exit (Move Away) (+9 more)

### Community 46 - "Community 46"
Cohesion: 0.11
Nodes (17): Accordion, Choreography Rules, Coordinated Sequences, Counter-Motion, Dashboard Widgets, Drag and Drop, Grid Cards, Group Rules (+9 more)

### Community 47 - "Community 47"
Cohesion: 0.12
Nodes (15): 1. Lead with the Hero, 2. Spatial Origin Consistency, 3. Counter-Motion, Attention Direction, Choreography, Common Recipes, Coordinated Entry Rules, Dashboard Load (+7 more)

### Community 48 - "Community 48"
Cohesion: 0.13
Nodes (14): 10. Exaggeration, 11. Solid Drawing, 12. Appeal, 1. Squash and Stretch, 2. Anticipation, 3. Staging, 4. Straight Ahead vs. Pose to Pose, 5. Follow Through and Overlapping Action (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (12): 1. Purpose?, 2. Audience?, 3. Context?, 4-Level Decision Hierarchy, Decision Framework, Decision Quick-Path, Evaluation Before Delivery, Level 1: Motion Category (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (12): 1. Signature Easing (80% of animations), 2. Duration Palette, 3. Entrance Pattern, Brand Motion Identity, Corporate / Professional, Energetic / Dynamic, Four Archetypes, Keyword Matching (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.15
Nodes (12): Ambient & Continuous Patterns, Breathing / Pulse, Combining Ambient Layers, Continuous Rotation, Dust/Motes: 5-10 elements, 10-30px/s mixed, 2-5px, 20-50% opacity, Floating / Hovering, Gradient Shift, Parallax (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.15
Nodes (12): Distance-Duration Scaling, Duration by Element Type, Duration by Personality, Easing: Directional Rules, Easing: Industry Standards, Enter vs. Exit, Interactive Feedback, Material-Based Easing (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.17
Nodes (11): Feels Cheap / Flat, Feels Too Fast / Jarring, Feels Too Slow, Inconsistent Feel, Looks Robotic, No Personality, Performance (Dropped Frames), Personality Mistakes (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (10): Accessibility, Cognitive Accessibility, Content Type Adaptation, Context Adaptation, Dark Mode, Performance Budgets, Platform Scaling, prefers-reduced-motion (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (10): Act 1: Anticipation (10-20%), Act 2: Action (30-50%), Act 3: Reaction (10-20%), Act 4: Resolution (20-30%), By Personality, Common Patterns, Four-Act Structure, Multi-Beat Narratives (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.18
Nodes (10): Accessibility Quality, CRITICAL, Emotional Quality, HIGH, MEDIUM, Performance Quality, Quality Checklist, Severity Tiers (+2 more)

### Community 57 - "Community 57"
Cohesion: 0.20
Nodes (9): Color, Combined Properties, Opacity, Performance, Position, Property Selection, Property Selection by Goal, Rotation (+1 more)

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (8): Core Philosophy, Pillar 1: Emotional Intent, Pillar 2: Visual Narrative, Pillar 3: Motion Craft, The 1/3 Screen Rule, The Attention Budget, Three Motion Layers, Three Pillars

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (7): Color Psychology, Color Transition Rules, Context-Based Emotion Defaults, Core Table, Emotion-to-Motion Mapping, Emotional Intensity, Path as Emotional Language

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (7): computedHash, skillPath, source, sourceType, skills, motion-design, version

## Knowledge Gaps
- **543 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+538 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetch()` connect `Community 4` to `Community 0`, `Community 34`, `Community 7`, `Community 44`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `loadJson()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `loadContent()` connect `Community 19` to `Community 4`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `fetch()` (e.g. with `loadJson()` and `loadContent()`) actually correct?**
  _`fetch()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _543 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09618874773139746 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._