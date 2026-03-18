---
name: campaign-manager
description: |
  Plan, execute, and track marketing campaigns from brief to completion.
  Use when: creating campaigns, planning launches, marketing briefs, product announcements.
triggers:
  - "create campaign"
  - "plan a launch"
  - "marketing campaign"
  - "campaign brief"
  - "product launch"
---


# Campaign Manager Skill

## Purpose
Plan, execute, and track marketing campaigns from brief to completion.

## Triggers
- "create campaign"
- "plan a launch"
- "marketing campaign"
- "campaign brief"
- "product launch"

## What It Does

### 1. Campaign Brief Parser
Takes a campaign idea and extracts:
- Target audience
- Key messaging
- Channels (social, email, etc.)
- Timeline
- Success metrics

### 2. Content Calendar Generator
Creates a content calendar with:
- Post topics per day/week
- Platform assignments
- Optimal posting times
- Content formats (image, video, carousel)

### 3. Asset Checklist
Lists required creative assets:
- Social graphics (via Canva)
- Email headers
- Landing pages
- Promo videos

### 4. Campaign Tracker
Sets up Reminders for:
- Milestone dates
- Content deadlines
- Review points
- Launch day

## Usage

```
User: Create a campaign for our tattoo shop reopening next month

Agent:
1. Generates campaign brief with timeline
2. Creates content calendar (4 weeks)
3. Sets up Reminders for each milestone
4. Lists required Canva designs
5. Drafts email announcement sequence
```

## Files

- `scripts/campaign_builder.py` - Core campaign generation logic
- `prompts/brief_template.md` - Campaign brief structure
- `prompts/content_calendar.md` - Content calendar generator

## Dependencies

### Required
- Apple Reminders (for task tracking)
- Web search (for research)

### Optional
- Canva MCP (for design generation)
- Gmail/iCloud email (for newsletters)

## Setup

```bash
# Kali's MacBook - nothing to install, uses built-in tools
# Just ensure OpenClaw has access to:
# - Apple Reminders
# - Web search
```

## Tips

- Start campaigns 4 weeks before launch
- Break big campaigns into weekly sprints
- Use Reminders for accountability
- Review metrics weekly
