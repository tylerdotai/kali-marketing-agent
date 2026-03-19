---
name: onboarding
description: |
  Automated client onboarding for new SaltHaus consulting clients.
  Use when: new client signed, welcome sequence, kickoff meeting, onboarding checklist.
triggers:
  - "new client"
  - "onboard"
  - "welcome"
  - "kickoff"
  - "client setup"
---

# Client Onboarding Skill

Automated onboarding flow for new SaltHaus consulting clients.

## Workflow

### Step 1: New Client Signed
When a client signs a contract or agrees to services:

```
User: New client signed - Acme Corp, Jane Smith CEO
Agent: Creates onboarding checklist, sends welcome email, sets milestones
```

### Step 2: Welcome Email (Day 0)
Send welcome email with:
- Thank you message
- What to expect next
- Kickoff meeting scheduler link
- Doc collection request

### Step 3: Kickoff Meeting (Day 1-3)
Schedule kickoff call:
- Agenda: goals, timeline, communication prefs
- Set recurring check-in cadence

### Step 4: Document Collection (Day 1-7)
Request:
- Company overview / website
- Current marketing materials
- Access to existing accounts
- Brand guidelines

### Step 5: 30-60-90 Day Milestones
Set reminders for:
- Day 30: First strategy review
- Day 60: Progress assessment
- Day 90: Results evaluation + next phase planning

## Templates

### Welcome Email
See `templates/welcome-email.md`

### Kickoff Agenda
See `templates/kickoff-agenda.md`

### Document Checklist
See `templates/doc-checklist.md`

## Reminder Setup

For each new client, create:

```
Day 0:  "📧 Send welcome email to [Client]"
Day 1:  "📅 Schedule kickoff call with [Client]"
Day 7:  "📋 Request onboarding documents from [Client]"
Day 30: "📊 30-day strategy review with [Client]"
Day 60: "📈 60-day progress check with [Client]"
Day 90: "🎯 90-day results review with [Client]"
```

## Quick Commands

| Command | Action |
|---------|--------|
| `onboard [client]` | Start full onboarding flow |
| `welcome email [client]` | Generate/send welcome email |
| `kickoff [client]` | Create kickoff agenda |
| `docs needed [client]` | Show document checklist |
| `milestones [client]` | Create 30-60-90 day reminders |
