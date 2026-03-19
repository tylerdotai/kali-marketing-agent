# Kali Marketing Agent

Personal marketing agent for Kali O'Campo - BD Manager at GNB Global Inc. and Owner at The SaltHaus Group.

## Overview

This agent is designed to assist with:
- Campaign planning and management
- Lead tracking and pipeline management
- Content creation workflows
- Social media integration (LinkedIn)
- Proposal and document generation
- Research and competitive analysis

## Skills

The agent has access to the following skill modules:

| Skill | Description |
|-------|-------------|
| lead-tracker | Lead tracking prompts and workflows |
| campaign-manager | Campaign planning and execution |
| linkedin | LinkedIn browser automation |
| setup | Initial setup and configuration |
| onboarding | Client onboarding workflows |
| analytics | Marketing analytics |
| proposals | Proposal generation |
| canva | Design integration (when available) |

## Architecture

```
kali-marketing-agent/
├── skills/              # OpenClaw skill modules
│   ├── lead-tracker/
│   ├── campaign-manager/
│   ├── linkedin/
│   └── ...
├── workflows/           # Reusable workflow templates
├── templates/           # Document and content templates
├── docs/               # Documentation
└── SKILL.md           # Main agent skill
```

## CRM

A standalone lightweight CRM is available for lead management:

**Repository:** https://codeberg.org/tylerdotai/lightweight-crm

The CRM features:
- Pipeline tracking (New → Contacted → Qualified → Proposal → Negotiation → Won)
- Activity logging (calls, emails, meetings, notes)
- Mobile-responsive design
- API-first architecture for agent automation

## Setup

1. Clone this repository
2. Install dependencies for any skills that require them
3. Configure credentials (LinkedIn, Canva, etc.)
4. Run the OpenClaw agent with the skill modules

## Client Profile

**Kali O'Campo**
- BD Manager @ GNB Global Inc. (weather protection for construction)
- Owner @ The SaltHaus Group (fractional CMO/consulting for SMBs)

**Primary Channels:**
- LinkedIn (@itsmskali)
- YouTube (@kaliocampo1014)

**Target Markets:**
- Construction companies (GNB)
- Small/mid-size businesses (SaltHaus)

## License

MIT
