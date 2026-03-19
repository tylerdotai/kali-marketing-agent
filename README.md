# CRM - Lightweight Lead & Pipeline Management

A clean, agent-first CRM built for local/offline use. Track leads through your sales pipeline with a modern, responsive interface that works on desktop and mobile.

## Features

- **Pipeline View** - Kanban-style board with drag-scroll horizontal layout
- **Lead Management** - Full CRUD with name, company, email, phone, source, value, notes
- **Activity Tracking** - Log calls, emails, meetings, and notes
- **Stage Management** - Move leads through pipeline stages
- **Analytics** - Summary stats and stage breakdown
- **Mobile Responsive** - Works on iOS, Android, and desktop
- **Agent-First** - Every action is an API call for agent automation

## Design

- Apple-inspired light theme (#FAFAFA background, #C9A96E cream accent)
- Clean typography with system fonts
- Horizontal scroll pipeline (Pipefy/Trello style)
- Slide-up detail panels on mobile
- Touch-friendly with swipe gestures

## Tech Stack

- **Backend:** Python 3 + FastAPI + SQLite
- **Frontend:** Vanilla HTML/CSS/JS (no dependencies)
- **Storage:** Local SQLite database

## Quick Start

```bash
cd apps/crm/backend
pip install -r requirements.txt
python3 -m uvicorn server:app --reload --port 8765
```

Open http://localhost:8765

## API

Base URL: `http://localhost:8765/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/leads` | GET | List all leads |
| `/leads` | POST | Create lead |
| `/leads/{id}` | GET | Get lead |
| `/leads/{id}` | PUT | Update lead |
| `/leads/{id}` | DELETE | Delete lead |
| `/leads/{id}/stage` | POST | Move stage |
| `/leads/{id}/activity` | POST | Log activity |
| `/pipeline` | GET | Pipeline stats |
| `/stats` | GET | Summary stats |

### Example

```bash
# Add a lead
curl -X POST http://localhost:8765/api/leads \
  -H "Content-Type: application/json" \
  -d '{"Name": "Sarah Johnson", "company": "Acme Corp", "value": 15000}'

# Move to qualified
curl -X POST http://localhost:8765/api/leads/1/stage \
  -H "Content-Type: application/json" \
  -d '{"stage": "qualified"}'
```

## Pipeline Stages

```
New → Contacted → Qualified → Proposal → Negotiation → Won
```

## For Agents

The CRM is designed for agent automation. Every action is accessible via API.

**Skill File:** `apps/crm/SKILL.md` - Full API documentation for OpenClaw agents.

### Example Agent Commands

```
"Add lead: John Smith, TechCorp, worth 50k"
"Move lead #3 to qualified"
"Show me all proposal stage leads"
"Log a call with Sarah about pricing"
```

## File Structure

```
apps/crm/
├── backend/
│   ├── server.py      # FastAPI server
│   ├── database.py    # SQLite operations
│   └── requirements.txt
├── frontend/
│   ├── index.html     # Main app
│   ├── styles.css      # Styles
│   └── app.js         # Application logic
└── SKILL.md           # Agent skill documentation
```

## License

MIT
