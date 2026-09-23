---
name: ulima-inspired-ui

description: Design and implement web or app interfaces with a visual language inspired by the Universidad de Lima (ULima): warm institutional orange, editorial hierarchy, strong sectioning, clean academic/professional layouts, restrained geometry, and accessible information-dense UI. Use for dashboards, portals, academic tools, internal systems, landing pages, student/teacher apps, forms, tables, schedules, course screens, and responsive web UIs that should feel compatible with the ULima visual environment without copying logos, shields, the eight-point star, official lockups, or claiming official affiliation.
---

# ULima-inspired UI skill

Use this skill to create interfaces that feel visually compatible with the current Universidad de Lima digital and institutional environment while remaining an original, non-official design.

The objective is **institutional resemblance through design language, not brand imitation**.

## Mandatory brand-safety boundary

Never use or recreate:
- Universidad de Lima logo or wordmark.
- ULima coat of arms or shield.
- The eight-point ULima star/isotype, including near-copies intended to evoke it.
- Official seals, signatures, institutional lockups, or branded campaign artwork.
- Copy that implies the product is an official ULima product unless the user explicitly provides authorization and requests that statement.

Allowed:
- The verified institutional orange reference `#F58220` as a UI color.
- Neutral academic/professional typography with a similar visual character.
- Editorial hierarchy, spacing, navigation patterns, tables, cards, tabs, accordions, and content structures inspired by ULima's public web presence.
- Original geometric accents that are not confusingly similar to the ULima star or shield.

When unsure, prefer **ULima-inspired** over **ULima-branded**.

## Sources of truth

Read `references/design-language.md` before designing a screen or a component family.
Read `references/sources.md` when you need to distinguish verified observations from inferred design rules.
Use `assets/tokens.css` as the default implementation starting point when CSS variables are useful.

## Design intent

The interface should feel:
- academic but contemporary;
- structured rather than decorative;
- confident and energetic without looking playful;
- warm because of orange accents, but predominantly neutral in large surfaces;
- information-rich without becoming visually dense;
- editorial in headings and section transitions;
- professional enough for faculty, administrative, student, and institutional tools.

Avoid a generic SaaS look dominated by blue gradients, glassmorphism, oversized rounded cards, neon colors, or excessive shadows.

## Core visual rules

### 1. Color

Use `#F58220` as the primary orange reference.

Do not flood large surfaces with orange. Prefer it for:
- primary actions;
- selected tabs;
- active navigation indicators;
- links and small highlights;
- section rules;
- badges requiring emphasis;
- focus states when contrast remains accessible.

Default supporting palette:
- canvas: warm white or very light neutral;
- surfaces: white;
- text: charcoal / near-black;
- secondary text: medium gray;
- borders: light neutral gray;
- optional warm tint: pale orange for selected or informative states.

Success, warning, error, and info colors must be semantic and accessible, not forced into the brand orange.

### 2. Typography

The public sources confirm that the 2019 identity introduced a new typography, but the exact family is not reliably identified in the public material used for this skill. Therefore:
- never claim a font is the official ULima typeface unless the project itself provides that licensed font or a verified source;
- prefer a clean humanist or neo-grotesk sans serif;
- good defaults: `Inter`, `Arial`, `Helvetica Neue`, or the project's existing sans serif;
- use bold or semibold uppercase sparingly for section labels and navigation groups;
- use sentence case for body copy, field labels, and most controls;
- maintain compact, disciplined line lengths.

Recommended hierarchy:
- display / page title: 36–48 px desktop, 30–36 px tablet/mobile;
- section heading: 24–32 px;
- subsection: 18–22 px;
- body: 15–17 px;
- metadata / eyebrow: 12–14 px, semibold, often uppercase with modest tracking.

### 3. Shape language

Favor:
- rectangular geometry;
- subtle radii (4–10 px);
- crisp borders;
- thin dividers;
- restrained shadows only when elevation communicates function.

Avoid:
- pill-shaped everything;
- 20–32 px radii on every card;
- floating glass panels;
- bubbly consumer-app styling.

### 4. Layout

Use a disciplined grid.

Desktop defaults:
- max content width: 1180–1320 px for public pages;
- app shells may use full width with a constrained content column;
- 12-column grid when useful;
- generous page margins;
- dense data tables may stretch wider than article content.

Create strong section rhythm with:
- whitespace;
- horizontal rules;
- large section labels;
- clear titles;
- modular content blocks;
- alternating neutral surfaces only when it improves scanning.

### 5. Navigation

For public or content-rich experiences:
- use a clean top header;
- keep first-level navigation concise;
- use section anchors or tabs for long pages;
- show the active section clearly with orange or a strong typographic state.

For authenticated apps:
- prefer a left sidebar or compact top navigation;
- use neutral surfaces and one orange active indicator;
- avoid branding-heavy mastheads;
- keep utility actions visually quieter than task actions.

### 6. Tabs and section switchers

ULima's public pages rely heavily on sectioned content. Translate this into interfaces with:
- text-first tabs;
- clear active underline, side rule, or border;
- minimal chrome;
- meaningful labels;
- horizontal tabs on desktop and scrollable/stacked variants on mobile.

