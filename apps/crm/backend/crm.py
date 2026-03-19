"""
Kali's CRM - SQLite Backend
Lightweight CRM for tracking leads across GNB Global and SaltHaus
"""

import sqlite3
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from contextlib import contextmanager
import json

DATABASE_PATH = "kali_crm.db"

# Pipeline stages
STAGES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]
STAGE_DISPLAY = {
    "new": "🆕 New",
    "contacted": "📧 Contacted",
    "qualified": "✅ Qualified",
    "proposal": "📄 Proposal",
    "negotiation": "🤝 Negotiation",
    "won": "🎉 Won",
    "lost": "❌ Lost"
}


def init_db():
    """Initialize the database with required tables."""
    with get_db() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                company TEXT,
                email TEXT,
                phone TEXT,
                source TEXT,
                stage TEXT DEFAULT 'new',
                business_type TEXT DEFAULT 'gnb',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_contacted TIMESTAMP,
                next_followup TIMESTAMP,
                estimated_value REAL,
                deleted INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER NOT NULL,
                activity_type TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads(id)
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
            CREATE INDEX IF NOT EXISTS idx_leads_business ON leads(business_type);
            CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
        """)
        
        # Insert default settings if not exist
        db.execute("""
            INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('business_types', json('["gnb", "salthaus"]'))
        """)


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# Lead Operations
def add_lead(name: str, company: str = None, email: str = None, phone: str = None,
             source: str = None, business_type: str = "gnb", notes: str = None,
             estimated_value: float = None) -> int:
    """Add a new lead."""
    with get_db() as db:
        cursor = db.execute("""
            INSERT INTO leads (name, company, email, phone, source, business_type, notes, estimated_value)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, company, email, phone, source, business_type, notes, estimated_value))
        return cursor.lastrowid


def get_lead(lead_id: int) -> Optional[Dict]:
    """Get a single lead by ID."""
    with get_db() as db:
        row = db.execute("SELECT * FROM leads WHERE id = ? AND deleted = 0", (lead_id,)).fetchone()
        if row:
            return dict(row)
        return None


def get_all_leads(stage: str = None, business_type: str = None, search: str = None) -> List[Dict]:
    """Get all leads with optional filters."""
    query = "SELECT * FROM leads WHERE deleted = 0"
    params = []
    
    if stage:
        query += " AND stage = ?"
        params.append(stage)
    
    if business_type:
        query += " AND business_type = ?"
        params.append(business_type)
    
    if search:
        query += " AND (name LIKE ? OR company LIKE ? OR notes LIKE ?)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])
    
    query += " ORDER BY updated_at DESC"
    
    with get_db() as db:
        return [dict(row) for row in db.execute(query, params).fetchall()]


def update_lead(lead_id: int, **kwargs) -> bool:
    """Update lead fields."""
    allowed_fields = ['name', 'company', 'email', 'phone', 'source', 'stage', 
                      'business_type', 'notes', 'estimated_value', 'last_contacted', 'next_followup']
    
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}
    
    if not updates:
        return False
    
    updates['updated_at'] = datetime.now().isoformat()
    
    set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
    query = f"UPDATE leads SET {set_clause} WHERE id = ?"
    
    with get_db() as db:
        db.execute(query, list(updates.values()) + [lead_id])
        return db.total_changes > 0


def delete_lead(lead_id: int) -> bool:
    """Soft delete a lead."""
    with get_db() as db:
        db.execute("UPDATE leads SET deleted = 1, updated_at = ? WHERE id = ?",
                   (datetime.now().isoformat(), lead_id))
        return db.total_changes > 0


def update_stage(lead_id: int, new_stage: str) -> bool:
    """Move lead to a new pipeline stage."""
    if new_stage not in STAGES:
        return False
    
    with get_db() as db:
        db.execute("""
            UPDATE leads SET stage = ?, updated_at = ?, last_contacted = ?
            WHERE id = ?
        """, (new_stage, datetime.now().isoformat(), datetime.now().isoformat(), lead_id))
        
        # Log the stage change
        db.execute("""
            INSERT INTO activities (lead_id, activity_type, description)
            VALUES (?, 'stage_change', ?)
        """, (lead_id, f"Moved to {STAGE_DISPLAY.get(new_stage, new_stage)}"))
        
        return db.total_changes > 0


