---
name: frontend-design-v2.1
description: Create minimalist, focus-centric frontend interfaces for the Makabasla Ecosystem. Reject "AI slop" in favor of expert design. Prioritizes typography, whitespace, and professional "Zen" aesthetics over decorative clutter. Uses shadcn/ui and Heroicons with a Monkeytype-inspired interaction pattern. Retains obsidian/amber branding while introducing muted desaturated semantic tones.
license: Complete terms in LICENSE.txt
---

This skill guides the creation of high-performance, minimalist interfaces for the **Makabasla Ecosystem**. It rejects generic, colorful "AI-generated" clutter in favor of an opinionated, designer-centric approach that feels developed by an expert and looks designed by a senior product designer.

## Makabasla Design Thinking: The Zen-Architect

Before coding, commit to the "Monkeytype" philosophy:

- **Tone**: Professional Minimalism. A focus-driven environment where the UI disappears to let the content lead. No superfluous elements.
- **Visual Language**: Typography-first design. No unnecessary borders, shadows, or gradients. Use background shifts and low-contrast states to manage hierarchy.
- **Interaction Pattern**: Elements not in focus should fade into the background (`text-muted-foreground/40`). Active elements or specific data use the brand amber or muted semantic tones to "pop" against the obsidian canvas.

## Makabasla Design System (Zen Edition v2.1)

### Core Brand Palette

- **Background**: `#0B0B0B` — The deep obsidian void.
- **Foreground**: `#D1D0C5` — A soft, off-white (vibe-check: less harsh than pure white).
- **Primary / Accent (Branding)**: `#F5A623` — Amber/Gold, used **sparingly** for branding elements and high-priority caret/focus states.
- **Muted / Neutral UI**: `#646669` — Low-contrast gray for inactive text, secondary UI elements, and "ghost" button states on dark backgrounds.
- **Surface**: `bg-[#1A1A1A]` — Subtle background lift for cards/sections, used without borders.

### Semantic / Feedback Palette (Desaturated)

_Do NOT use vibrant or generic "Christmas Tree" red/green._

- **Destructive / Negative (Expenses/Loss)**: Muted Rose / Terracotta (e.g., `#E06C75` or `text-rose-400/80`). Used for "Delete" or "Negative Cash Flow."
- **Success / Positive (Income/Gain)**: Muted Sage / Soft Emerald (e.g., `#98C379` or `text-emerald-400/80`). Used for "Advances" or "Positive Cash Flow."

### Branding & Typography

- **Typography**:
  - **Sans (UI)**: `Geist Sans` or `Inter` for general UI/Navigation.
  - **Mono (Data)**: ALWAYS use a high-quality Monospace font (e.g., `JetBrains Mono` or `Geist Mono`) for all financial data (currency values, "Rs. 0"), IDs, counts, and metrics.
- **Tracking**: Use `tracking-tight` for headings; `tracking-widest` for small, muted labels.
- **Radius**: Strict `radius-sm` (approx 4px - 6px) for a sharp, modern professional look. Avoid "bubble" roundings.

## Implementation Guidelines

### 1. shadcn/ui Integration (Customized)

- **Variants**: Strictly default to **`variant="ghost"`** for secondary or passive actions. Use **`variant="outline"`** for major actions, where the border color matches the muted semantic tone (e.g., a rose outline for a destructive action). Solid backgrounds should be incredibly rare (reserved only for "Primary/Submit").
- **Inputs**: Remove standard borders. Use a subtle bottom border (`border-b border-muted/20`) that changes color only on focus.
- **Command Menu**: Use the shadcn `Command` (CMDK) component as the primary navigation pattern instead of bulky sidebars.

### 2. Iconography (Heroicons)

- **Style**: ALWAYS and ONLY use **Heroicons (Outline)**. Do not use solid icons.
- **Scale**: Keep icons small and consistent (`w-5 h-5` maximum, often `w-4 h-4` for labels).
- **Weight**: Set `stroke-width` strictly to `1.5` for a clean, professional, light-weight feel. Icon color should generally inherit the muted tone of the associated action.

### 3. Motion & Focus States

- **The "Fade" Effect**: Use Tailwind `transition-colors` and `duration-300`. Inactive navigation items should be low contrast (`text-muted-foreground/30`) and transition to `text-foreground` on hover.
- **Active State**: Only the current "task" or "active" element should carry the brand accent (`#F5A623`).

## Avoid "AI Slop"

NEVER use:

- **Default Red/Green/Blue**: If it looks like a bootstrap color scheme, it is rejected. All color must be desaturated and intentional.
- **Heavy Glassmorphism**: No more heavy `backdrop-blur` or complex gradients. Use flat color blocks (`bg-surface`).
- **Rounded-full**: Avoid overly rounded "bubble" elements; stay sharp and geometric (`radius-sm`).
- **Administrative Clutter**: If a screen looks like a standard Admin panel (colored sidebars, heavy borders around tables), simplify it. Remove lines. Increase whitespace (e.g., `p-12`, `gap-10`).
