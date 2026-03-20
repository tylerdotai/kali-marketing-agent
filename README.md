# Kali Marketing Agent

<p align="center">
  <img src="images/kali-logo.png" alt="Kali O'Campo" width="150"/>
</p>

> Personal marketing agent for Kali O'Campo — BD Manager at GNB Global Inc. & Owner of The SaltHaus Group.

[![OpenClaw](https://img.shields.io/badge/-OpenClaw-FF6B35?style=flat-square&logo=claw-machine&logoColor=white)](https://openclaw.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Table of Contents

- [About](#about)
- [Client Profile](#client-profile)
- [Skills](#skills)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Architecture](#architecture)
- [Apps](#apps)
- [Documentation](#documentation)
- [License](#license)
- [Contact](#contact)

---

## About

Kali Marketing Agent is an OpenClaw-based personal AI agent designed to handle marketing operations for Kali O'Campo. It automates campaign management, lead tracking, social media content creation, email nurturing, and business development workflows.

Built with a skill-based architecture, each module handles a specific domain and can be triggered by natural language commands.

---

## Client Profile

### Kali O'Campo

**Primary Role:** Business Development Manager @ [GNB Global Inc.](https://gnbglobal.com)

Weather enclosure systems that protect construction crews, equipment, and materials from rain, wind (up to 150mph), snow, and extreme temperatures.

**Side Business:** Owner @ [The SaltHaus Group](https://example.com)

Strategic consulting, tailored services, and curated products across infrastructure, energy, and purpose-driven industries.

### Industries
- Construction & Weather Protection
- Infrastructure & Mission Critical
- Energy & Renewables
- SMB Consulting

### Channels
| Platform | Handle |
|----------|--------|
| LinkedIn | [@itsmskali](https://linkedin.com/in/itsmskali) |
| YouTube | [@kaliocampo1014](https://youtube.com/@kaliocampo1014) |

---

## Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| **campaign-manager** | Plan and execute full marketing campaigns | `campaign`, `launch`, `marketing plan`, `brief` |
| **lead-tracker** | Track leads through pipeline stages | `lead`, `pipeline`, `follow up`, `prospect` |
| **social-post** | Generate platform-specific social media content | `social post`, `instagram`, `linkedin`, `caption` |
| **email-nurture** | Build email nurture sequences and newsletters | `email sequence`, `newsletter`, `nurture` |
| **research** | Research competitors, trends, and industry news | `research`, `competitor`, `market trends` |
| **canva** | Generate marketing designs via Canva MCP | `canva`, `design`, `graphic`, `visual` |
| **proposals** | Generate proposals, case studies, and SOWs | `proposal`, `case study`, `pricing`, `quote` |
| **onboarding** | Automated client onboarding for SaltHaus | `new client`, `onboard`, `welcome`, `kickoff` |
| **analytics** | Campaign performance and pipeline analytics | `analytics`, `report`, `stats`, `dashboard` |
| **linkedin** | LinkedIn profile management and content posting | `linkedin`, `post to linkedin` |

---

## Getting Started

### Prerequisites

- macOS / Linux with bash
- [OpenClaw](https://openclaw.ai/) installed
- Canva API token
- Apple Reminders (for task management)

### Installation

1. Clone the repository:
```bash
git clone ssh://git@codeberg.org:tylerdotai/kali-marketing-agent.git
cd kali-marketing-agent
```

2. Run the bootstrap script:
```bash
bash bootstrap.sh
```

3. Configure your API keys when prompted:
   - `CANVA_API_TOKEN` — Canva API token for design generation

### Manual Setup

If you prefer manual installation:

```bash
# Install skills manually
cp -r skills/* ~/.openclaw/skills/

# Add Canva MCP server
mcporter server add canva --type npm --package @iflow-mcp/mattcoatsworth-canva-mcp-server --auth CANVA_API_TOKEN=<token>
```

---

## Usage

Once configured, interact with the agent using natural language:

### Campaign Management
```
"Plan a campaign for GNB Global's new weather enclosure product launch"
"Create a marketing brief for Q2 initiatives"
```

### Lead Tracking
```
"Track this new lead through the pipeline"
"Show me all leads in the qualified stage"
"Follow up with the leads I emailed last week"
```

### Social Media
```
"Write a LinkedIn post about construction weather protection"
"Create an Instagram caption for a GNB case study"
"Generate a week's worth of social content"
```

### Email Nurture
```
"Build an email sequence for new SaltHaus leads"
"Send a follow up to everyone who downloaded the GNB one-pager"
```

### Proposals & Docs
```
"Create a case study for GNB Global"
"Generate a proposal template for SaltHaus consulting"
"Make a one-pager for the weather protection product"
```

### Research
```
"Research competitors in construction weather protection"
"What's trending in infrastructure marketing this week?"
```

---

## Architecture

```
kali-marketing-agent/
├── skills/              # OpenClaw skill modules
│   ├── campaign-manager/
│   ├── lead-tracker/
│   ├── social-post/
│   ├── email-nurture/
│   ├── research/
│   ├── canva/
│   ├── proposals/
│   ├── onboarding/
│   ├── analytics/
│   └── linkedin/
├── workflows/           # Reusable workflow templates
├── templates/           # Document and content templates
├── apps/
│   └── crm/            # Lightweight CRM (kali-crm)
├── docs/               # Documentation
├── images/             # Brand assets
├── manifest.json        # Agent manifest
├── bootstrap.sh         # Installation script
├── SETUP.md            # Detailed setup guide
└── KALI.md             # Client profile
```

### Skill Dependencies

```
campaign-manager     → apple-reminders, (canva)
lead-tracker         → apple-reminders, (gmail, icloud-email)
social-post          → canva
email-nurture        → icloud-email, (gmail)
canva               → canva-mcp-server
proposals           → canva
onboarding          → icloud-email, apple-reminders
analytics           → kali-crm
linkedin            → browser
research            → (standalone)
```

---

## Apps

### Kali CRM

Lightweight CRM for lead management and pipeline tracking.

```bash
# Start the CRM
cd apps/crm/backend
pip install -r requirements.txt
python server.py

# Access at http://localhost:8765
```

Or with Docker:

```bash
cd apps/crm
docker-compose up -d
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [KALI.md](KALI.md) | Full client profile — background, industries, workflows |
| [SETUP.md](SETUP.md) | Detailed installation and configuration guide |
| [manifest.json](manifest.json) | OpenClaw agent manifest with skills and MCP servers |

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Contact

**Kali O'Campo** — [@itsmskali](https://linkedin.com/in/itsmskali)

**Agent Built by:** Tyler Delano — [@tylerdotai](https://x.com/tylerdotai)

**Project Link:** [https://github.com/tylerdotai/kali-marketing-agent](https://github.com/tylerdotai/kali-marketing-agent)

---

*Built with OpenClaw — the AI agent framework for marketers.*
