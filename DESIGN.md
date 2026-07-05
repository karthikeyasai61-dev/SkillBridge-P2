# Design System Manifest (Google Stitch)

This file defines the brand visual identity, design tokens, component specifications, and style rules for the **Skill Bridge** platform. AI-native design tools like **Google Stitch** use this manifest to generate consistent, pixel-perfect user interfaces and code scaffolds.

---

## 🎨 Design Tokens & Brand Identity

### 1. Colors & Palette

| Token | CSS Variable | Value | Purpose / Role |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `--color-primary` | `#4361ee` | Brand signature color, call-to-action buttons, main brand accents. |
| **Primary Light** | `--color-primary-light` | `#6b83f2` | Button hover states, light indicators, background tints. |
| **Primary Dark** | `--color-primary-dark` | `#3451d1` | Active interactive states. |
| **Secondary Violet**| `--color-secondary` | `#7209b7` | Secondary features, premium accents. |
| **Accent Pink** | `--color-accent` | `#f72585` | Attention grabbers, highlights, premium elements. |
| **Success Green** | `--color-success` | `#06d6a0` | Completed stages, passing grades, positive indicators. |
| **Warning Orange** | `--color-warning` | `#ffd166` | Warning status badges, not-started or progress warnings. |
| **Danger Red** | `--color-danger` | `#ef476f` | Errors, negative evaluation results, alerts. |
| **Info Cyan** | `--color-info` | `#118ab2` | Information indicators. |

### 2. Layout Backgrounds & Surfaces

| Token | CSS Variable | Value | Purpose / Role |
| :--- | :--- | :--- | :--- |
| **App Background** | `--bg-primary` | `#f8f9fc` | Main body background color. |
| **Main Surface** | `--bg-secondary`| `#ffffff` | Content containers, navigation sections. |
| **Card Surface** | `--bg-card` | `#ffffff` | Individual card bodies. |
| **Sidebar Surface** | `--bg-sidebar` | `#0f1729` | Dark premium sidebar background. |
| **Input Background**| `--bg-input` | `#f1f3f9` | Form fields, select dropdowns, search inputs. |

### 3. Typography

- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings**: Semibold/Bold (`font-weight: 600` or `700`) with `--text-primary` (`#1a1d2e`).
- **Body Text**: Regular/Medium (`font-weight: 400` or `500`) with `--text-secondary` (`#6b7280`).
- **Muted Labels**: Light (`font-weight: 300` or `400`) with `--text-muted` (`#9ca3af`).

### 4. Borders & Radii

- **Small Radius**: `--border-radius-sm: 8px` (small inputs, simple tags)
- **Medium Radius**: `--border-radius-md: 12px` (buttons, forms, inline alerts)
- **Large Radius**: `--border-radius-lg: 16px` (main component cards, dashboards)
- **Extra Large Radius**: `--border-radius-xl: 20px` (popups, onboarding modals)
- **Pill Radius**: `--border-radius-full: 9999px` (circular elements, badges)
- **Border Color**: `--border-color: #e5e7eb` (thin, subtle separators)

### 5. Shadows

- **Subtle**: `--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04)`
- **Medium/Standard**: `--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06)`
- **Elevated**: `--shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08)`
- **Interactive Card**: `--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Hover Glow**: `--shadow-card-hover: 0 8px 25px rgba(67, 97, 238, 0.12)`

---

## 🧱 Component Styling Guide

To maintain design consistency when generating markup, map your elements to the following CSS classes:

### 1. Buttons

- **Primary Button (`.btn.btn-primary`)**:
  - Background: `var(--color-primary)` (`#4361ee`)
  - Color: `#ffffff`
  - Hover: Background is `var(--color-primary-light)` (`#6b83f2`)
- **Secondary Button (`.btn.btn-secondary`)**:
  - Background: `rgba(67, 97, 238, 0.08)`
  - Color: `var(--color-primary)`
- **Outline Button (`.btn.btn-outline`)**:
  - Border: `1px solid var(--color-primary)`
  - Color: `var(--color-primary)`
  - Hover: Background is `var(--color-primary-bg)`

### 2. Cards (`.card`)

- Border: `1px solid var(--border-color)`
- Border Radius: `var(--border-radius-lg)` (`16px`)
- Shadow: `var(--shadow-card)`
- Padding: `24px`
- Transitions: `transform 0.2s, box-shadow 0.2s`
- Hover state: `transform: translateY(-2px); box-shadow: var(--shadow-card-hover);`

### 3. Badges (`.badge-tag`)

- Padding: `6px 12px`
- Font Size: `0.78rem`
- Font Weight: `600`
- Border Radius: `var(--border-radius-full)`
- **Variants**:
  - Grey: Background `#f1f5f9`, Text `#64748b`
  - Green (Success): Background `var(--color-success-bg)`, Text `var(--color-success)`
  - Blue (Progress): Background `var(--color-primary-bg)`, Text `var(--color-primary)`
  - Orange (Warning): Background `var(--color-warning-bg)`, Text `#d97706`
  - Pink (Accent/Advanced): Background `rgba(247, 37, 133, 0.1)`, Text `var(--color-accent)`

---

## 🤖 Instructions for AI Generators (Stitch, Vibe Design)

When designing new components, routes, or dashboards for this application, enforce the following rules:

1. **Use CSS Variables**: Never hardcode colors like `#4361ee` or `#ffffff` in inline styles. Always use `var(--color-primary)` and `var(--bg-secondary)`.
2. **Glassmorphic Gradients**: For premium UI widgets (e.g., career highlights or certification paths), apply linear background gradients blending `var(--color-primary)` into `var(--color-secondary)` with subtle opacity.
3. **Responsive Grid Layout**: Maintain a multi-column responsive grid matching:
   ```css
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
   gap: 20px;
   ```
4. **Transition Durations**: Apply smooth interactive feedback transitions on all hover events:
   `transition: all var(--transition-normal);`
