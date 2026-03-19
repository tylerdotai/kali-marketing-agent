# CRM V2 - Specification

## Overview

Lightweight, agent-first CRM for tracking leads through a sales pipeline. Built for local/offline use with an API-first architecture where every action is accessible via REST API.

**Target Users:**
- Solo sales professionals
- Small business owners
- Anyone who wants full control of their data without cloud dependencies

**Design Inspiration:** Apple - clean, minimal, functional

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FAFAFA` | Main background (near-white) |
| `--bg-secondary` | `#F5F5F7` | Card backgrounds, alternating rows |
| `--bg-tertiary` | `#E8E8ED` | Hover states, borders |
| `--border` | `#D2D2D7` | Borders, dividers |
| `--text-primary` | `#1D1D1F` | Headlines, primary text |
| `--text-secondary` | `#6E6E73` | Secondary text, labels |
| `--text-muted` | `#AEAEB2` | Placeholders, hints |
| `--accent` | `#C9A96E` | Cream accent (CTAs, highlights) |
| `--accent-hover` | `#B8956A` | Accent hover state |
| `--success` | `#34C759` | Won deals, positive actions |
| `--warning` | `#FF9500` | Proposals, attention needed |
| `--danger` | `#FF3B30` | Lost deals, destructive actions |

### Typography

- **Font Family:** SF Pro Display (system), fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Monospace:** SF Mono, "JetBrains Mono", Menlo, monospace (for values/numbers)
- **Scale:**
  - Header: 28px / 700 weight
  - Section: 20px / 600 weight
  - Body: 15px / 400 weight
  - Caption: 13px / 400 weight
  - Small: 11px / 400 weight

### Spacing

- Base unit: 4px
- Common spacings: 4, 8, 12, 16, 24, 32, 48px
- Card padding: 16px
- Column gap: 12px
- Stage padding: 12px

### Border Radius

- Small: 6px (buttons, inputs)
- Medium: 10px (cards)
- Large: 14px (modals)

### Shadows

- Subtle: `0 1px 2px rgba(0,0,0,0.04)`
- Card: `0 2px 8px rgba(0,0,0,0.06)`
- Modal: `0 8px 32px rgba(0,0,0,0.12)`

---

## Pipeline Stages

```
New → Contacted → Qualified → Proposal → Negotiation → Won
                                                    ↘ Lost (archived, hidden by default)
```

| Stage | Color | Description |
|-------|-------|-------------|
| New | `#6E6E73` (gray) | Freshly added, no contact yet |
| Contacted | `#007AFF` (blue) | Initial outreach completed |
| Qualified | `#AF52DE` (purple) | Confirmed interest, budget, authority |
| Proposal | `#FF9500` (orange) | Proposal/quote sent |
| Negotiation | `#FFD60A` (yellow) | Active negotiation |
| Won | `#34C759` (green) | Deal closed |
| Lost | `#FF3B30` (red) | Lost deal (archived) |

---

## Data Model

### Lead

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | auto | Primary key |
| name | string | yes | Contact name |
| company | string | no | Company/organization |
| email | string | no | Email address |
| phone | string | no | Phone number |
| source | string | no | Lead source (LinkedIn, Referral, Event, Website, Cold Call, Other) |
| value | float | no | Estimated deal value in USD |
| stage | enum | yes | Current pipeline stage |
| notes | text | no | Free-form notes |
| archived | boolean | no | Soft delete (for Lost leads) |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |
| last_contacted | datetime | auto | Last activity timestamp |

### Activity

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| lead_id | integer | Foreign key to Lead |
| type | enum | call, email, meeting, note, stage_change |
| description | string | Activity details |
| created_at | datetime | When activity occurred |

---

## API Endpoints

Base URL: `http://localhost:8765/api`

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List all leads (supports `?stage=X&search=Y&archived=0`) |
| GET | `/leads/{id}` | Get single lead |
| POST | `/leads` | Create new lead |
| PUT | `/leads/{id}` | Update lead |
| DELETE | `/leads/{id}` | Delete lead permanently |
| POST | `/leads/{id}/stage` | Move lead to new stage (body: `{stage: "qualified"}`) |
| POST | `/leads/{id}/activity` | Log activity (body: `{type: "call", description: "..."}`) |
| GET | `/leads/{id}/activities` | Get lead's activity history |

### Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pipeline` | Get pipeline view with counts and totals per stage |
| GET | `/stats` | Get summary statistics |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get recent activities across all leads |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export` | Export all leads as CSV |

---

## API Response Shapes

### Lead Object
```json
{
  "id": 1,
  "name": "Sarah Johnson",
  "company": "Acme Corp",
  "email": "sarah@acme.com",
  "phone": "+1 555-0123",
  "source": "LinkedIn",
  "value": 15000,
  "stage": "qualified",
  "notes": "Interested in enterprise plan",
  "archived": false,
  "created_at": "2026-03-18T10:30:00Z",
  "updated_at": "2026-03-18T14:22:00Z",
  "last_contacted": "2026-03-18T14:20:00Z"
}
```

### Pipeline Response
```json
{
  "stages": [
    { "id": "new", "name": "New", "count": 3, "value": 25000 },
    { "id": "contacted", "name": "Contacted", "count": 2, "value": 45000 },
    ...
  ],
  "totals": {
    "leads": 12,
    "value": 180000
  }
}
```

### Stats Response
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

---

## UI Layout

### Desktop (>= 1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]  Pipeline   Analytics                      [+ New Lead]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ NEW (3) ────┐  ┌─ CONTACTED (2) ─┐  ┌─ QUALIFIED (1) ──┐ │
│  │               │  │                  │  │                  │ │
│  │  Sarah J.     │  │  Mike C.         │  │  Lisa P.         │ │
│  │  Acme Corp    │  │  TechStart       │  │  GlobalCo        │ │
│  │  $15,000      │  │  $8,500          │  │  $45,000         │ │
│  │               │  │                  │  │                  │ │
│  │  [email][call]│  │  [email][call]   │  │  [email][call]   │ │
│  └───────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                    │
│  ┌─ PROPOSAL (2) ─┐  ┌─ NEGOTIATION (1) ─┐  ┌─ WON (3) ──────┐  │
│  │                │  │                    │  │                │ │
│  │  ...           │  │  ...                │  │  ...           │ │
│  └────────────────┘  └────────────────────┘  └────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

- Horizontal scrollable pipeline
- Fixed header with navigation
- Cards are fixed height, scrollable column if overflow

### Mobile (< 768px)

```
┌──────────────────────┐
│ Pipeline     [🔍][+] │
├──────────────────────┤
│                      │
│  ◀  NEW (3)  ▶      │
│                      │
│  ┌──────────────────┐│
│  │ Sarah Johnson    ││
│  │ Acme Corp       ││
│  │ $15,000         ││
│  │                  ││
│  │ [Email][Call][⋯]││
│  └──────────────────┘│
│                      │
│  ┌──────────────────┐│
│  │ Mike Chen       ││
│  │ TechStart       ││
│  │ $8,500          ││
│  │                  ││
│  │ [Email][Call][⋯]││
│  └──────────────────┘│
│                      │
│  ← swipe →           │
│                      │
└──────────────────────┘
```

- Single column view, swipe left/right between stages
- Bottom navigation dots indicate stage position
- Pull-to-refresh
- Tap card for quick-view slide-up

---

## Card Design

### Lead Card (Compact)
```
┌─────────────────────────┐
│ Sarah Johnson      ▶    │  ← Name + chevron
│ Acme Corp               │  ← Company
│ $15,000                 │  ← Value (monospace)
│                          │
│ [Email] [Call] [More]   │  ← Quick actions
└─────────────────────────┘
```

- Height: ~120px
- Tap anywhere opens full detail
- Quick actions: Email (opens mailto:), Call (opens tel:), More (opens detail)
- Value in monospace font, right-aligned or highlighted

### Lead Detail (Slide-up Panel)
```
┌────────────────────────────────┐
│  Sarah Johnson           [✕]   │
├────────────────────────────────┤
│  Acme Corp                     │
│  sarah@acme.com | +1 555-0123 │
│                                │
│  Lead Source: LinkedIn         │
│  Deal Value: $15,000           │
│  Stage: [Qualified ▼]          │
│  Last Contact: 2 hours ago     │
│                                │
├────────────────────────────────┤
│  Notes                         │
│  ┌────────────────────────────┐│
│  │ Interested in enterprise   ││
│  │ plan. Follow up next week ││
│  └────────────────────────────┘│
│                                │
├────────────────────────────────┤
│  Activities                     │
│  ┌────────────────────────────┐│
│  │ 📞 Call - 2h ago          ││
│  │    Discovery call          ││
│  │ 📧 Email - 1d ago          ││
│  │    Sent proposal           ││
│  │ ✓ Stage - 2d ago           ││
│  │    Moved to Qualified      ││
│  └────────────────────────────┘│
│                                │
│  [+ Log Activity]              │
└────────────────────────────────┘
```

- Slide-up from bottom (mobile) or side panel (desktop)
- Edit inline fields
- Activity timeline
- Stage selector dropdown
- Quick actions prominent

---

## Key Features

### 1. Pipeline View
- Horizontal scroll on desktop, swipe on mobile
- Each stage shows count badge and total value
- Empty stages show placeholder message
- Cards sorted by value (highest first) or recency

### 2. Lead Search
- Search bar in header
- Searches name, company, email, notes
- Real-time filtering (debounced 300ms)
- Clear button when search active

### 3. Quick Add
- "+ New Lead" button in header
- Opens modal/form with required fields
- Stage defaults to "New"
- Auto-focuses name field on open

### 4. Activity Logging
- Log from lead detail: call, email, meeting, note
- Optional description field
- Timestamp auto-recorded
- Quick-log buttons on card hover

### 5. Stage Movement
- Drag and drop on desktop
- Tap → detail → change stage dropdown
- Swipe left/right on card (mobile)
- Confirmation for Won/Lost

### 6. Analytics View
- Summary cards: Total leads, Pipeline value, Won value, Win rate
- Stage breakdown chart
- Lead source breakdown
- Activity timeline

### 7. Agent-First Design
- Every action is an API call
- skill.md documents all endpoints
- Agent can replicate any human action
- No client-side state that isn't synced to server

---

## Mobile Optimizations

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: >= 1024px

### Touch Targets
- Minimum 44x44px for all interactive elements
- Generous padding on buttons (min 12px vertical)

### Swipe Gestures
- Swipe left on card: Archive/Delete options
- Swipe right on card: Quick stage move
- Horizontal swipe between pipeline stages on mobile

### Pull to Refresh
- Standard iOS/Android pull-to-refresh on mobile
- Refreshes all data from API

### Viewport
- Proper viewport meta tag
- No horizontal overflow
- Smooth scrolling

---

## Technical Stack

### Backend
- **Language:** Python 3
- **Framework:** FastAPI
- **Database:** SQLite (file-based, portable)
- **ORM:** Raw SQL (lightweight, no dependencies)

### Frontend
- **Structure:** Single HTML file (or minimal multi-page)
- **Styling:** Vanilla CSS with CSS variables
- **JavaScript:** Vanilla JS (no framework)
- **Icons:** Inline SVGs (no external dependencies)

### File Structure
```
crm/
├── backend/
│   ├── server.py        # FastAPI app
│   ├── database.py      # SQLite operations
│   ├── models.py        # Data models
│   ├── requirements.txt  # Dependencies
│   └── test_api.py      # API tests
├── frontend/
│   ├── index.html       # Main app
│   ├── styles.css       # All styles
│   └── app.js           # All JS
├── data/
│   └── crm.db          # SQLite database
└── README.md
```

---

## Running the App

### Start Backend
```bash
cd crm/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8765
```

### Access
- **Web UI:** http://localhost:8765
- **API:** http://localhost:8765/api
- **API Docs:** http://localhost:8765/docs

---

## Open Questions / Future Enhancements

1. **Multi-user support** - Add user auth if needed
2. **Custom fields** - Allow users to add their own fields
3. **Email integration** - Send emails directly from CRM (optional)
4. **Calendar integration** - Link activities to calendar events
5. **File attachments** - Attach files to leads/activities
6. **Reminders/Follow-ups** - Notification system
7. **Import/Export** - CSV import, PDF export
8. **Tags/Labels** - Categorize leads beyond stage

---

*Last updated: 2026-03-18*