Never style tabs as a row of oversized colorful pills unless the product context requires it.

### 7. Cards

Cards are functional containers, not decorative tiles.

Default card:
- white background;
- 1 px light border;
- radius 6–8 px;
- no shadow or extremely subtle shadow;
- clear header/body/action hierarchy;
- 16–24 px internal padding.

Use orange as a micro-accent, not as every card background.

### 8. Tables and academic data

For rosters, grades, schedules, participation records, reports, and administrative data:
- prioritize readability and column alignment;
- use sticky headers for long tables;
- use row hover subtly;
- use zebra striping only if density requires it;
- keep destructive actions separated from common actions;
- use orange for active/primary controls, not status semantics;
- preserve keyboard navigation and visible focus.

### 9. Forms

Forms should feel administrative and precise:
- persistent labels above inputs;
- 40–44 px minimum control height;
- 6–8 px radius;
- neutral border normally;
- orange or high-contrast focus ring;
- helper/error text directly below the field;
- grouped fields with clear section titles;
- avoid placeholder-only labeling.

Primary submit actions may use orange; secondary actions should remain neutral.

### 10. Buttons

Primary:
- orange background;
- high-contrast label;
- medium radius;
- semibold text;
- strong hover/focus states.

Secondary:
- white or neutral surface;
- gray border;
- dark text.

Tertiary:
- text or icon button;
- orange can be used as link/action color.

Destructive:
- use semantic red, not orange.

### 11. Editorial modules

For landing pages, program pages, or announcements:
- use a strong headline;
- compact supporting copy;
- one obvious call to action;
- photography may be large and architectural, academic, student-life, or professional in tone;
- avoid placing text over busy photography unless contrast is guaranteed.

Use short uppercase metadata labels to create institutional rhythm.

### 12. Accessibility

Accessibility is part of the source institution's public web direction, not an optional enhancement.

Always:
- meet WCAG AA contrast for text and controls;
- make focus states visible;
- support keyboard operation;
- never convey state by color alone;
- retain scalable text and comfortable line-height;
- use semantic HTML;
- label controls explicitly;
- respect `prefers-reduced-motion`;
- ensure targets are practical on touch screens.

Do not assume `#F58220` with white text is accessible at every size. Check contrast; use darker text or a darker orange interaction variant when needed.

## Workflow

When asked to design or implement a UI:

1. Identify the product type: public website, dashboard, internal tool, student app, faculty app, form workflow, data-heavy admin view, or mobile interface.
2. Inspect the existing codebase first. Reuse its framework, component library, conventions, and accessibility utilities.
3. Read `references/design-language.md`.
4. Preserve the product's information architecture unless redesign is explicitly requested.
5. Apply ULima-inspired foundations: neutral canvas, verified orange accent, strong editorial hierarchy, restrained geometry, structured sections.
6. Design the information hierarchy before styling individual components.
7. Build responsive states intentionally; do not simply compress desktop.
8. Check accessibility, contrast, empty states, error states, loading states, and long-content behavior.
9. Remove any accidental logo-like stars, shield motifs, or official-looking brand lockups.
10. In the final summary, describe the output as **ULima-inspired** or **compatible with the ULima visual language**, never as an official ULima design unless the user explicitly establishes that status.

## Framework-specific guidance

### React / Next.js
- Prefer reusable primitives and semantic components.
- Keep color and spacing in CSS variables or the project's token system.
- Use server/client boundaries according to the existing project.
- Do not introduce a new UI framework solely for the visual style.

### Tailwind
Map the tokens to theme variables rather than scattering hex values throughout components.
Suggested names:
- `brand-orange`
- `brand-orange-strong`
- `brand-orange-soft`
- `surface`
- `canvas`
- `ink`
- `muted`
- `border`

### Mobile
- Keep orange for primary actions and active navigation.
- Use bottom navigation only when the information architecture supports 3–5 high-frequency destinations.
- Prefer lists and grouped sections to dense card mosaics.
- Maintain restrained radii and neutral surfaces.

## Quality gate

Before finishing, verify all of these:
- [ ] No ULima logo, coat of arms, official star, seal, or confusing imitation appears.
- [ ] The interface does not claim official affiliation.
- [ ] `#F58220` is used as an accent, not as an indiscriminate background.
- [ ] Typography is neutral and readable; no unverified font is called “official”.
- [ ] Layout has strong hierarchy and section rhythm.
- [ ] Components are restrained and functional rather than generic trendy SaaS.
- [ ] Data-heavy areas are readable and keyboard-accessible.
- [ ] All interactive states exist: hover, focus, disabled, loading where relevant, error where relevant.
- [ ] Mobile and narrow-width behavior is intentional.
- [ ] Contrast is WCAG AA or better for required content.

## Output expectation

When the user asks for code, return production-ready code consistent with the existing project.
When the user asks for a design specification, provide tokens, layout, components, states, and responsive behavior.
When the user asks for a new visual direction, use this skill as a design constraint rather than copying any public ULima page verbatim.