# Activity Operations
def add_activity(lead_id: int, activity_type: str, description: str = None) -> int:
    """Log an activity for a lead."""
    with get_db() as db:
        cursor = db.execute("""
            INSERT INTO activities (lead_id, activity_type, description)
            VALUES (?, ?, ?)
        """, (lead_id, activity_type, description))
        
        # Update last_contacted
        db.execute("""
            UPDATE leads SET last_contacted = ?, updated_at = ? WHERE id = ?
        """, (datetime.now().isoformat(), datetime.now().isoformat(), lead_id))
        
        return cursor.lastrowid


def get_activities(lead_id: int, limit: int = 20) -> List[Dict]:
    """Get activities for a lead."""
    with get_db() as db:
        return [dict(row) for row in db.execute("""
            SELECT * FROM activities WHERE lead_id = ? 
            ORDER BY created_at DESC LIMIT ?
        """, (lead_id, limit)).fetchall()]


def get_recent_activities(days: int = 7, limit: int = 50) -> List[Dict]:
    """Get recent activities across all leads."""
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    with get_db() as db:
        return [dict(row) for row in db.execute("""
            SELECT a.*, l.name as lead_name, l.company as lead_company
            FROM activities a
            JOIN leads l ON a.lead_id = l.id
            WHERE a.created_at > ? AND l.deleted = 0
            ORDER BY a.created_at DESC
            LIMIT ?
        """, (cutoff, limit)).fetchall()]


# Dashboard Stats
def get_stats() -> Dict:
    """Get pipeline statistics."""
    with get_db() as db:
        total_leads = db.execute("SELECT COUNT(*) FROM leads WHERE deleted = 0").fetchone()[0]
        
        stage_counts = {}
        for stage in STAGES:
            count = db.execute(
                "SELECT COUNT(*) FROM leads WHERE stage = ? AND deleted = 0", (stage,)
            ).fetchone()[0]
            stage_counts[stage] = count
        
        gnb_count = db.execute(
            "SELECT COUNT(*) FROM leads WHERE business_type = 'gnb' AND deleted = 0"
        ).fetchone()[0]
        
        salthaus_count = db.execute(
            "SELECT COUNT(*) FROM leads WHERE business_type = 'salthaus' AND deleted = 0"
        ).fetchone()[0]
        
        total_value = db.execute(
            "SELECT SUM(estimated_value) FROM leads WHERE stage IN ('qualified', 'proposal', 'negotiation') AND deleted = 0"
        ).fetchone()[0] or 0
        
        won_value = db.execute(
            "SELECT SUM(estimated_value) FROM leads WHERE stage = 'won' AND deleted = 0"
        ).fetchone()[0] or 0
        
        # Recent activity count
        cutoff = (datetime.now() - timedelta(days=7)).isoformat()
        recent_activities = db.execute(
            "SELECT COUNT(*) FROM activities WHERE created_at > ?", (cutoff,)
        ).fetchone()[0]
        
        return {
            "total_leads": total_leads,
            "stage_counts": stage_counts,
            "gnb_count": gnb_count,
            "salthaus_count": salthaus_count,
            "pipeline_value": total_value,
            "won_value": won_value,
            "recent_activities": recent_activities
        }


def get_upcoming_followups(days: int = 7) -> List[Dict]:
    """Get leads with upcoming follow-ups."""
    cutoff = datetime.now()
    future = cutoff + timedelta(days=days)
    
    with get_db() as db:
        return [dict(row) for row in db.execute("""
            SELECT * FROM leads 
            WHERE next_followup IS NOT NULL 
            AND next_followup BETWEEN ? AND ?
            AND deleted = 0
            ORDER BY next_followup
        """, (cutoff.isoformat(), future.isoformat())).fetchall()]


