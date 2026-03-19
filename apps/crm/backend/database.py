"""
CRM Database - SQLite operations
"""
import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'crm.db')

# Ensure data directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Pipeline stages in order
STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won']

# Activity types
ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note', 'stage_change']

def get_db():
    """Get database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables."""
    with get_db() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                company TEXT,
                email TEXT,
                phone TEXT,
                source TEXT,
                value REAL,
                stage TEXT DEFAULT 'new',
                notes TEXT,
                archived INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT,
                last_contacted TEXT
            );
            
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                created_at TEXT,
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            );
            
            CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
            CREATE INDEX IF NOT EXISTS idx_leads_archived ON leads(archived);
            CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
        """)

# ============ LEAD OPERATIONS ============

def create_lead(name: str, company: str = None, email: str = None, phone: str = None,
                source: str = None, value: float = None, stage: str = 'new',
                notes: str = None) -> int:
    """Create a new lead. Returns lead ID."""
    now = datetime.now().isoformat()
    
    with get_db() as db:
        cursor = db.execute("""
            INSERT INTO leads (name, company, email, phone, source, value, stage, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, company, email, phone, source, value, stage, notes, now, now))
        return cursor.lastrowid

def get_lead(lead_id: int) -> Optional[Dict]:
    """Get a single lead by ID."""
    with get_db() as db:
        row = db.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        return dict(row) if row else None

def get_all_leads(stage: str = None, search: str = None, include_archived: bool = False) -> List[Dict]:
    """Get all leads with optional filters."""
    query = "SELECT * FROM leads WHERE archived = ?"
    params = [0 if not include_archived else 0]
    
    if stage:
        query += " AND stage = ?"
        params.append(stage)
    
    if search:
        search_term = f"%{search}%"
        query += " AND (name LIKE ? OR company LIKE ? OR email LIKE ? OR notes LIKE ?)"
        params.extend([search_term, search_term, search_term, search_term])
    
    query += " ORDER BY created_at DESC"
    
    with get_db() as db:
        rows = db.execute(query, params).fetchall()
        return [dict(row) for row in rows]

def update_lead(lead_id: int, **kwargs) -> bool:
    """Update a lead. Returns True if successful."""
    allowed_fields = ['name', 'company', 'email', 'phone', 'source', 'value', 'stage', 'notes', 'archived']
    
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not updates:
        return False
    
    updates['updated_at'] = datetime.now().isoformat()
    
    set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [lead_id]
    
    with get_db() as db:
        db.execute(f"UPDATE leads SET {set_clause} WHERE id = ?", values)
        return True

def delete_lead(lead_id: int) -> bool:
    """Permanently delete a lead."""
    with get_db() as db:
        db.execute("DELETE FROM activities WHERE lead_id = ?", (lead_id,))
        db.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        return True

def move_stage(lead_id: int, new_stage: str) -> bool:
    """Move lead to a new stage."""
    if new_stage not in STAGES:
        return False
    
    now = datetime.now().isoformat()
    
    with get_db() as db:
        db.execute("""
            UPDATE leads SET stage = ?, updated_at = ?, last_contacted = ? WHERE id = ?
        """, (new_stage, now, now, lead_id))
        
        # Log the stage change
        db.execute("""
            INSERT INTO activities (lead_id, type, description, created_at) VALUES (?, 'stage_change', ?, ?)
        """, (lead_id, f"Moved to {new_stage.title()}", now))
        
    return True

# ============ ACTIVITY OPERATIONS ============

def add_activity(lead_id: int, activity_type: str, description: str = None) -> int:
    """Log an activity for a lead."""
    if activity_type not in ACTIVITY_TYPES:
        activity_type = 'note'
    
    now = datetime.now().isoformat()
    
    with get_db() as db:
        # Update last_contacted
        db.execute("UPDATE leads SET last_contacted = ?, updated_at = ? WHERE id = ?",
                   (now, now, lead_id))
        
        cursor = db.execute("""
            INSERT INTO activities (lead_id, type, description, created_at) VALUES (?, ?, ?, ?)
        """, (lead_id, activity_type, description, now))
        return cursor.lastrowid

def get_activities(lead_id: int = None, days: int = 7, limit: int = 50) -> List[Dict]:
    """Get activities, optionally filtered by lead or recency."""
    query = """
        SELECT a.*, l.name as lead_name, l.company as lead_company
        FROM activities a
        JOIN leads l ON a.lead_id = l.id
        WHERE a.created_at >= datetime('now', '-' || ? || ' days')
    """
    params = [days]
    
    if lead_id:
        query += " AND a.lead_id = ?"
        params.append(lead_id)
    
    query += " ORDER BY a.created_at DESC LIMIT ?"
    params.append(limit)
    
    with get_db() as db:
        rows = db.execute(query, params).fetchall()
        return [dict(row) for row in rows]

# ============ PIPELINE & STATS ============

def get_pipeline() -> Dict:
    """Get pipeline view with counts and totals per stage."""
    pipeline = []
    
    with get_db() as db:
        for stage in STAGES:
            row = db.execute("""
                SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as value
                FROM leads WHERE stage = ? AND archived = 0
            """, (stage,)).fetchone()
            
            pipeline.append({
                'id': stage,
                'name': stage.title(),
                'count': row['count'],
                'value': row['value']
            })
    
    # Totals
    totals_row = db.execute("""
        SELECT COUNT(*) as total_leads, COALESCE(SUM(value), 0) as total_value
        FROM leads WHERE archived = 0
    """).fetchone()
    
    return {
        'stages': pipeline,
        'totals': {
            'leads': totals_row['total_leads'],
            'value': totals_row['total_value']
        }
    }

def get_stats() -> Dict:
    """Get summary statistics."""
    with get_db() as db:
        total = db.execute("SELECT COUNT(*) as count FROM leads WHERE archived = 0").fetchone()
        
        total_value = db.execute("""
            SELECT COALESCE(SUM(value), 0) as value FROM leads WHERE archived = 0
        """).fetchone()
        
        won = db.execute("""
            SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as value
            FROM leads WHERE stage = 'won' AND archived = 0
        """).fetchone()
        
        # Calculate conversion rate (won / total that reached proposal+)
        proposal_plus = db.execute("""
            SELECT COUNT(*) as count FROM leads 
            WHERE archived = 0 AND stage IN ('proposal', 'negotiation', 'won')
        """).fetchone()
        
        conversion_rate = 0
        if won['count'] > 0 and proposal_plus['count'] > 0:
            conversion_rate = won['count'] / proposal_plus['count']
        
        avg_deal = 0
        if total['count'] > 0:
            avg_deal = total_value['value'] / total['count']
        
        return {
            'total_leads': total['count'],
            'total_value': total_value['value'],
            'won_value': won['value'],
            'won_count': won['count'],
            'avg_deal_size': avg_deal,
            'conversion_rate': round(conversion_rate, 3)
        }

def export_csv() -> str:
    """Export all leads as CSV."""
    leads = get_all_leads(include_archived=True)
    
    headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Source', 'Stage', 'Value', 'Notes', 'Created']
    rows = [headers]
    
    for lead in leads:
        rows.append([
            str(lead['id']),
            lead['name'] or '',
            lead['company'] or '',
            lead['email'] or '',
            lead['phone'] or '',
            lead['source'] or '',
            lead['stage'],
            str(lead['value'] or ''),
            lead['notes'] or '',
            lead['created_at'] or ''
        ])
    
    return '\n'.join([','.join(row) for row in rows])

# Initialize on import
init_db()
