---
name: ui-ux-pro-max
description: Proporciona inteligencia de diseño avanzada para construir interfaces de usuario y experiencias profesionales. Se activa automáticamente al solicitar tareas de UI/UX.
---

# UI UX Pro Max Skill

## Goal
Elevar el diseño visual de las interfaces generadas, asegurando que cumplan con estándares modernos, accesibilidad (WCAG AA), y sistemas de diseño profesionales.

## Style & Layout Guidelines
- **Spacing:** Usar estrictamente una escala basada en 8pt (4px, 8px, 16px, 24px, 32px, 64px).
- **Color Palettes:** Usar colores armónicos. Para Tailwind CSS, favorecer paletas balanceadas como `slate`, `zinc` o `neutral`. No usar gradientes excesivos ni colores saturados por defecto.
- **Micro-interacciones:** Todos los elementos interactivos (botones, enlaces, inputs) DEBEN tener definidos sus estados `hover`, `focus-visible` y `disabled`.
- **Typography:** Usar una jerarquía visual clara con un máximo de dos fuentes (una para títulos, otra para lectura).
- **Dark Mode:** Cuando se solicite modo oscuro, usar fondos suaves como `#09090b` (Tailwind Zinc-950) o `#121212` en lugar de negro puro `#000`.

## Constraints
- NO generar diseños planos sin profundidad visual ni bordes suaves (`rounded-lg` o `rounded-xl`).
- NO utilizar contrastes de texto bajos que dificulten la lectura.
- NO construir layouts complejos sin usar Grid o Flexbox correctamente alineados.
'@ | Out-File -FilePath ".agent\skills\ui-ux-pro-max\SKILL.md" -Encoding utf8