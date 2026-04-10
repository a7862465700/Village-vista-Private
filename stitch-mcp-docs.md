# Google Stitch MCP — Complete Reference Guide

> Compiled from official docs and community guides (April 2026)

---

## What Is Stitch?

Google Stitch is a **free AI-powered UI design tool** from Google Labs that transforms text, images, or voice descriptions into functional UI designs with clean HTML/CSS code. It's powered by Gemini models and available at [stitch.withgoogle.com](https://stitch.withgoogle.com).

---

## Operating Modes

| Mode | Model | Quota | Best For |
|------|-------|-------|----------|
| **Standard** | Gemini 2.5 Flash / 3 | 350 generations/month | Quick layouts, brainstorming, 80% of work |
| **Experimental** | Gemini 2.5 Pro / 3 | 50 generations/month | Higher fidelity, image-to-UI, complex designs |

- Standard mode is where you spend most of your time
- Experimental produces noticeably better output but burns quota fast
- Use Experimental for image-to-UI (upload screenshots/sketches) and final polish

---

## Core Features

### Text-to-UI
Describe interfaces in plain language; Stitch generates high-fidelity designs for web, mobile, dashboards, forms, and e-commerce flows.

### Image-to-UI (Experimental Mode Only)
Upload screenshots or sketches; Stitch generates polished UIs based on visual references.

### Voice Canvas (March 2026)
Speak directly to the canvas. The AI agent listens, asks clarifying questions, provides real-time design critiques, and makes live updates.

### Vibe Design (March 2026)
Describe desired user feelings or business objectives rather than specific components.
- Example: "premium and minimalist, like Stripe's website"
- Stitch generates multiple design directions matching that vibe

### Instant Prototypes
Connect screens into interactive flows with transitions. The system auto-generates logical next screens, enabling multi-screen prototypes from prompts in minutes.

### Direct Edits
Manually tweak text, swap images, and adjust spacing without re-prompting.

---

## Prompting Best Practices

### Starting Your Project

**High-level prompts** work for brainstorming complex applications:
- "An app for marathon runners"

**Detailed prompts** yield better results for specific functionalities:
- "An app for marathon runners to engage with community, find partners, get training advice, and locate nearby races"

**Vibe Setting** — Use descriptive adjectives to establish visual direction:
- "A vibrant and encouraging fitness tracking app" influences colors, fonts, and imagery choices

### The Golden Rules

1. **Specificity wins** — "Dark mode, card-based, minimal" beats "make it look good"
2. **One change at a time** — Focus on single screens or components with one or two adjustments per prompt
3. **Use UI/UX terminology** — "navigation bar", "call-to-action button", "card layout", "hero section"
4. **Reference elements by location** — "Add a search bar to the header" or "Make the login button larger with primary blue color"
5. **Keep prompts under 5,000 characters** — Longer prompts often result in omitted components
6. **Plain language with progressive complexity** yields best results
7. **Screenshot successful iterations** for backup

### Refining Through Iteration

- State precisely what changes and how
- Target specific features individually
- Describe imagery styles to guide visual consistency
- Breaking complex designs into sequential, focused prompts prevents layout failures
- Multiple changes in one request cause regeneration of entire designs

### Theme Control

**Colors:**
- Request specific shades: "forest green", "muted gold"
- Or mood-based palettes: "warm, inviting colors"

**Typography & Styling:**
- Specify font families: "playful sans-serif" or "serif for headings"
- Specify element properties: "fully rounded button corners" or "2px solid black input borders"

### Image Modification
- Clearly identify which images: "Change background of product images on landing page to light taupe"
- Ensure imagery reflects theme changes when updating color schemes

### Language Changes
- Simple directives: "Switch all product copy and button text to Spanish"

---

## Prompt Examples

### Broad / Brainstorming
```
A luxury land sales website for Arkansas properties with warm, earthy tones
```

### Detailed / Specific
```
A homepage for a land company called Village Springs Land Co.
Dark green (#2C4A35) navbar, ivory (#F5EDD6) background.
Hero section with aerial mountain photo and serif headline.
Gold (#C9A055) accent buttons. Card-based property listings below.
```

### Vibe-Based
```
Premium and trustworthy, like a luxury real estate brand but warmer and more approachable.
Earth tones. Think Patagonia meets high-end real estate.
```

### Iterative Refinement
```
# First prompt
A property listing page with 6 cards in a grid

# Second prompt (refine)
Make the property cards wider with larger photos and add gold acreage badges in the top-right corner

# Third prompt (refine)
Add a filter bar above the grid with dropdowns for price, acreage, and status
```

---

## MCP Server Integration

### What Stitch MCP Does
The MCP wrapper enables AI coding agents (Claude Code, Cursor, Gemini CLI) to access Stitch functionality through the Model Context Protocol.

### Prerequisites
- Node.js 18+
- Google Cloud project with billing enabled
- At least one project on stitch.withgoogle.com

