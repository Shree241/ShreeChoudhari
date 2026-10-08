# Shree Choudhari | Seven Stations

Live portfolio: https://shree241.github.io/ShreeChoudhari/

A static engineering portfolio with an interactive procedural robot, seven TASL internship stations, project evidence and research. Published by GitHub Pages from `main`, `/(root)`. No server or deployment build step is required.

## Files

- `index.html`: complete semantic homepage content and import map.
- `css/site.css`: responsive graphite/orange design, layouts and static fallbacks.
- `js/site.js`: accessible navigation, filters, recruiter dialog, HMI state and sound (off by default).
- `js/scenes.js`: two lazily used Three.js renderers; one robot canvas moves between hero and HMI; one renders the currently active station.
- `js/robot-model.js`, `js/station-models.js`: procedural geometry, no external model files.
- `js/motion.js`: GSAP/ScrollTrigger and Lenis enhancement, including reduced-motion handling.
- `projects/`, `education/`: 14 fully rendered detail pages, available without JavaScript.
- `assets/`: real photos, logos, certificates, recommendation letters, resume and fallback illustration.
- `content.json`, `stations.json`: content reference snapshots. HTML is pre-rendered; editing JSON alone does not update it.

Three.js 0.186.1, GSAP 3.13.0 and Lenis 1.3.11 load from pinned jsDelivr module URLs through the import map. Core content and navigation work independently of those optional motion modules. WebGL failure shows a static robot illustration and preserves the complete content. A Lite quality option and automatic downgrade limit rendering load. Hardware performance should be evaluated on target devices; no FPS guarantee is claimed.

## Content status

The new internship station details marked `[ADD: ...]` require approved information from Shree. Do not replace them with invented results. The turbine readout is an illustrative simulation, not measured output or a validated power curve. The recruitment visual uses a synthetic illustration, not real candidate information. Copyright is labelled as an application until its registration number is confirmed.

## Editing and publication

Preserve all existing evidence. Make edits to the static HTML and shared CSS/JS, keeping header/footer and import-map changes consistent across the 15 pages. All site URLs use `/ShreeChoudhari/`. A custom-domain migration must change this base path, navigation, metadata and loaders as well as DNS.

Push ordinary commits to `main`; GitHub Pages deploys the root. Verify the live homepage, project details, documents and navigation. The previous published design remains in Git history at commit `9088ddc04cb5334269e4f62acd0bf1beec5c03d5`.
