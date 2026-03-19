"""
CRM Backend Server
FastAPI server for CRM operations
Run: uvicorn server:app --reload --port 8765
"""
import os
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel

import database as db

# ============ PYDANTIC MODELS ============

class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = 'new'
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    notes: Optional[str] = None
    archived: Optional[bool] = None

class StageUpdate(BaseModel):
    stage: str

class ActivityCreate(BaseModel):
    type: str
    description: Optional[str] = None

class QuickAdd(BaseModel):
    text: str

# ============ APP SETUP ============

app = FastAPI(title="CRM API", version="1.0.0")

# Get frontend directory path
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

# ============ HEALTH & INFO ============

@app.get("/api/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/.well-known/skill.md", include_in_schema=False)
async def skill_md():
    """Serve OpenClaw skill manifest."""
    skill_content = """# CRM Agent Skill

## Overview
Lightweight CRM with full API access for lead management and pipeline tracking.

## Base URL
http://localhost:8765/api

## Endpoints

### Leads
- `GET /api/leads` - List all leads (params: ?stage=X&search=Y)
- `GET /api/leads/{id}` - Get single lead
- `POST /api/leads` - Create lead
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/{id}/stage` - Move lead stage (body: {"stage": "qualified"})
- `POST /api/leads/{id}/activity` - Log activity (body: {"type": "call", "description": "..."})
- `GET /api/leads/{id}/activities` - Get lead activities

### Pipeline
- `GET /api/pipeline` - Get pipeline with counts per stage
- `GET /api/stats` - Get summary statistics

### Activities
- `GET /api/activities` - Get recent activities (param: ?days=7)

### Export
- `GET /api/export` - Export leads as CSV

## Lead Fields
| Field | Type | Description |
|-------|------|-------------|
| name | string | Required |
| company | string | Company name |
| email | string | Email address |
| phone | string | Phone number |
| source | string | LinkedIn, Referral, Event, Website, Cold Call |
| value | float | Deal value in USD |
| stage | string | new, contacted, qualified, proposal, negotiation, won |
| notes | string | Free-form notes |

## Pipeline Stages
new → contacted → qualified → proposal → negotiation → won

## Examples

### Add a lead
```
curl -X POST http://localhost:8765/api/leads \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Sarah Johnson", "company": "Acme Corp", "email": "sarah@acme.com", "value": 15000, "source": "LinkedIn"}'
```

### Move lead to qualified
```
curl -X POST http://localhost:8765/api/leads/1/stage \\
  -H "Content-Type: application/json" \\
  -d '{"stage": "qualified"}'
```

### Log a call
```
curl -X POST http://localhost:8765/api/leads/1/activity \\
  -H "Content-Type: application/json" \\
  -d '{"type": "call", "description": "Discovery call - interested in enterprise plan"}'
```

### Search leads
```
curl "http://localhost:8765/api/leads?search=sarah"
```

### Get pipeline
```
curl http://localhost:8765/api/pipeline
```
"""
    return HTMLResponse(content=skill_content)

# ============ LEADS ============

@app.get("/api/leads")
async def list_leads(
    stage: Optional[str] = None,
    search: Optional[str] = None,
    archived: Optional[bool] = False
):
    """List all leads with optional filters."""
    leads = db.get_all_leads(stage=stage, search=search, include_archived=archived)
    return leads

@app.get("/api/leads/{lead_id}")
async def get_lead(lead_id: int):
    """Get a single lead."""
    lead = db.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.post("/api/leads", status_code=201)
async def create_lead(lead: LeadCreate):
    """Create a new lead."""
    lead_id = db.create_lead(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        value=lead.value,
        stage=lead.stage or 'new',
        notes=lead.notes
    )
    
    # Log creation activity
    db.add_activity(lead_id, 'note', 'Lead created')
    
    return {"id": lead_id, "success": True}

@app.put("/api/leads/{lead_id}")
async def update_lead(lead_id: int, lead: LeadUpdate):
    """Update a lead."""
    existing = db.get_lead(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updates = lead.dict(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Handle archived specially (it's stored as int)
    if 'archived' in updates:
        updates['archived'] = 1 if updates['archived'] else 0
    
    db.update_lead(lead_id, **updates)
    return {"success": True}

@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: int):
    """Delete a lead permanently."""
    existing = db.get_lead(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete_lead(lead_id)
    return {"success": True}

@app.post("/api/leads/{lead_id}/stage")
async def move_stage(lead_id: int, update: StageUpdate):
    """Move lead to a new stage."""
    existing = db.get_lead(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if update.stage not in db.STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {db.STAGES}")
    
    success = db.move_stage(lead_id, update.stage)
    return {"success": success}

@app.post("/api/leads/{lead_id}/activity")
async def log_activity(lead_id: int, activity: ActivityCreate):
    """Log an activity for a lead."""
    existing = db.get_lead(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    activity_id = db.add_activity(lead_id, activity.type, activity.description)
    return {"id": activity_id, "success": True}

@app.get("/api/leads/{lead_id}/activities")
async def get_lead_activities(lead_id: int):
    """Get activities for a specific lead."""
    existing = db.get_lead(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    activities = db.get_activities(lead_id=lead_id, days=365)
    return activities

# ============ PIPELINE & STATS ============

@app.get("/api/pipeline")
async def get_pipeline():
    """Get pipeline view with stage counts and totals."""
    return db.get_pipeline()

@app.get("/api/stats")
async def get_stats():
    """Get summary statistics."""
    return db.get_stats()

# ============ ACTIVITIES ============

@app.get("/api/activities")
async def get_activities(days: int = 7):
    """Get recent activities across all leads."""
    return db.get_activities(days=days)

# ============ EXPORT ============

@app.get("/api/export")
async def export_csv():
    """Export all leads as CSV."""
    csv_content = db.export_csv()
    return HTMLResponse(content=csv_content)

# ============ FRONTEND ============

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page."""
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/app.css")
async def css():
    """Serve CSS."""
    return FileResponse(os.path.join(FRONTEND_DIR, "styles.css"))

@app.get("/app.js")
async def js():
    """Serve JavaScript."""
    return FileResponse(os.path.join(FRONTEND_DIR, "app.js"))

# Mount static files as fallback
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