### Installation (Recommended — Auto Setup)
```bash
npx @_davideast/stitch-mcp init
```
This interactive wizard handles:
- gcloud CLI verification/installation
- Google authentication
- Project configuration
- API activation
- MCP client setup

### Manual Installation
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
gcloud beta services mcp enable stitch.googleapis.com --project=YOUR_PROJECT_ID
```

### Health Check
```bash
npx @_davideast/stitch-mcp doctor --verbose
```

### Claude Code Configuration
```bash
claude mcp add -e GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID -s user stitch -- npx -y @_davideast/stitch-mcp proxy
```

Verify:
```bash
claude mcp list | grep stitch
```

### Configuration for Other Platforms

| Platform | Method |
|----------|--------|
| Claude Code | `claude mcp add` command |
| Claude Desktop | `claude_desktop_config.json` |
| Cursor | Settings > MCP |
| VS Code (Copilot) | `.vscode/mcp.json` |
| Gemini CLI | `gemini mcp add` or extension |
| Windsurf | MCP settings JSON |

---

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `build_site` | Maps screens to routes, retrieves per-page HTML |
| `get_screen_code` | Fetches raw HTML/CSS for specific screens |
| `get_screen_image` | Returns screen screenshots in base64 |
| `generate_screen_from_text` | Creates new screens from text prompts |
| `list_projects` | Displays all Stitch projects |
| `list_screens` | Shows screens within a project |
| `extract_design_context` | Captures design elements (colors, fonts, layout patterns) |

### Usage Workflow Examples

**Single Prompt UI Generation:**
```
Use Stitch to build a dark mode dashboard.
Card-based layout with stats summary on top, charts below.
```
The agent calls `generate_screen_from_text`, then retrieves code via `get_screen_code`.

**Design Consistency Across Multiple Screens:**
```
Extract the design DNA from the existing dashboard screen.
Generate a new settings page matching that same style.
```

**Auto-Generate Astro Sites:**
```bash
npx @_davideast/stitch-mcp serve -p PROJECT_ID
npx @_davideast/stitch-mcp site -p PROJECT_ID
```

**Interactive Terminal Browser:**
```bash
npx @_davideast/stitch-mcp view --projects
```
Shortcuts: `c` to copy, `s` to preview HTML, `o` to open in Stitch

---

## Export Options

| Format | Details |
|--------|---------|
| **HTML/CSS** | Clean, responsive code suitable for direct use or further dev |
| **Figma** | Designs transfer with Auto Layout, editable layers, logical grouping |
| **MCP** | Pull designs directly into coding agents (Claude, Cursor, etc.) |

---

## Authentication & Troubleshooting

### Common Issues

**"API keys are not supported by this API"**
- Stitch MCP requires OAuth, NOT API keys
- Fix: Use `gcloud auth application-default login`
- The HTTP transport with `X-Goog-Api-Key` header does NOT work for Stitch

**".env File Conflicts"**
- Project-level `.env` files can cause "invalid character" errors
- Fix: Remove or rename the conflicting `.env` file

**"Permission Issues"**
- Verify Google Cloud project has billing enabled
- Verify Stitch API is activated
- Verify your account has Owner/Editor role

### Important Auth Note
Stitch MCP uses **OAuth proxy authentication**, not simple API keys. The correct setup is:
```bash
# This is the CORRECT way (OAuth proxy)
claude mcp add -e GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID -s user stitch -- npx -y @_davideast/stitch-mcp proxy

# This does NOT work (API key via HTTP)
# "type": "http", "url": "https://stitch.googleapis.com/mcp", "headers": { "X-Goog-Api-Key": "..." }
```

---

## Limitations

- No design system management or team collaboration
- HTML/CSS output only (React export coming per leaked roadmap)
- No native animation or micro-interaction design
- AI outputs vary; complex layouts may require iteration
- Mobile UI generation typically produces higher-quality results

---

## Pro Tips

1. Write specific prompts — detail beats brevity
2. Mobile UI generation typically produces higher-quality results
3. Currently free during preview period
4. Pin package versions in production: `@_davideast/stitch-mcp@0.0.5`
5. Change one major element at a time during iteration
6. Screenshot successful designs for reference
7. Use `extract_design_context` to maintain consistency across screens
8. The `@_davideast/stitch-mcp` npm package is the most stable implementation

---

## Sources

- [Stitch Prompt Guide — Google AI Developers Forum](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844)
- [Stitch MCP Setup Guide — SOTAAZ](https://www.sotaaz.com/post/stitch-mcp-guide-en)
- [Google Stitch Complete Guide — NxCode](https://www.nxcode.io/resources/news/google-stitch-complete-guide-vibe-design-2026)
- [Stitch Prompt Tutorials — stitchprompt.com](https://www.stitchprompt.com/)
- [Stitch MCP Guide — Google](https://stitch.withgoogle.com/docs/mcp/guide/)
- [Stitch + Antigravity Guide — Antigravity Codes](https://antigravity.codes/blog/google-stitch-antigravity-guide)
