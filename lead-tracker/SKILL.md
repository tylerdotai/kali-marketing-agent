# Lead Tracker Skill

## Purpose
Track leads through pipeline stages using Apple Reminders and Notes.

## Trigger Phrases
- "new lead"
- "add lead"
- "track lead"
- "lead pipeline"
- "follow up with"
- "lead status"

## Pipeline Stages

```
NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
```

## Usage

### Add a New Lead
```
User: New lead from FTW DAO - Kali, does marketing for a crypto startup
Agent: Creates reminder with lead details, sets initial follow-up
```

### Update Lead Status
```
User: Kali moved to qualified
Agent: Updates lead, sets next step reminder
```

### Show Pipeline
```
User: Show my leads
Agent: Lists all leads with status and next action
```

## Lead Card Format

```markdown
## Lead: [Name]

**Company:** [Company]
**Role:** [Title]
**Source:** [How they found you]
**Contact:** [Email/Phone/Social]

**Status:** 🟡 CONTACTED
**Last Contact:** 2026-03-18
**Next Action:** Send proposal email

**Notes:**
- [Key info about their needs]
- [Budget/timeline]
- [Pain points]
```

## Reminder Structure

When adding a lead, create reminders for:
1. **Initial follow-up** (same day or next)
2. **Check-in** (3-5 days later)
3. **Stale lead alert** (14 days no contact)

## Quick Commands

- "leads" → Show all active leads
- "add [name] lead" → Quick add new lead
- "[name] status [stage]" → Update stage
- "[name] note [text]" → Add note
- "[name] done" → Archive/mark as closed

## Integration

### With Email
- Log email exchanges as notes
- Set reminders from email threads

### With Calendar
- Link follow-up meetings to lead cards
- Schedule discovery calls

### With Campaign Manager
- New leads → add to nurture sequence
- Campaign responses → flag as hot leads
