---
name: Scholarly Tactile
colors:
  surface: '#17130f'
  surface-dim: '#17130f'
  surface-bright: '#3d3834'
  surface-container-lowest: '#110d0a'
  surface-container-low: '#1f1b17'
  surface-container: '#231f1b'
  surface-container-high: '#2e2925'
  surface-container-highest: '#393430'
  on-surface: '#eae1db'
  on-surface-variant: '#d4c4b7'
  inverse-surface: '#eae1db'
  inverse-on-surface: '#342f2c'
  outline: '#9c8e82'
  outline-variant: '#50453b'
  surface-tint: '#f0bd8b'
  primary: '#f2be8c'
  on-primary: '#482904'
  primary-container: '#d4a373'
  on-primary-container: '#5b3912'
  inverse-primary: '#7d562d'
  secondary: '#bccbb1'
  on-secondary: '#273422'
  secondary-container: '#3d4b37'
  on-secondary-container: '#aabaa0'
  tertiary: '#b0ccdb'
  on-tertiary: '#18343f'
  tertiary-container: '#95b1bf'
  on-tertiary-container: '#294450'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbd'
  primary-fixed-dim: '#f0bd8b'
  on-primary-fixed: '#2c1600'
  on-primary-fixed-variant: '#623f18'
  secondary-fixed: '#d8e7cc'
  secondary-fixed-dim: '#bccbb1'
  on-secondary-fixed: '#121f0e'
  on-secondary-fixed-variant: '#3d4b37'
  tertiary-fixed: '#cae7f6'
  tertiary-fixed-dim: '#aecbda'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#2f4a57'
  background: '#17130f'
  on-background: '#eae1db'
  surface-variant: '#393430'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Literata
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  note-sm:
    fontFamily: Caveat
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  notebook-line-height: 32px
---

## Brand & Style

This design system moves away from digital abstraction toward a grounded, physical academic environment. The brand personality is studious, organized, and intentional, designed for researchers, students, and educators who value focus over flash. 

The aesthetic is a blend of **Minimalism** and **Tactile Modernism**. It prioritizes high legibility and structural clarity through flat color fields and deliberate layering. By utilizing a "dark mode" foundation that mimics graphite and ink, the interface feels like a high-end physical planner. The emotional response should be one of quiet productivity and intellectual calm, avoiding the frenetic energy of typical productivity tools.

## Colors

The palette is rooted in a deep, desaturated environment to reduce eye strain during long sessions of deep work. 

- **Background & Surface:** We use a deep graphite (#1A1C1E) for the main canvas, with cards and elevated containers set in a slightly lighter ink-blue gray (#24282D). This provides enough contrast to define structure without needing borders.
- **Accents:** The Primary Muted Ochre (#D4A373) is reserved for the highest level of hierarchy, such as primary action buttons and active navigation states. The Muted Sage (#8B9A82) acts as a functional color for completion and success, while the Ink Blue (#4A6572) provides a soft tertiary highlight for secondary focus areas.
- **Typography:** Text is strictly off-white (#E2E2E2) to avoid the harsh glare of pure white. Secondary text is carefully balanced at #B0B3B8 to maintain WCAG AA accessibility while establishing a clear visual hierarchy.

## Typography

The typography strategy pairs a scholarly serif with a highly legible sans-serif, punctuated by a human touch.

- **Headlines:** Literata provides a bookish, authoritative feel that signals academic rigor. It is used for all major section headers and titles.
- **Body:** Source Sans 3 is used for all functional text, descriptions, and data. It is chosen for its clarity and neutral character.
- **The "Human" Layer:** Caveat is used sparingly for small annotations, "post-it" style notes, or day labels. This adds a tactile, handwritten quality that breaks the rigidity of the grid.
- **Hierarchy:** Use all-caps labels for metadata and secondary headers to differentiate them from body copy without increasing weight significantly.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop (12 columns) and a fluid single-column layout on mobile. 

- **Signature Element:** Behind list-heavy areas (like schedules or bibliographies), a subtle horizontal rule texture is applied. These lines are spaced at 32px intervals with a very low opacity (5% of the primary text color), mimicking a ruled notebook.
- **Rhythm:** Spacing follows an 8px base unit. Margins are generous to allow the content to "breathe," reinforcing the feeling of a focused workspace.
- **Breakpoints:**
  - **Desktop (1200px+):** 12 columns, 24px gutters, max-width 1440px.
  - **Tablet (768px - 1199px):** 8 columns, 16px gutters.
  - **Mobile (Up to 767px):** 4 columns, 16px margins.

## Elevation & Depth

Hierarchy is achieved through a "Stacked Paper" metaphor. Instead of light-source-driven shadows, the system uses a dual-shadow approach to create a physical presence:

- **Ambient Shadow:** A wide, soft shadow (24px to 40px blur) at low opacity (15% black) to lift the card from the background.
- **Contact Shadow:** A tight, darker shadow (4px to 8px blur) at 30% opacity directly beneath the element to "anchor" it to the surface.
- **Layering:** Components do not use gradients. Depth is strictly defined by the transition from the Background (#1A1C1E) to the Surface (#24282D).
- **Icons:** Use clean, monolinear icons. Depth in iconography is achieved by varying stroke weights or using "break-out" lines rather than fills or glows.

## Shapes

The shape language is **Soft (Level 1)**. This subtle rounding (4px for standard elements, 8px for cards) removes the clinical sharpness of a purely digital tool while maintaining a disciplined, professional appearance. 

- **Buttons:** Use the 4px (0.25rem) radius for a sturdy, rectangular look.
- **Cards:** Use the 8px (0.5rem) radius for containers.
- **Post-it Elements:** When using the handwritten font for notes, the background container may have a slightly larger radius (12px) or a slightly irregular corner to emphasize the "non-digital" nature of the annotation.

## Components

- **Buttons:** Primary buttons use the Muted Ochre (#D4A373) with dark text. They are flat, with no gradients or inner glows. Secondary buttons use the Ink Blue (#4A6572) as a subtle outline or text-only link.
- **Lists:** List items are separated by the "ruled notebook" lines rather than heavy dividers. Active list items are highlighted with a small Ochre vertical bar on the left edge.
- **Cards:** These are the primary organizational unit. They use the Surface color (#24282D) and the dual-shadow elevation system.
- **Inputs:** Text fields should look like "underlined" entries or soft-boxed areas. Focus states are indicated by the Ochre color appearing in the border or underline, never a glow.
- **Chips/Labels:** These use the Muted Sage (#8B9A82) for "completed" or "published" statuses, and the Ink Blue (#4A6572) for general categorization.
- **Post-it Notes:** Small, slightly rotated containers using the Surface color but with a distinctive Ochre top-border, utilizing the `note-sm` (Caveat) typeface for personal reflections or reminders.