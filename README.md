# Kali Marketing Agent

<p align="center">
  <img src="images/logo.png" alt="Kali Marketing Agent logo" width="140" />
</p>

> A repository of OpenClaw-style skills, prompts, and setup docs for Kali O'Campo's marketing workflows across GNB Global and The SaltHaus Group.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Status

This is a local agent kit, not a hosted app. The repo currently contains reusable skills, templates, setup docs, a bootstrap script, and a client manifest for installing the package into an OpenClaw environment.

## About

The project is designed around Kali O'Campo's real operating context: marketing and business development work for GNB Global plus consulting workflows for The SaltHaus Group. It emphasizes campaign planning, lead follow-up, social content, proposals, onboarding, and analytics support.

## Included Skills

| Skill | Purpose |
| --- | --- |
| `campaign-manager` | Campaign briefs, calendars, launch planning |
| `lead-tracker` | Lead capture and follow-up workflows |
| `social-post` | Social content drafts |
| `email-nurture` | Nurture and newsletter drafts |
| `research` | Market and competitor research |
| `canva` | Canva-backed design workflows |
| `proposals` | Proposals, case studies, and one-pagers |
| `onboarding` | Client onboarding sequences |
| `analytics` | Pipeline and campaign reporting support |
| `linkedin` | LinkedIn-specific posting and profile workflows |
| `setup` | Environment and API-key checks |

## Repository Layout

```text
kali-marketing-agent/
├── skills/       # Skill definitions, prompts, and helper scripts
├── docs/         # Planning docs, templates, and workflow notes
├── images/       # README assets
├── manifest.json # Client manifest for local installs
├── bootstrap.sh  # Copies skills and manifest into ~/.openclaw
├── SETUP.md      # Guided setup notes
└── KALI.md       # Client profile and brand context
```

## Getting Started

### Prerequisites

- macOS or Linux
- An installed OpenClaw environment
- `bash`
- `CANVA_API_TOKEN` for Canva-backed flows

### Install From Source

```bash
git clone https://github.com/tylerdotai/kali-marketing-agent.git
cd kali-marketing-agent
bash bootstrap.sh
```

The bootstrap script copies skills into `~/.openclaw/skills` and installs the client manifest into `~/.openclaw/clients`.

## Manual Setup

```bash
cp -r skills/* ~/.openclaw/skills/
openclaw config set CANVA_API_TOKEN <your-token>
```

For more detailed onboarding steps, see `SETUP.md`.

## Usage Examples

```text
Create a campaign brief for GNB Global's next weather protection push
Write 5 LinkedIn posts for Kali's construction audience
Generate a SaltHaus proposal outline for a new consulting lead
Research competitors in infrastructure marketing
```

## Supporting Docs

- `KALI.md` - client profile, brand voice, industries, and workflow context
- `SETUP.md` - installation guidance and troubleshooting
- `docs/PLAN.md` - planning notes for rollout and skill development
- `docs/SKILLS.md` - older skills inventory and status notes

## Current Limitations

- This repo does not currently contain the `apps/crm` application referenced in some planning artifacts
- Several docs are planning-oriented and may describe future integrations rather than installed-by-default behavior
- `manifest.json` should be reviewed and validated before relying on it as the only source of truth for automated installation

## License

MIT License - see `LICENSE`.
