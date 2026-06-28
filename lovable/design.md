# DeRisk Vault — Design System

A dark, high-security operations console for an autonomous DeFi protocol. The
visual language borrows from trading terminals and SOC dashboards: deep slate
surfaces, monospaced numerics, and a single luminous accent that signals
"system online." Emergency states break the calm with a bold, unmistakable red.

---

## 1. Color Tokens

All colors are defined in `src/styles.css` as `oklch()` and exposed as Tailwind
utilities via `@theme inline`. Never hardcode hex in components.

### Surfaces
| Token | Role |
|---|---|
| `--background` `oklch(0.16 0.018 250)` | App canvas — deep slate/obsidian |
| `--surface` `oklch(0.20 0.020 250)` | Inner panels inside cards |
| `--surface-elevated` `oklch(0.235 0.022 250)` | Active toggles, wallet chip |
| `--card` `oklch(0.205 0.020 250)` | Primary card background |
| `--border` `oklch(0.30 0.025 250)` | Hairline dividers |
| `--input` `oklch(0.26 0.022 250)` | Form fields |

### Primary — Cyan/Teal (`#7be1d8`-range)
`--primary: oklch(0.78 0.15 195)` — used for CTAs, links, verified indicators,
and the brand glow. Paired with `--gradient-primary` (cyan → teal) for the
logo mark, progress bars, and any "AI in control" affordance.

### Semantic states
| Token | Use |
|---|---|
| `--success` `oklch(0.72 0.17 155)` | Operational / Confirmed / Streaming |
| `--warning` `oklch(0.80 0.16 75)` | Elevated premium, pre-emptive adjustments |
| `--emergency` `oklch(0.65 0.25 18)` | Protocol halt, frozen entry |
| `--destructive` `oklch(0.65 0.235 25)` | Failed transactions |

### Effects
- `--glow-primary` — soft cyan halo on the brand mark and primary CTAs.
- `--glow-emergency` — red bloom around halted cards.
- `--shadow-card` — subtle inner top-light + dropped shadow for floating cards.
- `.bg-grid` — 48px hairline grid across the canvas for a "terminal" feel.

---

## 2. Typography

Two families loaded from Google Fonts in `__root.tsx`:

- **Inter (sans)** — UI, prose, labels. Weights: 400, 500, 600, 700.
- **JetBrains Mono** — *all* numerics, hashes, timestamps, classification
  strings, and uppercase eyebrow labels. Exposed via the `text-mono` utility.

### Hierarchy
| Use | Size / Weight |
|---|---|
| Page title | `text-2xl / 600` |
| Card section title | `text-base / 600` |
| Hero metric (premium %) | `text-5xl / 600 tabular-nums mono` |
| State headline | `text-2xl / 600` |
| Body | `text-sm / 400` muted-foreground |
| Eyebrow label | `text-[10px] uppercase tracking-[0.14em] mono` |
| Hash / timestamp | `text-[11px] mono` |

Tabular numerics (`tabular-nums`) are mandatory anywhere a value changes
(balance, premium, TVL) so digits don't reflow.

---

## 3. Spacing & Layout

- **Radius scale**: base `0.75rem`. Cards `xl`, inputs/buttons `md`, pills `full`.
- **Grid**: max-width `7xl` container, `px-4 → lg:px-8`, vertical rhythm `space-y-8`.
- **Status cards**: 3-column on `md+`, single column on mobile.
- **Operations row**: 2/5 vault form + 3/5 audit trail on `lg+`, stacked below.
- **Card padding**: `p-5` standard; sub-blocks use `p-3` with subtle inner borders.

---

## 4. Components

### Cards
Single source of truth — rounded `xl`, `bg-card`, hairline border, `shadow-card`.
Emergency variant swaps border to `emergency/40`, adds a diagonal red gradient
wash, and applies `glow-emergency`.

### Buttons
Shadcn `Button` extended only through variants. Primary CTA is filled cyan with
`primary-foreground`. Disabled state preserves layout via `disabled:opacity-50`
and shows a `Loader2` spinner during async work — never a layout shift.

### Inputs
Large 14h numeric input with right-anchored "MAX" pill and CSPR suffix.
Focus ring uses `ring-primary/40` to echo the brand glow without overpowering.

### Pills & badges
- **Network pill**: success-tinted with a pulsing dot.
- **Status tag**: 10px mono uppercase, tinted border + bg in the semantic color.
- **Type icon tile**: 32px rounded square, tinted background, matching glyph.

### Timeline (audit trail)
Vertical rail at 34px left aligned with the type-icon tile. Each entry is its
own row with hover surface, hash anchor wraps responsibly via `break-all`.

---

## 5. State Paradigms

The dashboard is built around four explicit UI states. Every interactive
surface is designed against all four.

### Loading
- Async work uses an inline `Loader2` spinner inside the action button with
  literal copy ("Processing Transaction…"). The button stays the same size.
- Header "Sync Node" uses the spin animation on its icon without disabling
  the button label.

### Operational (default)
- Cool tones dominate. Success dots pulse softly to signal a live feed.
- Numeric values are calm — no animation on idle.

### Success
- Inline confirmation drawer slides up beneath the form with a success border,
  amount, and a copyable block-explorer link. Dismissible.

### Emergency / Halted
- The Underwriting card flips to the emergency variant: red border, glow,
  diagonal wash, `AlertOctagon` headline.
- The Vault form disables inputs and the CTA, surfaces a tinted alert box, and
  changes the CTA label to "Halted by Sentinel" — never silently disabled.
- Audit-trail entries use the `freeze` variant icon and red halt flag.

### Failed
- Failed sentinel events get a destructive-tinted status tag with `XCircle`.
  The row is otherwise unchanged so the timeline rhythm stays intact.

### Empty
- Not used in this build (the audit trail ships seeded). When introduced,
  empties follow the same card frame with a muted icon + single-line copy and
  optional ghost CTA.

---

## 6. Motion

Restrained. Motion is reserved for *signal*, not decoration.

- `pulse-dot` — 2s ease pulse on live status dots.
- `animate-spin` — only on the sync icon and processing spinner.
- Receipt drawer uses `fade-in slide-in-from-bottom-2` (tw-animate-css).
- Premium-rate progress bar transitions width over 700ms when the AI shifts it.

---

## 7. Accessibility & Responsiveness

- Color contrast: foreground on background ≥ 12:1; semantic tones ≥ 4.5:1 on
  their tinted backgrounds.
- Every status pill carries both color *and* an icon + text label.
- Focus rings use `ring-primary/40` on all interactive elements.
- Layout collapses cleanly: 3-col → 1-col cards, 2/5 + 3/5 → stacked, header
  hides the countdown on `<sm` but always keeps Connect Wallet reachable.
