---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for the Makabasla Ecosystem with high design quality. Use this skill when building web components, pages, or applications. Generates creative, polished code using shadcn/ui and a premium dark-metallic aesthetic.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces for the **Makabasla Ecosystem**. Implement real working code with exceptional attention to aesthetic details, utilizing **shadcn/ui** and **Lucide React** for consistency.

## Makabasla Design Thinking

Before coding, understand the context and commit to the Makabasla premium aesthetic:
- **Tone**: Premium High-Tech. A blend of deep obsidian blacks, metallic grays, and vibrant amber/gold accents. Think luxury automotive dashboard meets secure fintech.
- **Visual Language**: Heavy use of "Glassmorphism" (backdrop-blur), thin borders (`border-white/10`), and radial gradients for depth.
- **Component Strategy**: ALWAYS prefer **shadcn/ui** components when applicable. Customize them to fit the Makabasla color palette.

## Makabasla Design System

### Core Brand Palette (Defined in `frontend/app/globals.css`)
- **Background**: `#0B0B0B` — Deep obsidian canvas.
- **Foreground**: `#F5F5F5` — Crisp off-white for primary text.
- **Primary / Accent**: `#F5A623` — Vibrant Amber/Gold (#F5A623) for CTAs, highlights, and focus states.
- **Secondary / Muted**: `#1A1A1A` — Dark metallic gray for cards, sidebar, and inactive elements.
- **Surface (Glass)**: `bg-[#1A1A1A]/60 backdrop-blur-xl border border-[#CFCFCF]/10`.
- **Border**: `#CFCFCF33` — Subtle gray borders.

### Branding Elements
- **Logo**: Used extensively in headers and login pages. Source: `/home/navBar Logo.png`.
- **Typography**: Tracking should be tight (`tracking-tight`) for headings. Use `Geist Sans` (default) but ensure bold font weights for hierarchy.

## Implementation Guidelines

### 1. shadcn/ui Integration
- Use `shadcn` for structural components (Modals, Tabs, Buttons, Sheets).
- When creating new components, check if a shadcn version exists.
- Extend shadcn themes in `globals.css` or via Tailwind classes to match the Makabasla palette (specifically the amber primary color).

### 2. Motion & Effects
- Use the `animate-reveal` utility for page transitions.
- Apply `glow` (`shadow-[0_0_20px_rgba(245,166,35,0.1)]`) to primary buttons.
- Use `text-gradient` (`bg-gradient-to-br from-[#F5A623] to-[#C97A00]`) for important headlines.

### 3. Polish & Details
- **Shadows**: Use soft, large shadows for depth.
- **Borders**: Avoid harsh borders; use `white/10` or `white/5`.
- **Interactions**: Add subtle scale effects (`active:scale-95`) to interactive elements.

## Avoid "AI Slop"
NEVER use:
- Generic Inter/Arial system fonts without styling.
- Default blue/purple gradients (unless specifically requested).
- Predictable, flat, white-background "SaaS" templates.
- Solid colors without some form of texture (grain, gradient, or depth).

**IMPORTANT**: Makabasla represents security and premium quality. Every pixel should feel intentional, every transition smooth, and every color choice luxurious.
