# UI Style Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the black-and-white visual system and landing page content from `/Users/jiguang/Git-projects/codex-nexus` into the primary `web/default` frontend while preserving 51token routing, authentication, configuration, and admin workflows.

**Architecture:** Keep `web/default` as the source of truth. Map the imported style into existing CSS variables in `web/default/src/styles/theme.css`, then replace the default landing sections with adapted React components that use current TanStack Router, i18n, and app layout primitives. Avoid touching backend code or `web/classic` in this pass.

**Tech Stack:** React 19, TypeScript, Rsbuild, Tailwind CSS v4, lucide-react, motion, TanStack Router, i18next.

---

### Task 1: Global Theme Variable Migration

**Files:**
- Modify: `web/default/src/styles/theme.css`
- Modify: `web/default/src/styles/index.css`

**Steps:**
1. Update light and dark base variables to the `codex-nexus` black/white palette while preserving every semantic variable currently consumed by shadcn/Base UI components.
2. Add reusable homepage utilities from `codex-nexus` only when they are broadly useful, such as `container-main`, `panel-card`, `text-gradient-main`, and button treatment helpers.
3. Remove or neutralize colored landing-only radial gradients in the existing homepage styles after component migration.
4. Verify the theme still exposes `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `sidebar`, status, chart, and skeleton variables.

**Verification:**
- Run `pnpm --dir web/default typecheck`.
- Run `pnpm --dir web/default build`.

### Task 2: Landing Page Content Migration

**Files:**
- Modify: `web/default/src/features/home/index.tsx`
- Modify/Create: `web/default/src/features/home/components/sections/*.tsx`
- Modify: `web/default/src/features/home/components/index.ts`

**Steps:**
1. Adapt the `codex-nexus` section order into the existing 51token `Home` route: Hero, Stats, Features, Integrations, Pricing, FAQ, Footer.
2. Preserve custom homepage behavior: if `HomePageContent` is configured, render the configured iframe or markdown content unchanged.
3. Replace mock login handlers with real routing: unauthenticated CTA links to `/sign-up`, authenticated CTA links to `/dashboard`.
4. Keep text content from `codex-nexus`, using `t()` where the rest of this frontend expects translatable strings.
5. Reuse existing shared components (`Button`, `Footer`, `PublicLayout`) where they improve consistency, and use lucide icons for section visuals.

**Verification:**
- Run `pnpm --dir web/default typecheck`.
- Open `http://localhost:3000/` in the in-app browser and inspect desktop and mobile.

### Task 3: Global Page Color Compatibility

**Files:**
- Inspect: `web/default/src/components/layout/components/public-header.tsx`
- Inspect: `web/default/src/components/ui/sidebar.tsx`
- Inspect: representative authenticated pages under `web/default/src/features/dashboard` and `web/default/src/features/system-settings`

**Steps:**
1. Check that the new variables make nav, sidebar, cards, dialogs, tables, forms, charts, and skeletons readable in both light and dark mode.
2. Replace hard-coded blue/violet landing classes in home sections with semantic variables unless they are status colors or code syntax accents.
3. Keep admin pages dense and operational rather than converting them into landing-page card layouts.

**Verification:**
- Start the local app.
- Browser check `/`, `/sign-in`, `/dashboard`, and `/system-settings/operations/performance`.
- Confirm no text overlap, blank content, or unreadable contrast in light/dark mode.

### Task 4: Final Validation

**Files:**
- Review all modified files with `git diff`.

**Steps:**
1. Run typecheck and production build.
2. Use browser testing for the migrated homepage and representative admin pages.
3. Keep unrelated untracked files out of this migration commit unless the user asks to include them.

**Verification:**
- `pnpm --dir web/default typecheck`
- `pnpm --dir web/default build`
- Browser screenshots/checks for desktop and mobile pages.
