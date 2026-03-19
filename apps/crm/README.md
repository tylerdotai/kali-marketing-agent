# Kali's CRM

Lightweight SQLite-based CRM for tracking leads across GNB Global and SaltHaus businesses.

## Features

- 📊 **Pipeline View** - Drag leads through stages: New → Contacted → Qualified → Proposal → Negotiation → Won/Lost
- 👥 **Lead Management** - Add, edit, delete leads with full contact info
- 📈 **Stats Dashboard** - Total leads, pipeline value, won value
- 📝 **Activity Logging** - Track emails, calls, meetings for each lead
- 🔍 **Quick Add** - Natural language lead creation
- 📱 **Responsive** - Works on desktop and mobile
- 🔒 **Private** - All data stored locally in SQLite

## Quick Start

### Option 1: Docker (Recommended)
```bash
cd apps/crm
docker-compose up -d
# Open http://localhost:8765
```

### Option 2: Local Python
```bash
cd apps/crm/backend
pip install -r requirements.txt
python server.py
# Open http://localhost:8765
```

## Screenshots

**Pipeline View:**
```
| New (3)     | Contacted (5) | Qualified (2) | Won (1) |
| John Smith  | Jane Doe     | Bob Wilson    | Alice   |
| Acme Corp   | Tech Inc     | Company X     | Corp Y  |
```

**Lead Detail:**
- Contact info, notes, estimated value
- Stage selector
- Activity log

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | GET | List all leads |
| `/api/leads` | POST | Create lead |
| `/api/leads/{id}` | GET | Get lead details |
| `/api/leads/{id}` | PUT | Update lead |
| `/api/leads/{id}` | DELETE | Delete lead |
| `/api/leads/{id}/stage` | POST | Move to stage |
| `/api/leads/{id}/activity` | POST | Log activity |
| `/api/stats` | GET | Dashboard stats |
| `/api/quick-add` | POST | Quick add lead |

## Data Storage

All data stored in `kali_crm.db` (SQLite). Database persists in the `apps/crm/` directory.

## Tech Stack

- **Backend:** FastAPI + SQLite
- **Frontend:** Vanilla HTML/CSS/JS
- **Database:** SQLite (local, no server required)

## Extending

To integrate with the OpenClaw agent:
1. Agent can call `/api/leads` to fetch leads
2. Agent can POST to `/api/quick-add` for natural language lead creation
3. Stats available at `/api/stats` for dashboards