# Quick Add from natural language
def quick_add_lead(text: str) -> Dict:
    """
    Parse natural language and create a lead.
    Examples: "New lead from event - John Smith, Acme Corp"
              "Add lead: Jane Doe, CEO at Company X, from LinkedIn"
    """
    import re
    
    name = None
    company = None
    source = None
    
    # Try to extract name and company
    patterns = [
        r'(?:new lead|add lead|from)\s*[-:]\s*([^,]+),\s*([^,]+)',
        r'([^,]+),\s*([^,]+)\s*(?:from|via)?\s*(.+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            company = match.group(2).strip() if match.lastindex >= 2 else None
            source = match.group(3).strip() if match.lastindex >= 3 else None
            break
    
    if not name:
        # Fallback: use entire text as name
        name = text
    
    # Determine business type
    business_type = "gnb"
    if any(w in text.lower() for w in ["consulting", "salthaus", "sba", "small business"]):
        business_type = "salthaus"
    
    lead_id = add_lead(name=name, company=company, source=source, business_type=business_type)
    add_activity(lead_id, "created", "Lead added via quick add")
    
    return {"id": lead_id, "name": name, "company": company, "source": source}


# Analytics Functions
def get_conversion_rates() -> Dict:
    """Calculate stage-to-stage conversion rates."""
    with get_db() as db:
        stage_counts = {}
        for stage in STAGES:
            count = db.execute(
                "SELECT COUNT(*) FROM leads WHERE stage = ? AND deleted = 0", (stage,)
            ).fetchone()[0]
            stage_counts[stage] = count
        
        total = sum(stage_counts.values())
        
        # Calculate conversion rates
        conversions = {}
        for i, stage in enumerate(STAGES[:-2]):  # Exclude won/lost from rate calc
            next_stage = STAGES[i + 1] if i + 1 < len(STAGES) - 2 else None
            if next_stage and stage_counts[stage] > 0:
                next_count = stage_counts[next_stage]
                rate = (next_count / stage_counts[stage]) * 100
                conversions[f"{stage}_to_{next_stage}"] = round(rate, 1)
        
        return {
            "stage_counts": stage_counts,
            "total_leads": total,
            "conversion_rates": conversions,
            "win_rate": round(stage_counts["won"] / total * 100, 1) if total > 0 else 0
        }


def get_source_analysis() -> List[Dict]:
    """Analyze leads by source."""
    with get_db() as db:
        sources = db.execute("""
            SELECT 
                COALESCE(source, 'Unknown') as source,
                COUNT(*) as count,
                SUM(CASE WHEN stage = 'won' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN stage IN ('qualified', 'proposal', 'negotiation') THEN 1 ELSE 0 END) as in_progress,
                SUM(estimated_value) as total_value
            FROM leads 
            WHERE deleted = 0
            GROUP BY source
            ORDER BY count DESC
        """).fetchall()
        
        return [dict(row) for row in sources]


def get_business_split() -> Dict:
    """Get leads and value split by business type."""
    with get_db() as db:
        result = {}
        for biz in ["gnb", "salthaus"]:
            row = db.execute("""
                SELECT 
                    COUNT(*) as count,
                    SUM(estimated_value) as pipeline_value,
                    SUM(CASE WHEN stage = 'won' THEN estimated_value ELSE 0 END) as won_value
                FROM leads 
                WHERE business_type = ? AND deleted = 0
            """, (biz,)).fetchone()
            
            result[biz] = {
                "count": row[0] or 0,
                "pipeline_value": row[1] or 0,
                "won_value": row[2] or 0
            }
        
        return result


def get_trend_data(days: int = 30) -> Dict:
    """Get lead creation trends over time."""
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    
    with get_db() as db:
        # Leads created per day
        daily = db.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM leads
            WHERE created_at > ? AND deleted = 0
            GROUP BY DATE(created_at)
            ORDER BY date
        """, (cutoff,)).fetchall()
        
        # Stage progression over time
        stages_over_time = {}
        for stage in STAGES:
            rows = db.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                FROM leads
                WHERE created_at > ? AND stage = ? AND deleted = 0
                GROUP BY DATE(created_at)
                ORDER BY date
            """, (cutoff, stage)).fetchall()
            stages_over_time[stage] = [dict(row) for row in rows]
        
        return {
            "daily_leads": [dict(row) for row in daily],
            "stages_over_time": stages_over_time
        }


def get_activity_summary(days: int = 7) -> Dict:
    """Get activity summary."""
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    
    with get_db() as db:
        # Activity by type
        by_type = db.execute("""
            SELECT 
                activity_type,
                COUNT(*) as count
            FROM activities
            WHERE created_at > ?
            GROUP BY activity_type
            ORDER BY count DESC
        """, (cutoff,)).fetchall()
        
        # Total activities
        total = db.execute(
            "SELECT COUNT(*) FROM activities WHERE created_at > ?", (cutoff,)
        ).fetchone()[0]
        
        return {
            "total": total,
            "by_type": [dict(row) for row in by_type]
        }


def get_full_analytics() -> Dict:
    """Get all analytics data."""
    return {
        "conversion_rates": get_conversion_rates(),
        "sources": get_source_analysis(),
        "business_split": get_business_split(),
        "trends": get_trend_data(),
        "activity_summary": get_activity_summary()
    }


if __name__ == "__main__":
    init_db()
    print("Database initialized!")
