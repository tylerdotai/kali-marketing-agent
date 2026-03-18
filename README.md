# Kali's Marketing Agent

OpenClaw marketing agent setup for Kali — marketing manager, FTW DAO community member.

## Overview

This agent helps Kali manage:
- Marketing campaigns (plan → execute → track)
- Content creation (social posts, email sequences)
- Canva design generation
- Lead tracking and follow-ups
- Email nurture sequences

## Quick Start

### 1. Install OpenClaw
On Kali's MacBook:
```bash
# Download from https://openclaw.ai
# Or via Homebrew:
brew install openclaw
```

### 2. Connect Services
- [ ] Telegram bot for notifications
- [ ] Canva API token
- [ ] Gmail or iCloud email
- [ ] Apple Reminders (built-in)

### 3. Install Skills
Copy the `skills/` folder to `~/.openclaw/skills/`

### 4. Test
```
Agent: Create a test campaign brief
Agent: Add a sample lead
Agent: Generate 3 social posts for a tattoo shop
```

## Skills Available

| Skill | Purpose |
|-------|---------|
| `campaign-manager/` | Plan and execute full campaigns |
| `lead-tracker/` | Track leads through pipeline |
| `email-sequence.md` | Nurture email templates |
| `templates/social-post.md` | Social content templates |

## Workflows

See `workflows/` folder for:
- `content-creation.md` - Content pipeline
- `lead-nurturing.md` - Lead follow-up flow
- `campaign-launch.md` - Campaign checklist

## Repository Structure

```
kali-marketing-agent/
├── README.md
├── SKILLS.md
├── SETUP.md
├── campaign-manager/
│   ├── SKILL.md
│   ├── scripts/
│   │   └── campaign_builder.py
│   └── prompts/
│       ├── brief_template.md
│       └── content_calendar.md
├── lead-tracker/
│   └── SKILL.md
├── templates/
│   └── social-post.md
├── workflows/
│   ├── content-creation.md
│   ├── lead-nurturing.md
│   └── campaign-launch.md
└── email-sequence.md
```

## Support

Reach out to Tyler (@tylerdotai) for help with setup.
