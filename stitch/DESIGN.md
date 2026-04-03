# Design System Specification: The Kinetic Observatory

## 1. Overview & Creative North Star
This design system moves away from the static, boxy constraints of traditional fintech. Our Creative North Star is **"The Kinetic Observatory."** 

We are not just building a dashboard; we are crafting a lens through which users observe the movement of global capital. To achieve this, the system breaks the "template" look by favoring intentional asymmetry and tonal depth over rigid grids. We prioritize breathing room and high-contrast typography scales to create an editorial experience that feels as authoritative as a premium financial journal and as fluid as a modern trading terminal.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, midnight foundation, utilizing vibrant neon accents to represent the pulse of real-time data.

### The Color Logic
*   **Primary (#3fff8b):** Use this "Emerald Growth" token for positive trends, success states, and primary actions. It should feel like a glow in the dark.
*   **Secondary (#6e9bff):** This "Electric Blue" represents data flows and interactive elements.
*   **Surface Tiers:** We use a monochromatic range from `surface-container-lowest` (#000000) to `surface-bright` (#292c33) to define hierarchy.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off the UI. Standard dividers are prohibited. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-high` card against a `surface-background` creates a clean, sophisticated break.
2.  **Tonal Transitions:** Using subtle luminosity changes to guide the eye.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Nesting:** An inner module should always be one tier higher or lower than its parent. For example, a data table (surface-container-low) sitting inside a dashboard section (surface-container-lowest).
*   **The Glass & Gradient Rule:** For primary CTAs or high-level summaries, use a linear gradient transitioning from `primary` (#3fff8b) to `primary-container` (#13ea79) at a 135-degree angle. This adds "visual soul" and depth that flat hex codes cannot replicate.

## 3. Typography: The Editorial Edge
We use a dual-typeface system to balance character with high-density legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern authority. Use `display-lg` (3.5rem) for hero metrics and `headline-md` for section titles. The wide apertures of Manrope convey transparency and trust.
*   **Body & Labels (Inter):** The industry standard for data clarity. Use Inter for all `body-md` and `label-sm` tokens. It ensures that complex financial figures remain legible even at small scales.

**Typography Hierarchy Tip:** Use `on-surface-variant` (#aaabb0) for labels to create a sophisticated "muted" look, keeping the focus on the high-contrast `on-surface` (#f6f6fc) data values.

## 4. Elevation & Depth
In this design system, depth is a functional tool, not a decoration.

*   **The Layering Principle:** Stacking surfaces (Lowest to Highest) creates a natural lift. A "floating" feeling is achieved when a `surface-container-highest` element is placed over the `background`.
*   **Ambient Shadows:** For floating modals or dropdowns, use extra-diffused shadows. 
    *   *Formula:* Blur: 32px, Spread: -4px, Opacity: 6%. 
    *   *Color:* Use a tinted version of `surface-container-lowest` rather than pure black to keep the shadows feeling "atmospheric."
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use the `outline-variant` (#46484d) at **15% opacity**. This creates a "Ghost Border" that defines the edge without interrupting the visual flow.
*   **Glassmorphism:** For top navigation or floating toolbars, use a `surface` color with 60% opacity and a `backdrop-blur` of 20px. This allows the data "glow" from the dashboard to bleed through, integrating the UI into a single cohesive environment.

## 5. Components

### Buttons
*   **Primary:** A vibrant gradient of `primary` to `primary-container`. Text should be `on-primary` (#005d2c) for maximum contrast. Shape: `md` (0.375rem).
*   **Secondary:** Glass-style. A subtle `surface-variant` background with a `ghost-border`.
*   **Tertiary:** Text-only using the `secondary` (#6e9bff) color. Use for low-priority actions like "View Details."

### Cards & Data Modules
*   **Rule:** Forbid divider lines within cards.
*   **Layout:** Use the Spacing Scale to create "islands" of information. Group related data using a 1.5rem padding, and separate groups with a subtle background shift to `surface-container-low`.

### Input Fields
*   **Resting:** No border. Background: `surface-container-highest`.
*   **Focus:** A 1px "Ghost Border" appears at 40% opacity, and the label shifts to the `secondary` (#6e9bff) blue.
*   **Error State:** Use `error` (#ff716c) for text and a subtle `error-container` glow behind the input.

### Financial Indicators (Custom)
*   **Trend Chips:** For growth, use a `primary` tint at 10% opacity for the background and `primary` for the text/icon. 
*   **The "Pulse" Element:** For real-time updates, use a 4px circular indicator with a `primary` glow (box-shadow) to signal live data connectivity.

## 6. Do's and Don'ts

### Do:
*   **Do** embrace negative space. If a layout feels crowded, increase the padding rather than adding a border.
*   **Do** use `display-lg` typography for singular, "North Star" metrics (e.g., Total Portfolio Value).
*   **Do** use asymmetrical layouts for dashboards to distinguish between primary trackers and secondary news feeds.

### Don't:
*   **Don't** use 100% opaque borders. They create "visual noise" that cheapens the premium feel.
*   **Don't** use "Drop Shadows" on flat cards. Rely on tonal layering (Surface-Container shifts) instead.
*   **Don't** use vibrant accent colors for decorative purposes. Colors like `emerald green` and `electric blue` are reserved strictly for data-driven meaning (Growth, Action, or Flow).