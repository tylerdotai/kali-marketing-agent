"""
Kali's CRM - FastAPI Backend Server
Run with: uvicorn server:app --reload --port 8765
"""

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json

from crm import (
    init_db, add_lead, get_lead, get_all_leads, update_lead, delete_lead,
    update_stage, add_activity, get_activities, get_recent_activities,
    get_stats, get_upcoming_followups, quick_add_lead, STAGES, STAGE_DISPLAY,
    DATABASE_PATH, get_full_analytics, get_conversion_rates, get_source_analysis,
    get_business_split, get_trend_data, get_activity_summary
)

app = FastAPI(title="Kali's CRM", version="1.0.0")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
init_db()


# Pydantic models
class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    business_type: str = "gnb"
    notes: Optional[str] = None
    estimated_value: Optional[float] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    business_type: Optional[str] = None
    notes: Optional[str] = None
    estimated_value: Optional[float] = None
    next_followup: Optional[str] = None


class ActivityCreate(BaseModel):
    activity_type: str
    description: Optional[str] = None


class QuickAdd(BaseModel):
    text: str


# API Routes
@app.get("/api/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}


@app.get("/api/stats")
async def stats():
    return get_stats()


@app.get("/api/stages")
async def stages():
    return [{"id": s, "name": STAGE_DISPLAY[s]} for s in STAGES]


@app.get("/api/leads")
async def leads(stage: Optional[str] = None, business_type: Optional[str] = None, search: Optional[str] = None):
    return get_all_leads(stage=stage, business_type=business_type, search=search)


@app.post("/api/leads")
async def create_lead(lead: LeadCreate):
    lead_id = add_lead(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        business_type=lead.business_type,
        notes=lead.notes,
        estimated_value=lead.estimated_value
    )
    add_activity(lead_id, "created", "Lead created via API")
    return {"id": lead_id, "success": True}


@app.get("/api/leads/{lead_id}")
async def get_lead_detail(lead_id: int):
    lead = get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.put("/api/leads/{lead_id}")
async def update_lead_detail(lead_id: int, lead: LeadUpdate):
    data = lead.model_dump(exclude_unset=True)
    if 'next_followup' in data and data['next_followup']:
        # Parse ISO format
        try:
            dt = datetime.fromisoformat(data['next_followup'].replace('Z', '+00:00'))
            data['next_followup'] = dt.isoformat()
        except:
            pass
    
    success = update_lead(lead_id, **data)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}


@app.delete("/api/leads/{lead_id}")
async def delete_lead_detail(lead_id: int):
    success = delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True}


@app.post("/api/leads/{lead_id}/stage")
async def move_stage(lead_id: int, new_stage: str):
    success = update_stage(lead_id, new_stage)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid stage")
    return {"success": True}


@app.post("/api/leads/{lead_id}/activity")
async def create_activity(lead_id: int, activity: ActivityCreate):
    activity_id = add_activity(lead_id, activity.activity_type, activity.description)
    return {"id": activity_id, "success": True}


@app.get("/api/leads/{lead_id}/activities")
async def activities(lead_id: int):
    return get_activities(lead_id)


@app.get("/api/activities")
async def all_activities(days: int = 7):
    return get_recent_activities(days=days)


@app.get("/api/followups")
async def followups(days: int = 7):
    return get_upcoming_followups(days=days)


# Analytics endpoints
@app.get("/api/analytics")
async def analytics():
    """Get full analytics data."""
    return get_full_analytics()


@app.get("/api/analytics/conversions")
async def conversions():
    """Get stage conversion rates."""
    return get_conversion_rates()


@app.get("/api/analytics/sources")
async def sources():
    """Get lead source analysis."""
    return get_source_analysis()


@app.get("/api/analytics/business")
async def business_split():
    """Get business type split."""
    return get_business_split()


@app.get("/api/analytics/trends")
async def trends(days: int = 30):
    """Get trend data."""
    return get_trend_data(days=days)


@app.get("/api/analytics/activity")
async def activity_summary(days: int = 7):
    """Get activity summary."""
    return get_activity_summary(days=days)


@app.post("/api/quick-add")
async def quick_add(quick: QuickAdd):
    result = quick_add_lead(quick.text)
    return result


@app.get("/api/export")
async def export_csv():
    """Export all leads as CSV"""
    leads = get_all_leads()
    
    csv_lines = ["ID,Name,Company,Email,Phone,Source,Stage,Business Type,Notes,Created"]
    for lead in leads:
        csv_lines.append(
            f"{lead['id']},{lead['name']},{lead['company'] or ''},{lead['email'] or ''},"
            f"{lead['phone'] or ''},{lead['source'] or ''},{lead['stage']},"
            f"{lead['business_type']},{lead['notes'] or ''},{lead['created_at']}"
        )
    
    return "\n".join(csv_lines)


# Serve frontend
@app.get("/")
async def root():
    return FileResponse("frontend/index.html")


@app.get("/analytics")
async def analytics():
    return FileResponse("frontend/analytics.html")


@app.get("/app.js")
async def js():
    return FileResponse("frontend/app.js")


@app.get("/app.css")
async def css():
    return FileResponse("frontend/app.css")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
