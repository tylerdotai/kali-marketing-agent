# Kali's Marketing Agent - Setup Plan

## Overview
- **User:** Kali (marketing manager)
- **Platform:** MacBook (local OpenClaw install)
- **Primary Tools:** Canva (design), Email, Social Media
- **Goal:** Automate marketing campaigns, content creation, lead tracking

---

## Phase 1: Core Agent Setup

### 1.1 OpenClaw Installation (Kali's MacBook)
```
- Download OpenClaw for macOS
- Initial setup with Telegram bridge (for notifications)
- Install skills: Canva MCP, Gmail/email, web search, brainstorming
```

### 1.2 Skills to Install
| Skill | Purpose |
|-------|---------|
| **Canva MCP** | Connect to Canva account for graphic creation |
| **Gmail/iCloud email** | Send/receive marketing emails |
| **Brainstorming** | Campaign ideation, content planning |
| **Web search** | Competitor research, market trends |
| **LinkedIn** | Social posting, network outreach |
| **Launch checklist** | Campaign rollouts, product launches |

---

## Phase 2: Marketing Workflows

### 2.1 Content Creation Pipeline
```
Idea → Draft → Design (Canva) → Review → Publish
```

**Automated Steps:**
- Agent generates content outlines from brief
- Canva integration creates visuals
- Draft email/newsletter versions
- Schedule to Apple Reminders/Calendar

### 2.2 Lead Nurturing Sequence
```
New Lead → Welcome Email → Follow-up Sequence → Conversion Track
```

**Tools:** Gmail + Reminders + Web search for intel on leads

### 2.3 Campaign Tracking
| Stage | Tool |
|-------|------|
| Planning | Apple Reminders (Lists) |
| Content Calendar | Built-in Notes/Calendar |
| Analytics Review | Web search + manual input |
| Reporting | Agent-generated summaries |

---

## Phase 3: MCP Server Connections

### Required API Access
- [ ] Canva API token
- [ ] Gmail/Google Workspace (or iCloud email)
- [ ] LinkedIn access
- [ ] Any CRM (Notion, Airtable, HubSpot)

### Optional Enhancements
- **Image generation** via OpenAI/DALL-E or local Stable Diffusion
- **Tweet scheduling** via Buffer/Hootsuite MCP
- **SEO research** via SearXNG or SEMrush

---

## Phase 4: Skills Development

### Custom Skills to Build
1. **canva-design** — Wrapper for Canva MCP operations
2. **campaign-tracker** — Track leads through pipeline stages
3. **content-generator** — AI-powered marketing copy
4. **email-sequence-builder** — Pre-built nurture sequences
5. **competitor-monitor** — Track competitor social/website changes

### Skill Structure
```
~/.openclaw/skills/marketing-agent/
├── SKILL.md
├── scripts/
│   ├── canva_wrapper.py
│   ├── email_sequence.py
│   └── lead_tracker.py
└── prompts/
    ├── campaign_generator.md
    └── social_post_template.md
```

---

## Phase 5: Implementation Timeline

### Week 1: Foundation
- [ ] Kali installs OpenClaw
- [ ] Connect Canva account
- [ ] Set up email
- [ ] Test basic content generation

### Week 2: Automation
- [ ] Build lead tracking system
- [ ] Create email templates
- [ ] Set up reminder/calendar integration
- [ ] Test brainstorming sessions

### Week 3: Full Pipeline
- [ ] End-to-end campaign test
- [ ] LinkedIn integration
- [ ] Analytics/reporting setup
- [ ] Documentation for Kali

### Week 4: Polish
- [ ] Optimize prompts
- [ ] Build custom skills
- [ ] Create runbooks
- [ ] Train on edge cases

---

## Tech Stack Summary

| Component | Choice |
|-----------|--------|
| Agent Host | Kali's MacBook (local) |
| Design | Canva MCP |
| Email | Gmail API / iCloud |
| Scheduling | Apple Reminders/Calendar |
| CRM | Notion or Airtable |
| Social | LinkedIn MCP |
| Research | Web search |
| Storage | Local + Codeberg repo |

---

## Next Steps

1. **Kali downloads OpenClaw** → https://openclaw.ai
2. **Generates API tokens** for Canva, Gmail
3. **Creates Codeberg account** (if needed) and shares repo access
4. **Schedule onboarding call** with Tyler

---

## Repo Structure
```
kali-marketing-agent/
├── README.md
├── SKILLS.md
├── workflows/
│   ├── content-creation.md
│   ├── lead-nurturing.md
│   └── campaign-launch.md
├── templates/
│   ├── email-sequence.md
│   ├── social-post.md
│   └── campaign-brief.md
└── docs/
    ├── setup-guide.md
    └── user-guide.md
```
