# Backup Status Summary
**Generated: 2026-04-10**

## Project Backup Coverage

| Project | Location | OneDrive Sync | GitHub Repo | Notes |
|---|---|---|---|---|
| **landFlow CRM** | `Desktop/landFlow` | Yes | [landflow-crm](https://github.com/a7862465700/landflow-crm.git) | Has uncommitted changes that need to be pushed |
| **Village Vista (docs/specs)** | `Desktop/Village Vist` | Yes | [Village-Vista-Private](https://github.com/a7862465700/Village-vista-Private.git) | Just created 2026-04-10. Only docs/specs are in git |
| **Hickory Street / Borrower Portal** | `Desktop/Village Vist/borrower-portal` | Yes | [borrower-portal](https://github.com/a7862465700/borrower-portal.git) | Next.js app, fully backed up |
| **village-vista** | `Desktop/Village Vist/village-vista` | Yes | Has own .git (check remote) | Sub-project, needs remote verified |
| **village-vista-v2** | `Desktop/Village Vist/village-vista-v2` | Yes | Has own .git (check remote) | Sub-project, needs remote verified |

## What's NOT on GitHub (OneDrive only)

These files are excluded from git via `.gitignore` due to size:

- `Vista Village video.mp4` (217 MB)
- `Vista Village video - narrated.mp4` (133 MB)
- `ending-card.mp4` (53 KB)
- `voiceover-matthew.mp3`
- `voiceover-thomas.mp3`
- `voiceover-thomas-part2.mp3`
- Voice preview audio files
- `hickory_street_finance.jpg`
- `vista_village_land_company_white.jpg`
- `576177721-b5ba1502-db8d-46b0-9828-478f8795c931.png`
- `ui-ux-pro-max-skill-main.zip`
- `village-vista-ai-upgrades.zip`
- Mockups folder (jpeg files)

## TODO for other Claude session

- [ ] Verify `village-vista/` and `village-vista-v2/` have GitHub remotes and are pushed
- [ ] Push landFlow uncommitted changes (modified: REQUIREMENTS.md, ROADMAP.md, STATE.md, favicon.svg, netlify.toml)
- [ ] Consider creating `Hickory Street Finance` as its own top-level desktop folder on primary computer
- [ ] Consider backing up video files to an external drive (single point of failure on OneDrive)
