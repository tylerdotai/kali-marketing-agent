# CRM Skill - Lead & Pipeline Management

## Overview

Manage leads and pipeline for sales/consulting workflows. Every action is an API call - the agent can replicate any human interaction.

**Base URL:** `http://localhost:8765/api`  
**Note:** Update host/port for remote access (e.g., `http://192.168.0.28:8765/api`)

## Data Model

### Lead Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | auto | Primary key |
| name | string | yes | Contact name |
| company | string | no | Company/organization |
| email | string | no | Email address |
| phone | string | no | Phone number |
| source | string | no | LinkedIn, Referral, Event, Website, Cold Call, Other |
| value | float | no | Estimated deal value in USD |
| stage | enum | yes | new, contacted, qualified, proposal, negotiation, won |
| notes | string | no | Free-form notes |
| archived | boolean | no | Soft delete (default: false) |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |
| last_contacted | datetime | auto | Last activity timestamp |

### Activity Types
- `call` - Phone call
- `email` - Email sent/received
- `meeting` - Meeting
- `note` - General note
- `stage_change` - Stage moved (auto-logged)

### Pipeline Stages
```
new → contacted → qualified → proposal → negotiation → won
                                                    ↘ lost (archived)
```

## API Endpoints

### Leads

#### List Leads
```
GET /api/leads
GET /api/leads?stage=qualified
GET /api/leads?search=sarah
```
Returns array of lead objects.

#### Get Lead
```
GET /api/leads/{id}
```
Returns single lead object.

#### Create Lead
```
POST /api/leads
Body: {"name": "Sarah Johnson", "company": "Acme Corp", "email": "sarah@acme.com", "value": 15000, "source": "LinkedIn", "stage": "new"}
```

#### Update Lead
```
PUT /api/leads/{id}
Body: {"name": "New Name", "value": 20000, "notes": "Updated notes"}
```
All fields optional - only provided fields are updated.

#### Delete Lead
```
DELETE /api/leads/{id}
```
Permanently deletes lead and associated activities.

### Stage Management

#### Move Lead Stage
```
POST /api/leads/{id}/stage
Body: {"stage": "qualified"}
```
Moves lead to new stage and auto-logs the stage change activity.

### Activities

#### Log Activity
```
POST /api/leads/{id}/activity
Body: {"type": "call", "description": "Discovery call - interested in enterprise plan"}
```

#### Get Lead Activities
```
GET /api/leads/{id}/activities
```
Returns activity history for a lead (most recent first).

#### Get All Activities
```
GET /api/activities?days=7
```
Returns recent activities across all leads.

### Pipeline & Stats

#### Get Pipeline
```
GET /api/pipeline
```
Returns stage counts and total values:
```json
{
  "stages": [
    {"id": "new", "name": "New", "count": 3, "value": 25000},
    {"id": "contacted", "name": "Contacted", "count": 2, "value": 45000}
  ],
  "totals": {"leads": 12, "value": 180000}
}
```

#### Get Stats
```
GET /api/stats
```
Returns summary statistics:
```json
{
  "total_leads": 12,
  "total_value": 180000,
  "won_value": 65000,
  "won_count": 3,
  "avg_deal_size": 15000,
  "conversion_rate": 0.25
}
```

### Export
```
GET /api/export
```
Returns CSV of all leads.

---

## Natural Language Commands

### Add Lead
**Command:** "Add lead: Sarah Johnson, Acme Corp, from LinkedIn, worth 15k"
```
POST /api/leads
Body: {"name": "Sarah Johnson", "company": "Acme Corp", "source": "LinkedIn", "value": 15000, "stage": "new"}
```

### Move Stage
**Command:** "Move lead #5 to qualified"
```
POST /api/leads/5/stage
Body: {"stage": "qualified"}
```

### Log Call
**Command:** "Log a call with Sarah about the proposal"
```
POST /api/leads/1/activity
Body: {"type": "call", "description": "Discussed the proposal - interested"}
```

### Show Pipeline
**Command:** "Show me all leads in proposal stage"
```
GET /api/leads?stage=proposal
```

### Search Leads
**Command:** "Find all leads from Acme Corp"
```
GET /api/leads?search=acme
```

### Get Lead Detail
**Command:** "What's the status of lead #3?"
```
GET /api/leads/3
GET /api/leads/3/activities
```

### Update Lead
**Command:** "Update lead #5 value to 25000"
```
PUT /api/leads/5
Body: {"value": 25000}
```

### Delete Lead
**Command:** "Delete lead #7"
```
DELETE /api/leads/7
```

---

## Example Flows

### Adding a New Lead from Event
```
1. POST /api/leads
   Body: {"name": "John Smith", "company": "TechCorp", "source": "Event", "stage": "new"}

2. POST /api/leads/{id}/activity
   Body: {"type": "note", "description": "Met at construction expo, interested in weather protection systems"}
```

### Following Up with Qualified Lead
```
1. POST /api/leads/{id}/stage
   Body: {"stage": "contacted"}

2. POST /api/leads/{id}/activity
   Body: {"type": "call", "description": "Discovery call - confirmed budget and timeline"}

3. POST /api/leads/{id}/stage
   Body: {"stage": "qualified"}
```

### Closing a Deal
```
1. POST /api/leads/{id}/stage
   Body: {"stage": "negotiation"}

2. POST /api/leads/{id}/activity
   Body: {"type": "meeting", "description": "Contract review meeting"}

3. POST /api/leads/{id}/stage
   Body: {"stage": "won"}

4. POST /api/leads/{id}/activity
   Body: {"type": "note", "description": "Deal closed! $45,000 annual contract"}
```

### Daily Pipeline Review
```
1. GET /api/pipeline              # Get overview of all stages
2. GET /api/leads?stage=qualified # Get qualified leads to follow up
3. GET /api/stats                # Check win rate and values
```

---

## Error Handling

- `404 Not Found` - Lead doesn't exist
- `400 Bad Request` - Invalid stage value or missing required fields
- API returns `{"success": true}` on successful create/update

---

## Tips

1. **Always log activities** - Helps track relationship history
2. **Use search** - Find leads quickly by name, company, or email
3. **Update value** - Keep deal values current for accurate forecasting
4. **Archive lost deals** - Set archived=true instead of deleting (preserves history)

---

## Host Configuration

For local use: `http://localhost:8765/api`

For remote access to Hoss (Mac mini):
- Host: `192.168.0.28`
- Port: `8765`
- URL: `http://192.168.0.28:8765/api`

Ensure server is running:
```bash
cd ~/kali-marketing-agent/apps/crm-v2/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8765
```
